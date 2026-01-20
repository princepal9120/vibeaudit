import { Queue, Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config.js';
import { processScanJob } from './scan-worker.js';

export interface ScanJobData {
  scanId: number;
  userId: number;
  githubRepoUrl?: string;
  liveUrl?: string;
  branch: string;
}

let scanQueue: Queue<ScanJobData> | null = null;
let scanWorker: Worker<ScanJobData> | null = null;
let redisConnection: Redis | null = null;

export async function initializeQueue(): Promise<void> {
  // Create Redis connection
  redisConnection = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  // Test connection
  await redisConnection.ping();

  // Create queue
  scanQueue = new Queue<ScanJobData>('scans', {
    connection: redisConnection,
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

  // Create worker
  scanWorker = new Worker<ScanJobData>(
    'scans',
    async (job: Job<ScanJobData>) => {
      return processScanJob(job);
    },
    {
      connection: redisConnection,
      concurrency: 2, // Process 2 scans at a time
      limiter: {
        max: 10,
        duration: 60000, // Max 10 jobs per minute
      },
    }
  );

  // Worker event handlers
  scanWorker.on('completed', (job) => {
    console.log(`✅ Scan job ${job.id} completed for scan ${job.data.scanId}`);
  });

  scanWorker.on('failed', (job, err) => {
    console.error(`❌ Scan job ${job?.id} failed:`, err.message);
  });

  scanWorker.on('error', (err) => {
    console.error('Worker error:', err);
  });
}

export async function addScanJob(data: ScanJobData): Promise<string | undefined> {
  if (!scanQueue) {
    throw new Error('Queue not initialized');
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
  if (scanWorker) {
    await scanWorker.close();
  }
  if (scanQueue) {
    await scanQueue.close();
  }
  if (redisConnection) {
    redisConnection.disconnect();
  }
}
