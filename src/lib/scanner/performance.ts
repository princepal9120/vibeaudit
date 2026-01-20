/**
 * Scan Performance Tracking Module
 *
 * Tracks and optimizes scan execution time to achieve <3 minute average.
 * Provides timing utilities, parallel execution, and performance monitoring.
 */

/** Maximum allowed scan time in milliseconds (3 minutes) */
export const MAX_SCAN_TIME_MS = 3 * 60 * 1000;

/** Target scan time for optimization (2.5 minutes to leave buffer) */
export const TARGET_SCAN_TIME_MS = 2.5 * 60 * 1000;

/** Tool execution time limits in milliseconds */
export const TOOL_TIME_LIMITS = {
  semgrep: 60_000, // 60 seconds
  'npm-audit': 30_000, // 30 seconds
  trivy: 45_000, // 45 seconds
  zap: 90_000, // 90 seconds (DAST is slowest)
  gitleaks: 30_000, // 30 seconds
} as const;

export type ScanTool = keyof typeof TOOL_TIME_LIMITS;

/**
 * Timing data for a single tool execution
 */
export interface ToolTiming {
  tool: ScanTool;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  error?: string;
  findingsCount?: number;
}

/**
 * Overall scan performance metrics
 */
export interface ScanPerformanceMetrics {
  scanId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  toolTimings: ToolTiming[];
  parallelExecutionUsed: boolean;
  timeoutOccurred: boolean;
  averageToolTime?: number;
  slowestTool?: ScanTool;
  fastestTool?: ScanTool;
  meetsTarget: boolean;
}

/**
 * Performance tracker for a single scan
 */
export class ScanPerformanceTracker {
  private metrics: ScanPerformanceMetrics;
  private toolTimers: Map<ScanTool, ToolTiming> = new Map();

  constructor(scanId: string) {
    this.metrics = {
      scanId,
      startTime: Date.now(),
      toolTimings: [],
      parallelExecutionUsed: false,
      timeoutOccurred: false,
      meetsTarget: false,
    };
  }

  /**
   * Mark a tool as starting execution
   */
  startTool(tool: ScanTool): void {
    const timing: ToolTiming = {
      tool,
      startTime: Date.now(),
      status: 'running',
    };
    this.toolTimers.set(tool, timing);
    this.metrics.toolTimings.push(timing);
  }

  /**
   * Mark a tool as completed
   */
  completeTool(tool: ScanTool, findingsCount: number): void {
    const timing = this.toolTimers.get(tool);
    if (timing) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;
      timing.status = 'completed';
      timing.findingsCount = findingsCount;
    }
  }

  /**
   * Mark a tool as failed
   */
  failTool(tool: ScanTool, error: string): void {
    const timing = this.toolTimers.get(tool);
    if (timing) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;
      timing.status = 'failed';
      timing.error = error;
    }
  }

  /**
   * Mark a tool as timed out
   */
  timeoutTool(tool: ScanTool): void {
    const timing = this.toolTimers.get(tool);
    if (timing) {
      timing.endTime = Date.now();
      timing.duration = timing.endTime - timing.startTime;
      timing.status = 'timeout';
      this.metrics.timeoutOccurred = true;
    }
  }

  /**
   * Mark the scan as using parallel execution
   */
  setParallelExecution(enabled: boolean): void {
    this.metrics.parallelExecutionUsed = enabled;
  }

  /**
   * Finalize metrics when scan completes
   */
  finalize(): ScanPerformanceMetrics {
    this.metrics.endTime = Date.now();
    this.metrics.totalDuration = this.metrics.endTime - this.metrics.startTime;

    // Calculate tool statistics
    const completedTimings = this.metrics.toolTimings.filter(
      t => t.status === 'completed' && t.duration !== undefined
    );

    if (completedTimings.length > 0) {
      const durations = completedTimings.map(t => t.duration!);
      this.metrics.averageToolTime =
        durations.reduce((a, b) => a + b, 0) / durations.length;

      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      this.metrics.slowestTool = completedTimings.find(
        t => t.duration === maxDuration
      )?.tool;
      this.metrics.fastestTool = completedTimings.find(
        t => t.duration === minDuration
      )?.tool;
    }

    this.metrics.meetsTarget = this.metrics.totalDuration <= TARGET_SCAN_TIME_MS;

    return this.metrics;
  }

  /**
   * Get current elapsed time
   */
  getElapsedTime(): number {
    return Date.now() - this.metrics.startTime;
  }

  /**
   * Check if scan is approaching timeout
   */
  isApproachingTimeout(bufferMs: number = 30_000): boolean {
    return this.getElapsedTime() >= MAX_SCAN_TIME_MS - bufferMs;
  }

  /**
   * Get remaining time before timeout
   */
  getRemainingTime(): number {
    return Math.max(0, MAX_SCAN_TIME_MS - this.getElapsedTime());
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): ScanPerformanceMetrics {
    return { ...this.metrics };
  }
}

/**
 * Create a timeout promise that rejects after the specified time
 */
export function createTimeout<T>(
  ms: number,
  message: string = 'Operation timed out'
): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Execute a function with a timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([
    fn(),
    createTimeout<T>(timeoutMs, timeoutMessage),
  ]);
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult<T> {
  tool: ScanTool;
  success: boolean;
  data?: T;
  error?: string;
  timedOut: boolean;
  duration: number;
}

/**
 * Execute a scanning tool with timeout protection
 */
export async function executeToolWithTimeout<T>(
  tool: ScanTool,
  executor: () => Promise<T>,
  tracker?: ScanPerformanceTracker
): Promise<ToolExecutionResult<T>> {
  const startTime = Date.now();
  const timeLimit = TOOL_TIME_LIMITS[tool];

  tracker?.startTool(tool);

  try {
    const result = await withTimeout(
      executor,
      timeLimit,
      `${tool} execution timed out after ${timeLimit}ms`
    );

    const duration = Date.now() - startTime;

    // Type guard for results with length property
    const findingsCount = result && typeof result === 'object' && 'length' in result
      ? (result as unknown[]).length
      : 0;

    tracker?.completeTool(tool, findingsCount);

    return {
      tool,
      success: true,
      data: result,
      timedOut: false,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.message.includes('timed out');

    if (isTimeout) {
      tracker?.timeoutTool(tool);
    } else {
      tracker?.failTool(tool, error instanceof Error ? error.message : 'Unknown error');
    }

    return {
      tool,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timedOut: isTimeout,
      duration,
    };
  }
}

/**
 * Options for parallel tool execution
 */
export interface ParallelExecutionOptions {
  /** Maximum concurrent tools (default: all) */
  maxConcurrent?: number;
  /** Stop all tools if one fails critically */
  failFast?: boolean;
  /** Performance tracker instance */
  tracker?: ScanPerformanceTracker;
}

/**
 * Execute multiple scanning tools in parallel for optimal performance
 *
 * This is key to achieving <3 minute scan times:
 * - Semgrep, npm-audit, trivy, gitleaks can run concurrently on the code
 * - ZAP runs independently on the live URL
 *
 * Parallel execution reduces total time from sum of all tools to
 * approximately the time of the slowest tool.
 */
export async function executeToolsInParallel<T>(
  toolExecutors: Array<{ tool: ScanTool; executor: () => Promise<T> }>,
  options: ParallelExecutionOptions = {}
): Promise<ToolExecutionResult<T>[]> {
  const { maxConcurrent, failFast = false, tracker } = options;

  tracker?.setParallelExecution(true);

  // If no concurrency limit, run all in parallel
  if (!maxConcurrent || maxConcurrent >= toolExecutors.length) {
    const promises = toolExecutors.map(({ tool, executor }) =>
      executeToolWithTimeout(tool, executor, tracker)
    );

    if (failFast) {
      // Use Promise.all to fail fast on any rejection
      try {
        return await Promise.all(promises);
      } catch {
        // If any fails, still return what we can
        return Promise.allSettled(promises).then(results =>
          results.map((r, i) =>
            r.status === 'fulfilled'
              ? r.value
              : {
                  tool: toolExecutors[i].tool,
                  success: false,
                  error: r.reason?.message || 'Unknown error',
                  timedOut: false,
                  duration: 0,
                }
          )
        );
      }
    }

    // Use Promise.allSettled for resilient execution
    const results = await Promise.allSettled(promises);
    return results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            tool: toolExecutors[i].tool,
            success: false,
            error: r.reason?.message || 'Unknown error',
            timedOut: false,
            duration: 0,
          }
    );
  }

  // Limited concurrency execution
  const results: ToolExecutionResult<T>[] = [];
  const queue = [...toolExecutors];

  async function runNext(): Promise<void> {
    const item = queue.shift();
    if (!item) return;

    const result = await executeToolWithTimeout(item.tool, item.executor, tracker);
    results.push(result);

    if (failFast && !result.success) {
      throw new Error(`Tool ${item.tool} failed: ${result.error}`);
    }

    await runNext();
  }

  // Start initial batch of concurrent executions
  const initialBatch = Math.min(maxConcurrent, queue.length);
  const workers = Array(initialBatch).fill(null).map(() => runNext());

  await Promise.allSettled(workers);

  return results;
}

/**
 * Performance summary for logging/monitoring
 */
export interface PerformanceSummary {
  scanId: string;
  totalTimeSeconds: number;
  meetsTarget: boolean;
  toolBreakdown: Array<{
    tool: string;
    timeSeconds: number;
    status: string;
  }>;
  recommendation?: string;
}

/**
 * Generate a human-readable performance summary
 */
export function generatePerformanceSummary(
  metrics: ScanPerformanceMetrics
): PerformanceSummary {
  const totalTimeSeconds = (metrics.totalDuration || 0) / 1000;

  const summary: PerformanceSummary = {
    scanId: metrics.scanId,
    totalTimeSeconds,
    meetsTarget: metrics.meetsTarget,
    toolBreakdown: metrics.toolTimings.map(t => ({
      tool: t.tool,
      timeSeconds: (t.duration || 0) / 1000,
      status: t.status,
    })),
  };

  // Add recommendations for slow scans
  if (!metrics.meetsTarget && metrics.slowestTool) {
    if (metrics.slowestTool === 'zap') {
      summary.recommendation =
        'Consider using ZAP in quick scan mode or reducing scan depth for faster results';
    } else if (!metrics.parallelExecutionUsed) {
      summary.recommendation =
        'Enable parallel tool execution to significantly reduce scan time';
    } else {
      summary.recommendation = `${metrics.slowestTool} is the bottleneck - consider optimizing its configuration`;
    }
  }

  return summary;
}

/**
 * Check if a scan duration meets the <3 minute target
 */
export function meetsScanTimeTarget(durationMs: number): boolean {
  return durationMs <= MAX_SCAN_TIME_MS;
}

/**
 * Calculate estimated completion time based on progress
 */
export function estimateCompletionTime(
  elapsedMs: number,
  completedTools: number,
  totalTools: number
): number {
  if (completedTools === 0) return MAX_SCAN_TIME_MS;
  const avgTimePerTool = elapsedMs / completedTools;
  const remainingTools = totalTools - completedTools;
  return elapsedMs + avgTimePerTool * remainingTools;
}
