/**
 * Utility Functions
 * Pure functions for common operations
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SCORE_THRESHOLDS, SCAN_STATUS, type ScanStatus } from './constants';
import type { Scan, ScanWithReportSummary, DashboardStats } from './types';

// ============================================
// Class Name Utilities
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Date Formatting
// ============================================

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

// ============================================
// Score Utilities
// ============================================

export function getScoreColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.GOOD) return 'text-emerald-600';
  if (score >= SCORE_THRESHOLDS.FAIR) return 'text-amber-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.GOOD) return 'bg-emerald-50';
  if (score >= SCORE_THRESHOLDS.FAIR) return 'bg-amber-50';
  return 'bg-red-50';
}

export function getScoreBorderColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.GOOD) return 'border-emerald-200';
  if (score >= SCORE_THRESHOLDS.FAIR) return 'border-amber-200';
  return 'border-red-200';
}

export function getScoreLabel(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'Good';
  if (score >= SCORE_THRESHOLDS.FAIR) return 'Fair';
  if (score >= SCORE_THRESHOLDS.POOR) return 'Poor';
  return 'Critical';
}

export function getScoreGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'A';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'B';
  if (score >= SCORE_THRESHOLDS.FAIR) return 'C';
  if (score >= SCORE_THRESHOLDS.POOR) return 'D';
  return 'F';
}

// ============================================
// Scan Utilities
// ============================================

export function getScanTarget(scan: Scan | ScanWithReportSummary): string {
  if (scan.githubRepoUrl) {
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

export function getScanTypeLabel(scan: Scan | ScanWithReportSummary): string {
  if (scan.auditType === 'CONVERSION') return 'Conversion Audit';
  if (scan.githubRepoUrl && scan.liveUrl) return 'Full Scan';
  if (scan.githubRepoUrl) return 'Code Scan';
  if (scan.liveUrl) return 'DAST Scan';
  return 'Unknown';
}

export function getScoreDisplayLabel(scan: Scan | ScanWithReportSummary): string {
  return scan.auditType === 'CONVERSION' ? 'Conversion Score' : 'Security Score';
}

export function isScanInProgress(status: ScanStatus): boolean {
  const activeStatuses: ScanStatus[] = [
    SCAN_STATUS.QUEUED,
    SCAN_STATUS.CLONING,
    SCAN_STATUS.SCANNING,
    SCAN_STATUS.ANALYZING,
    SCAN_STATUS.GENERATING_REPORT,
  ];
  return activeStatuses.includes(status);
}

export function isScanComplete(status: ScanStatus): boolean {
  return status === SCAN_STATUS.COMPLETED;
}

export function isScanFailed(status: ScanStatus): boolean {
  return status === SCAN_STATUS.FAILED || status === SCAN_STATUS.CANCELLED;
}

// ============================================
// Stats Calculation
// ============================================

export function calculateDashboardStats(scans: ScanWithReportSummary[]): DashboardStats {
  const totalScans = scans.length;
  const completedScans = scans.filter((s) => s.status === SCAN_STATUS.COMPLETED).length;

  const scansWithScores = scans.filter((s) => s.report?.securityScore !== undefined);
  const averageScore =
    scansWithScores.length > 0
      ? Math.round(
          scansWithScores.reduce((acc, s) => acc + (s.report?.securityScore || 0), 0) /
            scansWithScores.length
        )
      : 0;

  const totalFindings = scans.reduce((acc, s) => acc + (s.report?.totalFindings || 0), 0);
  const criticalFindings = scans.reduce((acc, s) => acc + (s.report?.criticalCount || 0), 0);
  const highFindings = scans.reduce((acc, s) => acc + (s.report?.highCount || 0), 0);

  return {
    totalScans,
    completedScans,
    averageScore,
    totalFindings,
    criticalFindings,
    highFindings,
  };
}

// ============================================
// URL Validation
// ============================================

export function isValidGithubUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'github.com' && parsed.pathname.split('/').filter(Boolean).length >= 2
    );
  } catch {
    return false;
  }
}

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ============================================
// Error Handling
// ============================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

// ============================================
// Pluralization
// ============================================

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}
