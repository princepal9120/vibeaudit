'use client';

import { Scan, CheckCircle, BarChart2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function MetricCard({ label, value, change, changeColor = 'text-[#9CA3AF]', icon, iconBg }: MetricCardProps) {
  return (
    <div className="flex-1 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-[#9CA3AF]">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>
      <div className="text-[32px] font-semibold text-[#111827] leading-none mb-2">
        {value}
      </div>
      {change && (
        <span className={cn('text-xs', changeColor)}>{change}</span>
      )}
    </div>
  );
}

interface DashboardStatsProps {
  stats: DashboardStats;
  className?: string;
}

export function DashboardStatsGrid({ stats, className }: DashboardStatsProps) {
  const scoreDisplay = stats.averageScore > 0 ? stats.averageScore : '-';

  return (
    <div className={cn('flex gap-4', className)}>
      <MetricCard
        label="Total Scans"
        value={stats.totalScans}
        change="+12% from last month"
        changeColor="text-[#10B981]"
        icon={<Scan className="w-4 h-4 text-[#10B981]" />}
        iconBg="bg-[#D1FAE5]"
      />
      <MetricCard
        label="Completed"
        value={stats.completedScans}
        change="Successfully analyzed"
        icon={<CheckCircle className="w-4 h-4 text-[#10B981]" />}
        iconBg="bg-[#D1FAE5]"
      />
      <MetricCard
        label="Avg Score"
        value={scoreDisplay}
        change="Security score average"
        icon={<BarChart2 className="w-4 h-4 text-[#F59E0B]" />}
        iconBg="bg-[#FEF3C7]"
      />
      <MetricCard
        label="Total Findings"
        value={stats.totalFindings}
        change={stats.criticalFindings > 0 ? `${stats.criticalFindings} critical issues` : 'Issues discovered'}
        changeColor={stats.criticalFindings > 0 ? 'text-[#DC2626]' : 'text-[#9CA3AF]'}
        icon={<AlertTriangle className="w-4 h-4 text-[#DC2626]" />}
        iconBg="bg-[#FEE2E2]"
      />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="flex gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Compact stats for other views
export function CompactStats({ stats, className }: DashboardStatsProps) {
  return (
    <div className={cn('flex items-center gap-6 text-sm', className)}>
      <div className="flex items-center gap-2">
        <span className="text-[#9CA3AF]">Scans:</span>
        <span className="font-semibold text-[#111827]">{stats.totalScans}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#9CA3AF]">Completed:</span>
        <span className="font-semibold text-[#10B981]">{stats.completedScans}</span>
      </div>
      {stats.averageScore > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[#9CA3AF]">Avg Score:</span>
          <span className="font-semibold text-[#111827]">{stats.averageScore}</span>
        </div>
      )}
    </div>
  );
}
