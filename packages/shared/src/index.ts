// Shared types between frontend and backend

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ScanStatus =
  | 'QUEUED'
  | 'CLONING'
  | 'SCANNING'
  | 'ANALYZING'
  | 'GENERATING_REPORT'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

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
  | 'OTHER';

export type ScanSource = 'SEMGREP' | 'ZAP' | 'NPM_AUDIT' | 'TRIVY' | 'GITLEAKS';

// User
export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  githubId: string | null;
  createdAt: string;
  scanCount?: number;
}

// Scan
export interface Scan {
  id: number;
  userId: number;
  githubRepoUrl: string | null;
  liveUrl: string | null;
  branch: string | null;
  status: ScanStatus;
  progress: string | null;
  progressPercent: number | null;
  errorMessage: string | null;
  totalFindings: number | null;
  criticalCount: number | null;
  highCount: number | null;
  mediumCount: number | null;
  lowCount: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  report?: ReportSummary | null;
}

export interface ReportSummary {
  id: number;
  securityScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
}

// Report
export interface Report {
  id: number;
  scanId: number;
  userId: number;
  securityScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  executiveSummary: string | null;
  pdfUrl: string | null;
  shareToken: string | null;
  shareExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  scan?: {
    githubRepoUrl: string | null;
    liveUrl: string | null;
    branch: string | null;
    createdAt: string;
    completedAt: string | null;
  };
  findings?: Finding[];
}

// Finding
export interface Finding {
  id: number;
  reportId: number;
  title: string;
  severity: Severity;
  category: FindingCategory;
  source: ScanSource;
  description: string;
  impact: string;
  remediation: string;
  filePath: string | null;
  lineNumber: number | null;
  codeSnippet: string | null;
  confidence: number;
  aiValidated: boolean;
  ruleId: string | null;
  createdAt: string;
}

// API Request/Response types
export interface CreateScanRequest {
  githubRepoUrl?: string;
  liveUrl?: string;
  branch?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShareLinkResponse {
  shareUrl: string;
  expiresAt: string;
}

export interface ScanProgress {
  status: ScanStatus;
  progress: string | null;
  progressPercent: number | null;
  errorMessage: string | null;
}

// Utility functions
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'red';
    case 'HIGH':
      return 'orange';
    case 'MEDIUM':
      return 'yellow';
    case 'LOW':
      return 'blue';
    default:
      return 'gray';
  }
}

export function getScoreColor(score: number): 'red' | 'yellow' | 'green' {
  if (score < 50) return 'red';
  if (score < 75) return 'yellow';
  return 'green';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Poor';
  return 'Critical';
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
}

export function getScanTarget(scan: Scan): string {
  if (scan.githubRepoUrl) {
    // Extract repo name from URL
    const match = scan.githubRepoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : scan.githubRepoUrl;
  }
  if (scan.liveUrl) {
    try {
      return new URL(scan.liveUrl).hostname;
    } catch {
      return scan.liveUrl;
    }
  }
  return 'Unknown';
}
