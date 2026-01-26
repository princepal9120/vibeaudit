/**
 * Core types for the ShipSafe security scanning system
 */

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ScanSource = 'semgrep' | 'zap' | 'npm-audit' | 'trivy' | 'gitleaks';

export type FindingCategory =
  | 'injection'
  | 'secrets'
  | 'auth'
  | 'headers'
  | 'xss'
  | 'csrf'
  | 'dependencies'
  | 'cryptography'
  | 'configuration'
  | 'other';

export interface RawFinding {
  /** Unique identifier from the scanning tool */
  ruleId: string;
  /** Title/name of the finding */
  title: string;
  /** Original severity from the tool */
  severity: Severity;
  /** Which scanner produced this finding */
  source: ScanSource;
  /** Category of vulnerability */
  category: FindingCategory;
  /** File path where the issue was found */
  filePath: string;
  /** Line number (if applicable) */
  lineNumber?: number;
  /** Confidence score from the tool (0-1) */
  confidence?: number;
  /** Code snippet or context */
  codeSnippet?: string;
  /** Raw message from the tool */
  message: string;
  /** Full raw output from the tool */
  rawOutput: Record<string, unknown>;
}

export interface TriagedFinding extends RawFinding {
  /** Adjusted severity after triage */
  adjustedSeverity: Severity;
  /** Final confidence after all validation layers */
  finalConfidence: number;
  /** Whether this finding was filtered out */
  isFiltered: boolean;
  /** Reason for filtering (if filtered) */
  filterReason?: string;
  /** Triage metadata */
  triageMetadata: {
    /** Was this in a test file? */
    isTestFile: boolean;
    /** Was this matched as a known false positive? */
    isKnownFalsePositive: boolean;
    /** Did it fail confidence threshold? */
    failedConfidenceThreshold: boolean;
    /** Was it validated by AI? */
    aiValidated?: boolean;
    /** AI validation result (if applicable) */
    aiValidationScore?: number;
  };
}

export interface TriageConfig {
  /** Minimum confidence threshold (0-1). Findings below this are downgraded */
  confidenceThreshold: number;
  /** Minimum confidence for AI validation (findings between this and confidenceThreshold get AI review) */
  aiValidationThreshold: number;
  /** Whether to filter out test file findings entirely or just downgrade */
  filterTestFiles: boolean;
  /** Whether to use AI validation for uncertain findings */
  enableAIValidation: boolean;
  /** Severities to include in final output */
  includeSeverities: Severity[];
}

export const DEFAULT_TRIAGE_CONFIG: TriageConfig = {
  confidenceThreshold: 0.7,
  aiValidationThreshold: 0.5,
  filterTestFiles: false, // Downgrade instead of filter
  enableAIValidation: true,
  includeSeverities: ['CRITICAL', 'HIGH', 'MEDIUM'],
};

export interface TriageResult {
  /** All findings after triage */
  findings: TriagedFinding[];
  /** Findings that passed all filters */
  validFindings: TriagedFinding[];
  /** Findings that were filtered out */
  filteredFindings: TriagedFinding[];
  /** Statistics about the triage process */
  stats: TriageStats;
}

export interface TriageStats {
  /** Total findings received */
  totalReceived: number;
  /** Findings that passed all filters */
  totalValid: number;
  /** Findings filtered out */
  totalFiltered: number;
  /** Breakdown of filtered findings by reason */
  filteredByReason: {
    lowConfidence: number;
    testFile: number;
    knownFalsePositive: number;
    aiRejected: number;
  };
  /** Estimated false positive rate after filtering */
  estimatedFalsePositiveRate: number;
}
