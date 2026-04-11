/**
 * ScanCard Component
 * Displays a single scan in the list with status, progress, and findings
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { GitHubIcon, GlobeIcon, SearchIcon } from '@/components/icons';
import { StatusBadge, ScoreBadge, FindingsSummary } from '@/components/badges';
import { ProgressBar } from '@/components/loading';
import { cn, formatDate, getScanTarget, getScanTypeLabel, isScanInProgress } from '@/lib/utils';
import type { ScanWithReportSummary } from '@/lib/types';
import type { ScanStatus } from '@/lib/constants';

// ============================================
// Scan Type Icon
// ============================================

interface ScanTypeIconProps {
  scan: ScanWithReportSummary;
  className?: string;
}

function ScanTypeIcon({ scan, className }: ScanTypeIconProps) {
  const baseClasses = 'h-11 w-11 rounded-xl flex items-center justify-center transition-colors';

  if (scan.auditType === 'CONVERSION') {
    return (
      <div className={cn(baseClasses, 'bg-violet-500/10 group-hover:bg-violet-500/20', className)}>
        <SearchIcon className="h-5 w-5 text-violet-500" />
      </div>
    );
  }

  if (scan.githubRepoUrl) {
    return (
      <div className={cn(baseClasses, 'bg-[#27272A] group-hover:bg-[#3F3F46]', className)}>
        <GitHubIcon className="h-5 w-5 text-white" />
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, 'bg-[#3B82F6]/10 group-hover:bg-[#3B82F6]/20', className)}>
      <GlobeIcon className="h-5 w-5 text-[#3B82F6]" />
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
  const target = getScanTarget(scan);
  const hasReport = Boolean(scan.report);
  const showProgress = isScanInProgress(scan.status);

  return (
    <Link href={`/scans/${scan.id}`}>
      <Card
        className={cn(
          'border-[#27272A] hover:border-[#3F3F46] hover:bg-[#18181B]/60 transition-all cursor-pointer group',
          className
        )}
      >
        <CardContent className="py-4">
          {/* Main Row */}
          <div className="flex items-center justify-between">
            {/* Left: Icon + Target Info */}
            <div className="flex items-center gap-4 min-w-0">
              <ScanTypeIcon scan={scan} />
              <div className="min-w-0">
                <div className="font-semibold text-white truncate group-hover:text-[#A1A1AA] transition-colors">{target}</div>
                <div className="text-sm text-[#71717A]">
                  {getScanTypeLabel(scan)} • {formatDate(scan.createdAt)}
                </div>
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
    <Card className="border-[#27272A]">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-[#27272A] animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-[#27272A] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[#27272A] rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#27272A] animate-pulse" />
            <div className="h-6 w-20 rounded bg-[#27272A] animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
