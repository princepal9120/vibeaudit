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

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          {/* Scan Type Icon */}
          <div
            className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center',
              isGitHub ? 'bg-slate-100' : 'bg-blue-100'
            )}
          >
            {isGitHub ? (
              <GitHubIcon className="h-6 w-6 text-slate-700" />
            ) : (
              <GlobeIcon className="h-6 w-6 text-blue-600" />
            )}
          </div>
          {/* Target */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 truncate max-w-lg">{target}</h1>
            <p className="text-slate-500 text-sm">
              Started {formatDateLong(scan.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {hasReport && (
          <Link href={`/reports/${scan.report!.id}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <DocumentIcon className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </Link>
        )}
        <Button variant="outline" onClick={onBack} className="border-slate-200">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
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
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardContent className="py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isPolling && <PulsingDot />}
            <span className="text-slate-900 font-medium">
              {scan.progress || 'Processing...'}
            </span>
          </div>
          <StatusBadge status={scan.status} showPulse />
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
    <Card className="border-red-200 bg-red-50">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Scan Failed</h3>
              <p className="text-slate-600">
                {scan.errorMessage || 'An error occurred during the scan'}
              </p>
            </div>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="border-red-200">
              <RefreshIcon className="h-4 w-4 mr-2" />
              Retry
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
    <>
      {/* Score and Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score Card */}
        <SecurityScoreCard score={report.securityScore} showLabel showGrade />

        {/* Findings Summary */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-900">Findings Summary</CardTitle>
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
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {report.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      <FindingsListWithHeader
        findings={report.findings}
        title="Security Findings"
        showCount
      />
    </>
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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-600 mb-6">{message}</p>
          <Button variant="outline" onClick={onBack} className="border-slate-200">
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
