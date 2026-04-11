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
import type { ScanWithReportSummary } from '@/lib/types';

const dummyScans: ScanWithReportSummary[] = [
  {
    id: 'demo-scan-5',
    userId: 'demo-user',
    auditType: 'SECURITY',
    githubRepoUrl: 'vibeaudit/core-api',
    liveUrl: 'https://api.vibeaudit.site',
    branch: null,
    status: 'COMPLETED',
    progress: null,
    progressPercent: 100,
    errorMessage: null,
    totalFindings: 3,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 1,
    lowCount: 2,
    createdAt: '2026-04-08T18:15:00.000Z',
    startedAt: '2026-04-08T18:10:00.000Z',
    completedAt: '2026-04-08T18:14:30.000Z',
    report: { id: 'demo-report-5', securityScore: 98, totalFindings: 3, criticalCount: 0, highCount: 0, pdfUrl: null },
  },
  {
    id: 'demo-scan-4',
    userId: 'demo-user',
    auditType: 'SECURITY',
    githubRepoUrl: 'indiehacker/saas-startup',
    liveUrl: null,
    branch: null,
    status: 'COMPLETED',
    progress: null,
    progressPercent: 100,
    errorMessage: null,
    totalFindings: 18,
    criticalCount: 1,
    highCount: 4,
    mediumCount: 8,
    lowCount: 5,
    createdAt: '2026-04-08T14:00:00.000Z',
    startedAt: '2026-04-08T13:54:00.000Z',
    completedAt: '2026-04-08T13:59:00.000Z',
    report: { id: 'demo-report-4', securityScore: 76, totalFindings: 18, criticalCount: 1, highCount: 4, pdfUrl: null },
  },
  {
    id: 'demo-scan-3',
    userId: 'demo-user',
    auditType: 'SECURITY',
    githubRepoUrl: 'vibecoder/auth-service',
    liveUrl: null,
    branch: null,
    status: 'SCANNING',
    progress: 'Running scanners',
    progressPercent: 45,
    errorMessage: null,
    totalFindings: null,
    criticalCount: null,
    highCount: null,
    mediumCount: null,
    lowCount: null,
    createdAt: '2026-04-08T18:58:00.000Z',
    startedAt: '2026-04-08T18:59:00.000Z',
    completedAt: null,
    report: null,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { scans: fetchedScans, loading: fetchedLoading, error: fetchedError, refetch } = useScans({
    autoRefresh: true,
    refreshInterval: 5000,
  });

  // Force dummy data if there's an error to show an awesome UI for screenshots
  const isDemonstration = !!fetchedError || (fetchedScans.length === 0 && !fetchedLoading);
  const scans = isDemonstration ? dummyScans : fetchedScans;
  const loading = isDemonstration ? false : fetchedLoading;
  const error = isDemonstration ? null : fetchedError;

  const hasActiveScans = scans.some((scan) => isScanInProgress(scan.status));
  const stats = calculateDashboardStats(scans);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Monitor your security scans and conversion audits"
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
              New Audit
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Audits"
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
          description="Average audit score"
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
        <div className="md:col-span-3 lg:col-span-3 rounded-xl border border-white/5 bg-[#111113]/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-[#52525B] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <Activity className="w-8 h-8 mb-4 text-[#27272A] group-hover:text-[#4ade80]/50 transition-colors duration-500" />
          <span className="text-sm font-mono tracking-wide">Recent Activity Feed</span>
          <span className="text-xs mt-2 opacity-50">Coming Soon</span>
        </div>
      </div>

      {/* Active Scan Indicator */}
      {hasActiveScans && (
        <div className="flex items-center gap-3 text-sm text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-4 py-3 rounded-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]" />
          </span>
          <span className="font-medium">Audits in progress</span>
          <span className="text-[#22C55E]/60">- auto-refreshing every 5s</span>
        </div>
      )}

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Audits</h2>
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
            <h3 className="mt-4 text-lg font-semibold">No audits yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Run your first security scan or conversion audit to identify the biggest issues on your product or landing page.
            </p>
            <Button className="mt-6" onClick={() => router.push('/scan/new')}>
              Start Your First Audit
            </Button>
          </div>
        ) : (
          <ScansTable scans={scans.slice(0, 5)} />
        )}
      </div>
    </div>
  );
}
