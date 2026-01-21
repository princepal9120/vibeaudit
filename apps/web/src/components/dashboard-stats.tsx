
import { Card, CardContent } from '@/components/ui/card';
import { ShieldIcon, CheckCircleIcon, ChartBarIcon, AlertTriangleIcon } from '@/components/icons';
import { cn, getScoreColor } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';



interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
  description?: string;
  iconBgClassName?: string;
}

function StatCard({ title, value, icon, valueClassName, description, iconBgClassName = 'bg-slate-100' }: StatCardProps) {
  return (
    <Card className="border-slate-200/60 hover:border-emerald-200 hover:shadow-md transition-all group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className={cn('text-3xl font-bold mt-1', valueClassName || 'text-slate-900')}>
              {value}
            </div>
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center transition-colors', iconBgClassName)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


interface DashboardStatsProps {
  stats: DashboardStats;
  className?: string;
}

export function DashboardStatsGrid({ stats, className }: DashboardStatsProps) {
  const scoreDisplay = stats.averageScore > 0 ? `${stats.averageScore}` : '-';
  const scoreColor = stats.averageScore > 0 ? getScoreColor(stats.averageScore) : 'text-slate-400';

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        title="Total Scans"
        value={stats.totalScans}
        icon={<ShieldIcon className="h-5 w-5 text-emerald-600" />}
        iconBgClassName="bg-emerald-50 group-hover:bg-emerald-100"
        description="All time scans"
      />
      <StatCard
        title="Completed"
        value={stats.completedScans}
        valueClassName="text-emerald-600"
        icon={<CheckCircleIcon className="h-5 w-5 text-emerald-600" />}
        iconBgClassName="bg-emerald-50 group-hover:bg-emerald-100"
        description="Successfully analyzed"
      />
      <StatCard
        title="Avg Score"
        value={scoreDisplay}
        valueClassName={scoreColor}
        icon={<ChartBarIcon className="h-5 w-5 text-blue-600" />}
        iconBgClassName="bg-blue-50 group-hover:bg-blue-100"
        description="Security score average"
      />
      <StatCard
        title="Total Findings"
        value={stats.totalFindings}
        valueClassName={stats.criticalFindings > 0 ? 'text-red-600' : 'text-amber-600'}
        icon={<AlertTriangleIcon className={cn('h-5 w-5', stats.criticalFindings > 0 ? 'text-red-600' : 'text-amber-600')} />}
        iconBgClassName={stats.criticalFindings > 0 ? 'bg-red-50 group-hover:bg-red-100' : 'bg-amber-50 group-hover:bg-amber-100'}
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
        <Card key={i} className="border-slate-200/60">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
