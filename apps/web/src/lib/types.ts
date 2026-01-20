
import type { ScanStatus, Severity, FindingCategory, ScanSource } from './constants';


export interface Finding {
  id: string;
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
  falsePositive: boolean;
  ruleId: string | null;
  createdAt: string;
}


export interface Report {
  id: string;
  scanId: string;
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
  findings: Finding[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportSummary {
  id: string;
  securityScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
}



export interface Scan {
  id: string;
  userId: string;
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
  report: Report | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ScanWithReportSummary extends Omit<Scan, 'report'> {
  report: ReportSummary | null;
}

export interface CreateScanRequest {
  githubRepoUrl?: string;
  liveUrl?: string;
  branch?: string;
}


export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ScansResponse {
  scans: ScanWithReportSummary[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}



export interface DashboardStats {
  totalScans: number;
  completedScans: number;
  averageScore: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
}


export type SortField = 'createdAt' | 'status' | 'securityScore';
export type SortDirection = 'asc' | 'desc';

export interface ScanFilters {
  status?: ScanStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasFindings?: boolean;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}



export type ScanType = 'github' | 'url' | 'both';

export interface ScanFormData {
  scanType: ScanType;
  githubUrl: string;
  liveUrl: string;
  branch: string;
}

export interface ScanFormErrors {
  githubUrl?: string;
  liveUrl?: string;
  branch?: string;
  general?: string;
}
