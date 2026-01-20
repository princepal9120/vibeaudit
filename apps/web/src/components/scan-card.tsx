/**
 * ScanCard Component
 * Displays a single scan in the list with status, progress, and findings
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { GitHubIcon, GlobeIcon } from '@/components/icons';
import { StatusBadge, ScoreBadge, FindingsSummary } from '@/components/badges';
import { ProgressBar } from '@/components/loading';
import { cn, formatDate, getScanTarget, isScanInProgress } from '@/lib/utils';
import type { ScanWithReportSummary } from '@/lib/types';
import type { ScanStatus } from '@/lib/constants';

// ============================================
// Scan Type Icon
// ============================================

interface ScanTypeIconProps {
  isGitHub: boolean;
  className?: string;
}

function ScanTypeIcon({ isGitHub, className }: ScanTypeIconProps) {
  const baseClasses = 'h-10 w-10 rounded-lg flex items-center justify-center';

  if (isGitHub) {
    return (
      <div className={cn(baseClasses, 'bg-slate-100', className)}>
        <GitHubIcon className="h-5 w-5 text-slate-700" />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, 'bg-blue-100', className)}>
      <GlobeIcon className="h-5 w-5 text-blue-600" />
    </div>
  );
}

// ============================================
// Scan Progress Section
// ============================================

interface ScanProgressProps {
  status: ScanStatus;
  progress: string | null;
  progressPercent: number | null;
}

function ScanProgress({ status, progress, progressPercent }: ScanProgressProps) {
  if (!isScanInProgress(status) || progressPercent === null) {
    return null;
  }

  return (
    <div className="mt-3">
      <ProgressBar value={progressPercent} label={progress || 'Processing...'} showLabel />
    </div>
  );
}

// ============================================
// Main ScanCard Component
// ============================================

interface ScanCardProps {
  scan: ScanWithReportSummary;
  className?: string;
}

export function ScanCard({ scan, className }: ScanCardProps) {
  const isGitHub = Boolean(scan.githubRepoUrl);
  const target = getScanTarget(scan);
  const hasReport = Boolean(scan.report);
  const showProgress = isScanInProgress(scan.status);

  return (
    <Link href={`/scans/${scan.id}`}>
      <Card
        className={cn(
          'border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer',
          className
        )}
      >
        <CardContent className="py-4">
          {/* Main Row */}
          <div className="flex items-center justify-between">
            {/* Left: Icon + Target Info */}
            <div className="flex items-center gap-4 min-w-0">
              <ScanTypeIcon isGitHub={isGitHub} />
              <div className="min-w-0">
                <div className="font-medium text-slate-900 truncate">{target}</div>
                <div className="text-sm text-slate-500">{formatDate(scan.createdAt)}</div>
              </div>
            </div>

            {/* Right: Score + Findings + Status */}
            <div className="flex items-center gap-4">
              {/* Security Score */}
              {hasReport && scan.report?.securityScore !== undefined && (
                <ScoreBadge score={scan.report.securityScore} size="md" />
              )}

              {/* Findings Summary (compact) */}
              {hasReport && scan.report && (
                <FindingsSummary
                  critical={scan.report.criticalCount}
                  high={scan.report.highCount}
                  compact
                />
              )}

              {/* Status Badge */}
              <StatusBadge status={scan.status} showPulse={showProgress} />
            </div>
          </div>

          {/* Progress Bar (if in progress) */}
          <ScanProgress
            status={scan.status}
            progress={scan.progress}
            progressPercent={scan.progressPercent}
          />
        </CardContent>
      </Card>
    </Link>
  );
}

// ============================================
// ScanCard Skeleton
// ============================================

export function ScanCardSkeleton() {
  return (
    <Card className="border-slate-200">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-6 w-20 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
