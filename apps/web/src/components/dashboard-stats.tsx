
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { ShieldIcon, CheckCircleIcon, ChartBarIcon, AlertTriangleIcon } from '@/components/icons';
import { cn, getScoreColor } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';



interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
  description?: string;
}

function StatCard({ title, value, icon, valueClassName, description }: StatCardProps) {
  return (
    <Card className="border-slate-200 hover:border-slate-300 transition-colors">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardDescription className="text-slate-500 font-medium">{title}</CardDescription>
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold', valueClassName || 'text-slate-900')}>
          {value}
        </div>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}


interface DashboardStatsProps {
  stats: DashboardStats;
  className?: string;
}

export function DashboardStatsGrid({ stats, className }: DashboardStatsProps) {
  const scoreDisplay = stats.averageScore > 0 ? `${stats.averageScore}/100` : '-';
  const scoreColor = stats.averageScore > 0 ? getScoreColor(stats.averageScore) : 'text-slate-400';

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        title="Total Scans"
        value={stats.totalScans}
        icon={<ShieldIcon className="h-4 w-4 text-slate-600" />}
        description="All time scans"
      />
      <StatCard
        title="Completed"
        value={stats.completedScans}
        valueClassName="text-emerald-600"
        icon={<CheckCircleIcon className="h-4 w-4 text-emerald-600" />}
        description="Successfully analyzed"
      />
      <StatCard
        title="Avg Score"
        value={scoreDisplay}
        valueClassName={scoreColor}
        icon={<ChartBarIcon className="h-4 w-4 text-slate-600" />}
        description="Security score average"
      />
      <StatCard
        title="Total Findings"
        value={stats.totalFindings}
        valueClassName={stats.criticalFindings > 0 ? 'text-red-600' : 'text-amber-600'}
        icon={<AlertTriangleIcon className="h-4 w-4 text-amber-600" />}
        description={
          stats.criticalFindings > 0
            ? `${stats.criticalFindings} critical`
            : 'Issues discovered'
        }
      />
    </div>
  );
}


interface CompactStatsProps {
  stats: DashboardStats;
  className?: string;
}

export function CompactStats({ stats, className }: CompactStatsProps) {
  return (
    <div className={cn('flex items-center gap-6 text-sm', className)}>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Scans:</span>
        <span className="font-semibold text-slate-900">{stats.totalScans}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">Completed:</span>
        <span className="font-semibold text-emerald-600">{stats.completedScans}</span>
      </div>
      {stats.averageScore > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Avg Score:</span>
          <span className={cn('font-semibold', getScoreColor(stats.averageScore))}>
            {stats.averageScore}
          </span>
        </div>
      )}
      {stats.totalFindings > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Findings:</span>
          <span className="font-semibold text-amber-600">{stats.totalFindings}</span>
        </div>
      )}
    </div>
  );
}


export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
