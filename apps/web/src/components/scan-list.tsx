/**
 * ScanList Component
 * Displays a list of scans with empty state handling
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanCard, ScanCardSkeleton } from '@/components/scan-card';
import { SearchIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ScanWithReportSummary } from '@/lib/types';

// ============================================
// Empty State
// ============================================

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

function EmptyState({
  title = 'No scans yet',
  description = 'Start your first security scan to see results here',
  actionLabel = 'Start Your First Scan',
  actionHref = '/scan/new',
}: EmptyStateProps) {
  return (
    <Card className="border-slate-200/60 border-dashed">
      <CardContent className="py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <SearchIcon className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">{description}</p>
        <Link href={actionHref}>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            {actionLabel}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ============================================
// Error State
// ============================================

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="py-8 text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-6 w-6 text-red-600"
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
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Scans</h3>
        <p className="text-slate-600 mb-4">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="border-slate-200">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Scan List Skeleton
// ============================================

export function ScanListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <ScanCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// Main ScanList Component
// ============================================

interface ScanListProps {
  scans: ScanWithReportSummary[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  emptyStateProps?: EmptyStateProps;
}

export function ScanList({
  scans,
  loading = false,
  error = null,
  onRetry,
  className,
  emptyStateProps,
}: ScanListProps) {
  // Loading state
  if (loading) {
    return <ScanListSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // Empty state
  if (scans.length === 0) {
    return <EmptyState {...emptyStateProps} />;
  }

  // Render scan list
  return (
    <div className={cn('space-y-3', className)}>
      {scans.map((scan) => (
        <ScanCard key={scan.id} scan={scan} />
      ))}
    </div>
  );
}

// ============================================
// ScanList with Header
// ============================================

interface ScanListWithHeaderProps extends ScanListProps {
  title?: string;
  showCount?: boolean;
}

export function ScanListWithHeader({
  title = 'Recent Scans',
  showCount = true,
  scans,
  ...props
}: ScanListWithHeaderProps) {
  const showHeader = !props.loading && !props.error && scans.length > 0;

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {title}
            {showCount && (
              <span className="text-slate-400 font-normal ml-2">({scans.length})</span>
            )}
          </h2>
        </div>
      )}
      <ScanList scans={scans} {...props} />
    </div>
  );
}
