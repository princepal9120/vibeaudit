/**
 * VibeAudit Scanner Module
 *
 * Main entry point for the security scanning and false positive filtering system.
 * Target: <5% false positive rate through multi-layer validation.
 */

// Core types
export type {
  Severity,
  ScanSource,
  FindingCategory,
  RawFinding,
  TriagedFinding,
  TriageConfig,
  TriageResult,
  TriageStats,
} from './types';

export { DEFAULT_TRIAGE_CONFIG } from './types';

// False positive patterns
export type { FalsePositivePattern } from './false-positives';

export {
  SEMGREP_FALSE_POSITIVES,
  ZAP_FALSE_POSITIVES,
  NPM_AUDIT_FALSE_POSITIVES,
  TRIVY_FALSE_POSITIVES,
  ALL_FALSE_POSITIVE_PATTERNS,
  TEST_FILE_PATTERNS,
  EXAMPLE_FILE_PATTERNS,
  FALSE_SECRET_PATTERNS,
  findMatchingFalsePositivePattern,
  isTestFile,
  isExampleFile,
  containsFalseSecretPattern,
  matchesPattern,
} from './false-positives';

// Triage system
export {
  triageFindings,
  quickFilterCheck,
  sortFindingsByPriority,
  getFindingsNeedingAIValidation,
  applyAIValidationResults,
} from './triage';

// AI validation
export type {
  AIValidationResult,
  BatchValidationRequest,
  LLMClient,
} from './ai-validation';

export {
  validateFinding,
  validateFindingsBatch,
  createMockLLMClient,
  calculateAIValidationImpact,
} from './ai-validation';

// Main scanning pipeline
import type { RawFinding, TriageConfig, TriageResult, TriageStats } from './types';
import { DEFAULT_TRIAGE_CONFIG } from './types';
import { triageFindings, getFindingsNeedingAIValidation, applyAIValidationResults } from './triage';
import type { LLMClient } from './ai-validation';
import { validateFindingsBatch } from './ai-validation';

/**
 * Options for the scanning pipeline
 */
export interface ScanPipelineOptions {
  /** Triage configuration */
  triageConfig?: Partial<TriageConfig>;
  /** LLM client for AI validation (optional) */
  llmClient?: LLMClient;
  /** Whether to run AI validation */
  enableAIValidation?: boolean;
  /** Batch size for AI validation */
  aiBatchSize?: number;
}

/**
 * Result of the complete scanning pipeline
 */
export interface ScanPipelineResult extends TriageResult {
  /** Whether AI validation was performed */
  aiValidationPerformed: boolean;
  /** Number of findings rejected by AI */
  aiRejectedCount: number;
}

/**
 * Run the complete scanning pipeline with all validation layers
 *
 * Pipeline stages:
 * 1. Initial triage (confidence, patterns, context)
 * 2. AI validation for uncertain findings (if enabled)
 * 3. Final filtering and sorting
 *
 * @param rawFindings - Raw findings from security scanning tools
 * @param options - Pipeline configuration options
 * @returns Processed findings with estimated <5% false positive rate
 */
export async function runScanPipeline(
  rawFindings: RawFinding[],
  options: ScanPipelineOptions = {}
): Promise<ScanPipelineResult> {
  const {
    triageConfig = {},
    llmClient,
    enableAIValidation = true,
    aiBatchSize = 5,
  } = options;

  const finalConfig: TriageConfig = {
    ...DEFAULT_TRIAGE_CONFIG,
    ...triageConfig,
    enableAIValidation: enableAIValidation && !!llmClient,
  };

  // Stage 1: Initial triage
  let result = triageFindings(rawFindings, finalConfig);

  let aiValidationPerformed = false;
  let aiRejectedCount = 0;

  // Stage 2: AI validation for uncertain findings
  if (finalConfig.enableAIValidation && llmClient) {
    const needsValidation = getFindingsNeedingAIValidation(result.findings);

    if (needsValidation.length > 0) {
      aiValidationPerformed = true;

      // Run AI validation
      const validationResults = await validateFindingsBatch(needsValidation, llmClient, aiBatchSize);

      // Apply results
      const updatedFindings = applyAIValidationResults(result.findings, validationResults);

      // Count rejections
      aiRejectedCount = updatedFindings.filter(
        f => f.isFiltered && f.filterReason?.includes('AI validation rejected')
      ).length;

      // Recalculate valid/filtered
      const validFindings = updatedFindings.filter(f => !f.isFiltered);
      const filteredFindings = updatedFindings.filter(f => f.isFiltered);

      // Update stats
      const newStats = {
        ...result.stats,
        totalValid: validFindings.length,
        totalFiltered: filteredFindings.length,
        filteredByReason: {
          ...result.stats.filteredByReason,
          aiRejected: aiRejectedCount,
        },
      };

      // Recalculate estimated FP rate
      const avgConfidence = validFindings.length > 0
        ? validFindings.reduce((sum, f) => sum + f.finalConfidence, 0) / validFindings.length
        : 0;
      newStats.estimatedFalsePositiveRate = Math.max(0, Math.min(1, 1 - avgConfidence));

      result = {
        findings: updatedFindings,
        validFindings,
        filteredFindings,
        stats: newStats,
      };
    }
  }

  return {
    ...result,
    aiValidationPerformed,
    aiRejectedCount,
  };
}

/**
 * Quick estimation of false positive rate for a set of findings
 * (without full triage - useful for monitoring)
 */
export function estimateFalsePositiveRate(findings: RawFinding[]): number {
  if (findings.length === 0) return 0;

  let suspectCount = 0;

  for (const finding of findings) {
    // Count findings that are likely false positives
    const isInTestFile =
      /\.(test|spec)\.(js|ts|jsx|tsx)$/i.test(finding.filePath) ||
      /(test|spec|mock|fixture)/i.test(finding.filePath);

    const isLowConfidence = (finding.confidence ?? 0.7) < 0.5;

    const hasPlaceholderSecret =
      finding.category === 'secrets' &&
      finding.codeSnippet &&
      /placeholder|example|changeme|xxx/i.test(finding.codeSnippet);

    if (isInTestFile || isLowConfidence || hasPlaceholderSecret) {
      suspectCount++;
    }
  }

  // Estimated FP rate without filtering
  return suspectCount / findings.length;
}

/**
 * Check if current filtering achieves target false positive rate
 */
export function meetsTargetFPRate(stats: TriageStats, target: number = 0.05): boolean {
  return stats.estimatedFalsePositiveRate <= target;
}
