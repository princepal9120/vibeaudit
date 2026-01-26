/**
 * Scan Details Page
 * Displays scan progress, results, and findings
 *
 * Features:
 * - Real-time progress updates for in-progress scans
 * - Security score visualization
 * - Expandable findings list
 * - Link to full report
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitHubIcon, GlobeIcon, ArrowLeftIcon, DocumentIcon, RefreshIcon } from '@/components/icons';
import { LoadingOverlay, ProgressBar, PulsingDot } from '@/components/loading';
import { StatusBadge, FindingsSummary } from '@/components/badges';
import { SecurityScoreCard } from '@/components/security-score';
import { FindingsListWithHeader, FindingsListSkeleton } from '@/components/findings-list';
import { useScan } from '@/hooks';
import { cn, formatDateLong, getScanTarget, isScanInProgress, isScanFailed } from '@/lib/utils';
import type { Scan } from '@/lib/types';

// ============================================
// Scan Header Component
// ============================================

interface ScanHeaderProps {
  scan: Scan;
  onBack: () => void;
}

function ScanHeader({ scan, onBack }: ScanHeaderProps) {
  const isGitHub = Boolean(scan.githubRepoUrl);
  const target = getScanTarget(scan);
  const hasReport = Boolean(scan.report);
  const isActive = isScanInProgress(scan.status);
  const isFailed = isScanFailed(scan.status);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-4">
        {/* Scan Type Icon */}
        <div
          className={cn(
            'h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0',
            isGitHub ? 'bg-secondary' : 'bg-blue-500/10'
          )}
        >
          {isGitHub ? (
            <GitHubIcon className="h-7 w-7 text-foreground" />
          ) : (
            <GlobeIcon className="h-7 w-7 text-blue-500" />
          )}
        </div>
        {/* Target */}
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{target}</h1>
            <StatusBadge status={scan.status} showPulse={isActive} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Started {formatDateLong(scan.createdAt)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack} className="border-border hover:bg-secondary">
          <ArrowLeftIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        {hasReport && !isFailed && (
          <Link href={`/reports/${scan.report!.id}`}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              <DocumentIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View Full Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================
// Progress Section Component
// ============================================

interface ProgressSectionProps {
  scan: Scan;
  isPolling: boolean;
}

function ProgressSection({ scan, isPolling }: ProgressSectionProps) {
  const isActive = isScanInProgress(scan.status);

  if (!isActive) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {isPolling && <PulsingDot />}
            <div>
              <span className="text-foreground font-semibold text-lg">
                {scan.progress || 'Processing...'}
              </span>
              <p className="text-sm text-primary mt-0.5">
                Auto-refreshing every 3s
              </p>
            </div>
          </div>
        </div>
        <ProgressBar value={scan.progressPercent || 0} />
      </CardContent>
    </Card>
  );
}

// ============================================
// Error Section Component
// ============================================

interface ErrorSectionProps {
  scan: Scan;
  onRetry?: () => void;
}

function ErrorSection({ scan, onRetry }: ErrorSectionProps) {
  if (!isScanFailed(scan.status)) return null;

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="h-7 w-7 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Scan Failed</h3>
              <p className="text-muted-foreground mt-1">
                {scan.errorMessage || 'An error occurred during the scan'}
              </p>
            </div>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="border-destructive/30 hover:bg-destructive/10 text-destructive">
              <RefreshIcon className="h-4 w-4 mr-2" />
              Retry Scan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Results Section Component
// ============================================

interface ResultsSectionProps {
  scan: Scan;
}

function ResultsSection({ scan }: ResultsSectionProps) {
  const { report } = scan;

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Score and Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Card */}
        <SecurityScoreCard score={report.securityScore} showLabel showGrade />

        {/* Findings Summary */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Findings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <FindingsSummary
              critical={report.criticalCount}
              high={report.highCount}
              medium={report.mediumCount}
              low={report.lowCount}
            />
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      {report.executiveSummary && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {report.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      <div className="pt-4">
        <FindingsListWithHeader
          findings={report.findings}
          title="Security Findings"
          showCount
        />
      </div>
    </div>
  );
}

// ============================================
// Error State Component
// ============================================

interface ErrorPageProps {
  message: string;
  onBack: () => void;
}

function ErrorPage({ message, onBack }: ErrorPageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error</h3>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button variant="outline" onClick={onBack} className="border-border">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Main Scan Details Page Component
// ============================================

export default function ScanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  // Fetch scan with auto-polling when in progress
  const { scan, loading, error, isPolling } = useScan(scanId, {
    pollWhileActive: true,
    pollInterval: 3000,
  });

  const handleBack = () => router.push('/dashboard');

  // Loading state
  if (loading) {
    return <LoadingOverlay message="Loading scan details..." />;
  }

  // Error state
  if (error || !scan) {
    // Only verify toast once if needed, but here we just render error state
    return <ErrorPage message={error || 'Scan not found'} onBack={handleBack} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScanHeader scan={scan} onBack={handleBack} />

      {/* Progress (if in progress) */}
      <ProgressSection scan={scan} isPolling={isPolling} />

      {/* Error (if failed) */}
      <ErrorSection scan={scan} />

      {/* Results (if completed) */}
      <ResultsSection scan={scan} />
    </div>
  );
}
