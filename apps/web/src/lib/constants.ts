/**
 * Application Constants
 * Centralized configuration for the entire application
 */

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  RACE_CONDITION: 'RACE_CONDITION',
  IDOR: 'IDOR',
  SSRF: 'SSRF',
  MASS_ASSIGNMENT: 'MASS_ASSIGNMENT',
  DESERIALIZATION: 'DESERIALIZATION',
  // Launch readiness categories
  SEO: 'SEO',
  PERFORMANCE: 'PERFORMANCE',
  ACCESSIBILITY: 'ACCESSIBILITY',
  ESSENTIALS: 'ESSENTIALS',
  OTHER: 'OTHER',
} as const;

export type FindingCategory = (typeof FINDING_CATEGORY)[keyof typeof FINDING_CATEGORY];

// Launch readiness category set (for filtering/grouping)
export const LAUNCH_READINESS_CATEGORIES = new Set<FindingCategory>([
  FINDING_CATEGORY.SEO,
  FINDING_CATEGORY.PERFORMANCE,
  FINDING_CATEGORY.ACCESSIBILITY,
  FINDING_CATEGORY.ESSENTIALS,
]);

// Scan Sources
export const SCAN_SOURCE = {
  SEMGREP: 'SEMGREP',
  ZAP: 'ZAP',
  NPM_AUDIT: 'NPM_AUDIT',
  TRIVY: 'TRIVY',
  GITLEAKS: 'GITLEAKS',
  ADVANCED: 'ADVANCED',
  SEO_SCANNER: 'SEO_SCANNER',
  PERFORMANCE_SCANNER: 'PERFORMANCE_SCANNER',
  ACCESSIBILITY_SCANNER: 'ACCESSIBILITY_SCANNER',
  ESSENTIALS_SCANNER: 'ESSENTIALS_SCANNER',
} as const;

export type ScanSource = (typeof SCAN_SOURCE)[keyof typeof SCAN_SOURCE];

// Category Configuration for UI
export const CATEGORY_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  // Security categories
  [FINDING_CATEGORY.INJECTION]: { label: 'Injection', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '💉' },
  [FINDING_CATEGORY.SECRETS]: { label: 'Secrets', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '🔑' },
  [FINDING_CATEGORY.AUTH]: { label: 'Auth', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '🔒' },
  [FINDING_CATEGORY.HEADERS]: { label: 'Headers', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '📋' },
  [FINDING_CATEGORY.XSS]: { label: 'XSS', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '⚡' },
  [FINDING_CATEGORY.CSRF]: { label: 'CSRF', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '🔄' },
  [FINDING_CATEGORY.DEPENDENCIES]: { label: 'Dependencies', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: '📦' },
  [FINDING_CATEGORY.CRYPTOGRAPHY]: { label: 'Crypto', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: '🔐' },
  [FINDING_CATEGORY.CONFIGURATION]: { label: 'Config', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: '⚙️' },
  // Launch readiness categories
  [FINDING_CATEGORY.SEO]: { label: 'SEO', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '🔍' },
  [FINDING_CATEGORY.PERFORMANCE]: { label: 'Performance', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: '⚡' },
  [FINDING_CATEGORY.ACCESSIBILITY]: { label: 'Accessibility', className: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: '♿' },
  [FINDING_CATEGORY.ESSENTIALS]: { label: 'Essentials', className: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: '✅' },
  [FINDING_CATEGORY.OTHER]: { label: 'Other', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: '📌' },
};

// Source display labels
export const SOURCE_LABELS: Record<string, string> = {
  [SCAN_SOURCE.SEMGREP]: 'Semgrep',
  [SCAN_SOURCE.ZAP]: 'ZAP',
  [SCAN_SOURCE.NPM_AUDIT]: 'npm audit',
  [SCAN_SOURCE.TRIVY]: 'Trivy',
  [SCAN_SOURCE.GITLEAKS]: 'Gitleaks',
  [SCAN_SOURCE.ADVANCED]: 'Advanced',
  [SCAN_SOURCE.SEO_SCANNER]: 'SEO Check',
  [SCAN_SOURCE.PERFORMANCE_SCANNER]: 'Perf Check',
  [SCAN_SOURCE.ACCESSIBILITY_SCANNER]: 'A11y Check',
  [SCAN_SOURCE.ESSENTIALS_SCANNER]: 'Essentials',
};

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
