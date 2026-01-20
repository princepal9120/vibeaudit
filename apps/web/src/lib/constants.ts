/**
 * Application Constants
 * Centralized configuration for the entire application
 */

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Scan Status Types
export const SCAN_STATUS = {
  QUEUED: 'QUEUED',
  CLONING: 'CLONING',
  SCANNING: 'SCANNING',
  ANALYZING: 'ANALYZING',
  GENERATING_REPORT: 'GENERATING_REPORT',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type ScanStatus = (typeof SCAN_STATUS)[keyof typeof SCAN_STATUS];

// Severity Levels
export const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

// Finding Categories
export const FINDING_CATEGORY = {
  INJECTION: 'INJECTION',
  SECRETS: 'SECRETS',
  AUTH: 'AUTH',
  HEADERS: 'HEADERS',
  XSS: 'XSS',
  CSRF: 'CSRF',
  DEPENDENCIES: 'DEPENDENCIES',
  CRYPTOGRAPHY: 'CRYPTOGRAPHY',
  CONFIGURATION: 'CONFIGURATION',
  OTHER: 'OTHER',
} as const;

export type FindingCategory = (typeof FINDING_CATEGORY)[keyof typeof FINDING_CATEGORY];

// Scan Sources
export const SCAN_SOURCE = {
  SEMGREP: 'SEMGREP',
  ZAP: 'ZAP',
  NPM_AUDIT: 'NPM_AUDIT',
  TRIVY: 'TRIVY',
  GITLEAKS: 'GITLEAKS',
} as const;

export type ScanSource = (typeof SCAN_SOURCE)[keyof typeof SCAN_SOURCE];

// Status Configuration for UI
export const STATUS_CONFIG: Record<ScanStatus, { className: string; label: string; isActive: boolean }> = {
  [SCAN_STATUS.QUEUED]: {
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Queued',
    isActive: true,
  },
  [SCAN_STATUS.CLONING]: {
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Cloning',
    isActive: true,
  },
  [SCAN_STATUS.SCANNING]: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Scanning',
    isActive: true,
  },
  [SCAN_STATUS.ANALYZING]: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Analyzing',
    isActive: true,
  },
  [SCAN_STATUS.GENERATING_REPORT]: {
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Generating',
    isActive: true,
  },
  [SCAN_STATUS.COMPLETED]: {
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Completed',
    isActive: false,
  },
  [SCAN_STATUS.FAILED]: {
    className: 'bg-red-100 text-red-700 border-red-200',
    label: 'Failed',
    isActive: false,
  },
  [SCAN_STATUS.CANCELLED]: {
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Cancelled',
    isActive: false,
  },
};

// Severity Configuration for UI
export const SEVERITY_CONFIG: Record<Severity, { className: string; bgClassName: string; textClassName: string }> = {
  [SEVERITY.CRITICAL]: {
    className: 'bg-red-100 text-red-700 border-red-200',
    bgClassName: 'bg-red-50',
    textClassName: 'text-red-600',
  },
  [SEVERITY.HIGH]: {
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    bgClassName: 'bg-amber-50',
    textClassName: 'text-amber-600',
  },
  [SEVERITY.MEDIUM]: {
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    bgClassName: 'bg-yellow-50',
    textClassName: 'text-yellow-600',
  },
  [SEVERITY.LOW]: {
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    bgClassName: 'bg-blue-50',
    textClassName: 'text-blue-600',
  },
};

// Score Thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 50,
  POOR: 25,
} as const;

// Polling Configuration
export const POLLING_INTERVAL = 3000; // 3 seconds

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;
