export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ScanSource = 'SEMGREP' | 'ZAP' | 'NPM_AUDIT' | 'TRIVY' | 'GITLEAKS' | 'ADVANCED';

export type FindingCategory =
  | 'INJECTION'
  | 'SECRETS'
  | 'AUTH'
  | 'HEADERS'
  | 'XSS'
  | 'CSRF'
  | 'DEPENDENCIES'
  | 'CRYPTOGRAPHY'
  | 'CONFIGURATION'
  | 'RACE_CONDITION'
  | 'IDOR'
  | 'SSRF'
  | 'MASS_ASSIGNMENT'
  | 'DESERIALIZATION'
  | 'OTHER';

export interface RawFinding {
  title: string;
  severity: Severity;
  category: FindingCategory;
  source: ScanSource;
  description: string;
  impact: string;
  remediation: string;
  filePath?: string;
  lineNumber?: number;
  codeSnippet?: string;
  confidence: number; // 0-1
  ruleId?: string;
  rawFinding: unknown;
}

export interface TriagedFinding extends RawFinding {
  aiValidated: boolean;
}

export interface EnhancedFinding extends TriagedFinding {
  // AI-enhanced fields
  description: string;
  impact: string;
  remediation: string;
}

// Scanner timeout configurations
export const SCANNER_TIMEOUTS = {
  SEMGREP: 60000,    // 60 seconds
  NPM_AUDIT: 30000,  // 30 seconds
  TRIVY: 45000,      // 45 seconds
  ZAP: 90000,        // 90 seconds
  GITLEAKS: 30000,   // 30 seconds
} as const;
