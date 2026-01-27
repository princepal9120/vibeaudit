'use client';

import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Activity, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/ui/button';
import { useScans } from '@/hooks';
import { calculateDashboardStats, isScanInProgress } from '@/lib/utils';
import { ScansTable, ScansTableSkeleton } from '@/components/scans-table';
import { OverviewChart } from '@/components/dashboard/overview-chart';

export default function DashboardPage() {
  const router = useRouter();
  const { scans, loading, error, refetch } = useScans({
    autoRefresh: true,
    refreshInterval: 5000,
  });

  const hasActiveScans = scans.some((scan) => isScanInProgress(scan.status));
  const stats = calculateDashboardStats(scans);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Monitor your security scans and findings"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => router.push('/scan/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value={stats.totalScans}
          description="All time"
          icon={Activity}
          trend={{
            value: 12.5,
            label: "from last month",
          }}
        />
        <StatsCard
          title="Completed"
          value={stats.completedScans}
          description="Successfully analyzed"
          icon={CheckCircle}
        />
        <StatsCard
          title="Average Score"
          value={stats.averageScore > 0 ? stats.averageScore : '-'}
          description="Security score"
          icon={TrendingUp}
          trend={{
            value: 5.2,
            label: "improvement",
          }}
        />
        <StatsCard
          title="Total Findings"
          value={stats.totalFindings}
          description={`${stats.criticalFindings} critical`}
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-7">
        <OverviewChart scans={scans} className="md:col-span-4 lg:col-span-4" />
        {/* Placeholder for future Recent Activity Feed or breakdown chart */}
        <div className="md:col-span-3 lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center text-muted-foreground text-sm">
          Recent Activity Feed (Coming Soon)
        </div>
      </div>

      {/* Active Scan Indicator */}
      {hasActiveScans && (
        <div className="flex items-center gap-3 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="font-medium">Scans in progress</span>
          <span className="text-green-600/70">- auto-refreshing every 5s</span>
        </div>
      )}

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/scans')}
          >
            View all →
          </Button>
        </div>

        {loading && scans.length === 0 ? (
          <ScansTableSkeleton />
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : scans.length === 0 ? (
          <div className="rounded-lg border border-dashed p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No scans yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Run your first security scan to identify vulnerabilities in your code or live application.
            </p>
            <Button className="mt-6" onClick={() => router.push('/scan/new')}>
              Start Your First Scan
            </Button>
          </div>
        ) : (
          <ScansTable scans={scans.slice(0, 5)} />
        )}
      </div>
    </div>
  );
}
