import { Queue, Worker, type Job } from 'bullmq';
import { config } from '../config.js';
import { processScanJob } from './scan-worker.js';

export interface ScanJobData {
  scanId: string;
  userId: string;
  auditType?: 'SECURITY' | 'CONVERSION';
  githubRepoUrl?: string;
  liveUrl?: string;
  branch?: string;
}

export interface QueueInitializationResult {
  available: boolean;
  reason?: string;
}

// BullMQ connection options using URL
const connectionOptions = {
  url: config.redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const scanWorkerDisabledReason =
  'Scan worker is disabled for request-metered Redis deployments. ' +
  'Set ENABLE_SCAN_WORKER=true on a dedicated worker service if you want this instance to process scans.';

let scanQueue: Queue<ScanJobData> | null = null;
let scanWorker: Worker<ScanJobData> | null = null;
let queueInitializationPromise: Promise<QueueInitializationResult> | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function attachQueueEventHandlers(worker: Worker<ScanJobData>, queue: Queue<ScanJobData>): void {
  worker.on('completed', (job) => {
    console.log(`✅ Scan job ${job.id} completed for scan ${job.data.scanId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Scan job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
  });

  queue.on('error', (error) => {
    console.error('Queue error:', error);
  });
}

export async function initializeQueue(): Promise<QueueInitializationResult> {
  if (!config.enableScanWorker) {
    return {
      available: false,
      reason: scanWorkerDisabledReason,
    };
  }

  if (scanQueue && scanWorker) {
    return { available: true };
  }

  if (queueInitializationPromise) {
    return queueInitializationPromise;
  }

  queueInitializationPromise = (async () => {
    const queue = new Queue<ScanJobData>('scans', {
      connection: connectionOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          count: 50, // Keep last 50 failed jobs
        },
      },
    });

    const worker = new Worker<ScanJobData>(
      'scans',
      async (job: Job<ScanJobData>) => {
        return processScanJob(job);
      },
      {
        connection: connectionOptions,
        concurrency: 2, // Process 2 scans at a time
        limiter: {
          max: 10,
          duration: 60000, // Max 10 jobs per minute
        },
      }
    );

    attachQueueEventHandlers(worker, queue);

    scanQueue = queue;
    scanWorker = worker;

    try {
      await Promise.all([
        queue.waitUntilReady(),
        worker.waitUntilReady(),
      ]);

      return { available: true };
    } catch (error) {
      const reason = getErrorMessage(error);
      await closeQueue();
      return {
        available: false,
        reason,
      };
    } finally {
      queueInitializationPromise = null;
    }
  })();

  return queueInitializationPromise;
}

export async function addScanJob(data: ScanJobData): Promise<string | undefined> {
  if (!scanQueue) {
    const result = await initializeQueue();
    if (!result.available || !scanQueue) {
      throw new Error(result.reason || 'Queue not initialized');
    }
  }

  const job = await scanQueue.add(`scan-${data.scanId}`, data, {
    priority: 1, // Higher priority = processed first
  });

  return job.id;
}

export async function getScanJobStatus(jobId: string): Promise<{
  status: string;
  progress: number;
  failedReason?: string;
} | null> {
  if (!scanQueue) {
    return null;
  }

  const job = await scanQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress as number || 0;

  return {
    status: state,
    progress,
    failedReason: job.failedReason,
  };
}

export async function closeQueue(): Promise<void> {
  const queue = scanQueue;
  const worker = scanWorker;

  scanQueue = null;
  scanWorker = null;

  await Promise.allSettled([
    worker ? worker.close() : Promise.resolve(),
    queue ? queue.close() : Promise.resolve(),
  ]);
}
