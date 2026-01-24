'use client';

import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';
import { DashboardStatsGrid, DashboardStatsSkeleton } from '@/components/dashboard-stats';
import { ScansTable, ScansTableSkeleton } from '@/components/scans-table';
import { useScans } from '@/hooks';
import { calculateDashboardStats, isScanInProgress } from '@/lib/utils';

export default function DashboardPage() {
  const { scans, loading, error, refetch } = useScans({
    autoRefresh: true,
    refreshInterval: 5000,
  });

  const hasActiveScans = scans.some((scan) => isScanInProgress(scan.status));
  const stats = calculateDashboardStats(scans);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-1 hidden sm:block">Monitor your security scans and findings</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#E5E7EB] text-[#4B5563] text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/scan/new"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#CCFF00] text-[#111827] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {loading && scans.length === 0 ? (
        <DashboardStatsSkeleton />
      ) : (
        <DashboardStatsGrid stats={stats} />
      )}

      {/* Active Scan Indicator */}
      {hasActiveScans && (
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#10B981] bg-[#D1FAE5]/50 border border-[#10B981]/20 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-full w-full bg-[#10B981]" />
          </span>
          <span className="font-medium">Scans in progress</span>
          <span className="text-[#10B981]/70 hidden sm:inline">- auto-refreshing every 5s</span>
        </div>
      )}

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111827]">Recent Scans</h2>
          <Link href="/scans" className="text-sm text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
            View all &rarr;
          </Link>
        </div>

        {loading && scans.length === 0 ? (
          <ScansTableSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        ) : scans.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] border-dashed p-8 sm:p-16 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-[#10B981]" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#111827] mb-2">No scans yet</h3>
            <p className="text-sm sm:text-base text-[#9CA3AF] mb-6 sm:mb-8 max-w-md mx-auto">
              Run your first security scan to identify vulnerabilities in your code or live application.
            </p>
            <Link
              href="/scan/new"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#CCFF00] text-[#111827] text-sm sm:text-base font-medium hover:opacity-90 transition-opacity"
            >
              Start Your First Scan
            </Link>
          </div>
        ) : (
          <ScansTable scans={scans} />
        )}
      </div>
    </div>
  );
}
