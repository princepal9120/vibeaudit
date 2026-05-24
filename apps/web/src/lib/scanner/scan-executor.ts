/**
 * Scan Executor Module
 *
 * Orchestrates the complete security scan with performance optimization
 * to achieve <3 minute average scan time.
 */

import type { RawFinding, ScanSource } from './types';
import type { ScanPipelineOptions, ScanPipelineResult } from './index';
import { runScanPipeline } from './index';
import {
  ScanPerformanceTracker,
  executeToolsInParallel,
  MAX_SCAN_TIME_MS,
  type ScanTool,
  type ScanPerformanceMetrics,
  type ToolExecutionResult,
} from './performance';

/**
 * Scan target configuration
 */
export interface ScanTarget {
  /** GitHub repository URL or local path */
  repositoryUrl?: string;
  /** Local path to the code (after cloning) */
  localPath?: string;
  /** Live URL for DAST scanning (optional) */
  liveUrl?: string;
  /** Branch to scan (default: main) */
  branch?: string;
}

/**
 * Individual tool executor function type
 */
export type ToolExecutor = (target: ScanTarget) => Promise<RawFinding[]>;

/**
 * Registry of tool executors
 */
export interface ToolExecutorRegistry {
  semgrep?: ToolExecutor;
  'npm-audit'?: ToolExecutor;
  trivy?: ToolExecutor;
  zap?: ToolExecutor;
  gitleaks?: ToolExecutor;
}

/**
 * Scan execution options
 */
export interface ScanExecutionOptions extends ScanPipelineOptions {
  /** Tools to run (default: all available) */
  tools?: ScanTool[];
  /** Enable parallel execution (default: true) */
  parallel?: boolean;
  /** Maximum concurrent tools (default: unlimited) */
  maxConcurrent?: number;
  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;
  /** Progress callback */
  onProgress?: (progress: ScanProgress) => void;
  /** Custom tool executors (for testing or custom implementations) */
  toolExecutors?: ToolExecutorRegistry;
}

/**
 * Scan progress update
 */
export interface ScanProgress {
  /** Current phase of the scan */
  phase: 'initializing' | 'cloning' | 'scanning' | 'analyzing' | 'complete';
  /** Percentage complete (0-100) */
  percentage: number;
  /** Current tool being executed */
  currentTool?: ScanTool;
  /** Tools completed */
  completedTools: ScanTool[];
  /** Tools remaining */
  remainingTools: ScanTool[];
  /** Elapsed time in milliseconds */
  elapsedMs: number;
  /** Estimated remaining time in milliseconds */
  estimatedRemainingMs?: number;
  /** Current status message */
  message: string;
}

/**
 * Complete scan result
 */
export interface ScanExecutionResult {
  /** Unique scan identifier */
  scanId: string;
  /** Pipeline results with triaged findings */
  pipelineResult: ScanPipelineResult;
  /** Performance metrics */
  performance: ScanPerformanceMetrics;
  /** Whether the scan completed within target time */
  meetsTimeTarget: boolean;
  /** Tool-specific results */
  toolResults: ToolExecutionResult<RawFinding[]>[];
  /** Whether the scan was cancelled */
  cancelled: boolean;
  /** Cancellation reason if applicable */
  cancellationReason?: string;
}

/**
 * Default tools to run in a scan
 */
const DEFAULT_CODE_TOOLS: ScanTool[] = ['semgrep', 'npm-audit', 'trivy', 'gitleaks'];
const DEFAULT_DAST_TOOLS: ScanTool[] = ['zap'];

/**
 * Main scan executor class
 *
 * Orchestrates parallel tool execution and ensures scans complete
 * within the 3 minute target time.
 */
export class ScanExecutor {
  private toolExecutors: ToolExecutorRegistry;

  constructor(executors: ToolExecutorRegistry = {}) {
    this.toolExecutors = executors;
  }

  /**
   * Register a tool executor
   */
  registerTool(tool: ScanTool, executor: ToolExecutor): void {
    this.toolExecutors[tool] = executor;
  }

  /**
   * Execute a complete security scan
   */
  async execute(
    target: ScanTarget,
    options: ScanExecutionOptions = {}
  ): Promise<ScanExecutionResult> {
    const scanId = generateScanId();
    const tracker = new ScanPerformanceTracker(scanId);
    const {
      tools,
      parallel = true,
      maxConcurrent,
      abortSignal,
      onProgress,
      toolExecutors = this.toolExecutors,
      ...pipelineOptions
    } = options;

    // Merge custom executors with registered ones
    const executors = { ...this.toolExecutors, ...toolExecutors };

    // Determine which tools to run
    const codeTools = (tools || DEFAULT_CODE_TOOLS).filter(
      t => executors[t] !== undefined && DEFAULT_CODE_TOOLS.includes(t)
    );
    const dastTools = target.liveUrl
      ? (tools || DEFAULT_DAST_TOOLS).filter(
          t => executors[t] !== undefined && DEFAULT_DAST_TOOLS.includes(t)
        )
      : [];
    const allTools = [...codeTools, ...dastTools];

    let cancellationReason: string | undefined;

    // Set up cancellation handler
    const checkCancellation = () => {
      if (abortSignal?.aborted) {
        cancellationReason = 'Scan cancelled by user';
        return true;
      }
      return false;
    };

    // Progress tracking
    const completedTools: ScanTool[] = [];
    const updateProgress = (phase: ScanProgress['phase'], message: string, currentTool?: ScanTool) => {
      if (onProgress) {
        const elapsedMs = tracker.getElapsedTime();
        const remainingTools = allTools.filter(t => !completedTools.includes(t));
        const percentage = allTools.length > 0
          ? Math.round((completedTools.length / allTools.length) * 100)
          : 0;

        onProgress({
          phase,
          percentage,
          currentTool,
          completedTools: [...completedTools],
          remainingTools,
          elapsedMs,
          estimatedRemainingMs: tracker.getRemainingTime(),
          message,
        });
      }
    };

    updateProgress('initializing', 'Initializing scan...');

    // Check for cancellation before starting
    if (checkCancellation()) {
      return createCancelledResult(scanId, tracker, cancellationReason!);
    }

    // Build tool executor list
    const toolExecutorList: Array<{ tool: ScanTool; executor: () => Promise<RawFinding[]> }> = [];

    for (const tool of allTools) {
      const executor = executors[tool];
      if (executor) {
        toolExecutorList.push({
          tool,
          executor: async () => {
            if (checkCancellation()) {
              throw new Error('Scan cancelled');
            }
            updateProgress('scanning', `Running ${tool}...`, tool);
            const findings = await executor(target);
            completedTools.push(tool);
            return findings;
          },
        });
      }
    }

    updateProgress('scanning', 'Running security tools...');

    // Execute tools
    let toolResults: ToolExecutionResult<RawFinding[]>[];

    if (parallel) {
      toolResults = await executeToolsInParallel(toolExecutorList, {
        maxConcurrent,
        tracker,
      });
    } else {
      // Sequential execution (fallback)
      tracker.setParallelExecution(false);
      toolResults = [];
      for (const { tool, executor } of toolExecutorList) {
        if (checkCancellation()) break;
        const startTime = Date.now();
        tracker.startTool(tool);
        try {
          const data = await executor();
          tracker.completeTool(tool, data.length);
          toolResults.push({
            tool,
            success: true,
            data,
            timedOut: false,
            duration: Date.now() - startTime,
          });
        } catch (error) {
          tracker.failTool(tool, error instanceof Error ? error.message : 'Unknown error');
          toolResults.push({
            tool,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timedOut: false,
            duration: Date.now() - startTime,
          });
        }
      }
    }

    // Check if cancelled during execution
    if (checkCancellation()) {
      return createCancelledResult(scanId, tracker, cancellationReason!, toolResults);
    }

    // Collect all findings from successful tools
    const allFindings: RawFinding[] = [];
    for (const result of toolResults) {
      if (result.success && result.data) {
        allFindings.push(...result.data);
      }
    }

    updateProgress('analyzing', 'Analyzing findings...');

    // Run the triage pipeline
    const pipelineResult = await runScanPipeline(allFindings, pipelineOptions);

    // Finalize metrics
    const performance = tracker.finalize();

    updateProgress('complete', 'Scan complete');

    return {
      scanId,
      pipelineResult,
      performance,
      meetsTimeTarget: performance.meetsTarget,
      toolResults,
      cancelled: false,
    };
  }
}

/**
 * Generate a unique scan ID
 */
function generateScanId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `scan_${timestamp}_${random}`;
}

/**
 * Create a result for a cancelled scan
 */
function createCancelledResult(
  scanId: string,
  tracker: ScanPerformanceTracker,
  reason: string,
  toolResults: ToolExecutionResult<RawFinding[]>[] = []
): ScanExecutionResult {
  const performance = tracker.finalize();

  return {
    scanId,
    pipelineResult: {
      findings: [],
      validFindings: [],
      filteredFindings: [],
      stats: {
        totalReceived: 0,
        totalValid: 0,
        totalFiltered: 0,
        filteredByReason: {
          lowConfidence: 0,
          testFile: 0,
          knownFalsePositive: 0,
          aiRejected: 0,
        },
        estimatedFalsePositiveRate: 0,
      },
      aiValidationPerformed: false,
      aiRejectedCount: 0,
    },
    performance,
    meetsTimeTarget: false,
    toolResults,
    cancelled: true,
    cancellationReason: reason,
  };
}

/**
 * Create mock tool executors for testing
 * These simulate realistic tool behavior with appropriate timing
 */
export function createMockToolExecutors(): ToolExecutorRegistry {
  const createMockExecutor = (
    source: ScanSource,
    delayMs: number,
    mockFindings: number
  ): ToolExecutor => {
    return async (): Promise<RawFinding[]> => {
      // Simulate tool execution time
      await new Promise(resolve => setTimeout(resolve, delayMs));

      // Generate mock findings
      const findings: RawFinding[] = [];
      for (let i = 0; i < mockFindings; i++) {
        findings.push({
          ruleId: `${source}-rule-${i}`,
          title: `Mock ${source} finding ${i}`,
          severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'][i % 4] as RawFinding['severity'],
          source,
          category: 'other',
          filePath: `src/mock/file${i}.ts`,
          lineNumber: i * 10,
          confidence: 0.5 + Math.random() * 0.5,
          message: `Mock finding from ${source}`,
          rawOutput: {},
        });
      }

      return findings;
    };
  };

  return {
    semgrep: createMockExecutor('semgrep', 500, 5),
    'npm-audit': createMockExecutor('npm-audit', 300, 3),
    trivy: createMockExecutor('trivy', 400, 2),
    zap: createMockExecutor('zap', 800, 4),
    gitleaks: createMockExecutor('gitleaks', 200, 1),
  };
}

/**
 * Quick scan function for simple usage
 *
 * Executes a full scan with default settings optimized for <3 minute completion.
 */
export async function quickScan(
  target: ScanTarget,
  toolExecutors: ToolExecutorRegistry,
  options?: Partial<ScanExecutionOptions>
): Promise<ScanExecutionResult> {
  const executor = new ScanExecutor(toolExecutors);
  return executor.execute(target, {
    parallel: true,
    ...options,
  });
}

/**
 * Validate that a scan meets the time target
 */
export function validateScanTime(result: ScanExecutionResult): {
  valid: boolean;
  durationMs: number;
  targetMs: number;
  message: string;
} {
  const durationMs = result.performance.totalDuration || 0;
  const valid = durationMs <= MAX_SCAN_TIME_MS;

  return {
    valid,
    durationMs,
    targetMs: MAX_SCAN_TIME_MS,
    message: valid
      ? `Scan completed in ${(durationMs / 1000).toFixed(1)}s (target: ${MAX_SCAN_TIME_MS / 1000}s)`
      : `Scan exceeded time limit: ${(durationMs / 1000).toFixed(1)}s > ${MAX_SCAN_TIME_MS / 1000}s`,
  };
}
