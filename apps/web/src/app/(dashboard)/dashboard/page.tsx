/**
 * Dashboard Page
 * Main dashboard displaying scan history and statistics
 *
 * Features:
 * - Overview statistics (total scans, completed, avg score, findings)
 * - List of recent scans with status and scores
 * - Quick action to start new scan
 * - Auto-refresh for in-progress scans
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardStatsGrid, DashboardStatsSkeleton } from '@/components/dashboard-stats';
import { ScanListWithHeader, ScanListSkeleton } from '@/components/scan-list';
import { PlusIcon, RefreshIcon } from '@/components/icons';
import { useScans } from '@/hooks';
import { calculateDashboardStats, isScanInProgress } from '@/lib/utils';

// ============================================
// Page Header Component
// ============================================

interface PageHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function PageHeader({ onRefresh, isRefreshing }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Monitor your security scans and findings</p>
      </div>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-slate-200 text-slate-600 hover:border-slate-300"
          >
            <RefreshIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
        )}
        <Link href="/scan/new">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <PlusIcon className="h-4 w-4" />
            <span className="ml-2">New Scan</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================
// Main Dashboard Page Component
// ============================================

export default function DashboardPage() {
  // Fetch scans with auto-refresh if any are in progress
  const { scans, loading, error, refetch } = useScans({
    autoRefresh: true,
    refreshInterval: 5000,
  });

  // Check if any scans are in progress
  const hasActiveScans = scans.some((scan) => isScanInProgress(scan.status));

  // Calculate dashboard statistics
  const stats = calculateDashboardStats(scans);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader onRefresh={refetch} isRefreshing={loading && scans.length > 0} />

      {/* Statistics Cards */}
      {loading && scans.length === 0 ? (
        <DashboardStatsSkeleton />
      ) : (
        <DashboardStatsGrid stats={stats} />
      )}

      {/* Active Scan Indicator */}
      {hasActiveScans && (
        <div className="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-medium">Scans in progress</span>
          <span className="text-emerald-500">- auto-refreshing every 5s</span>
        </div>
      )}

      {/* Scans List */}
      {loading && scans.length === 0 ? (
        <div className="space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <ScanListSkeleton count={5} />
        </div>
      ) : (
        <ScanListWithHeader
          scans={scans}
          loading={false}
          error={error}
          onRetry={refetch}
          title="Recent Scans"
          showCount
          emptyStateProps={{
            title: 'No scans yet',
            description:
              'Run your first security scan to identify vulnerabilities in your code or live application.',
            actionLabel: 'Start Your First Scan',
            actionHref: '/scan/new',
          }}
        />
      )}
    </div>
  );
}
