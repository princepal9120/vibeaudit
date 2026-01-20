
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG, SEVERITY_CONFIG, type ScanStatus, type Severity } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { PulsingDot } from './loading';



interface StatusBadgeProps {
  status: ScanStatus;
  showPulse?: boolean;
  className?: string;
}

export function StatusBadge({ status, showPulse = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge className={cn('border', config.className, className)}>
      {showPulse && config.isActive && (
        <PulsingDot className="mr-1.5 -ml-0.5" />
      )}
      {config.label}
    </Badge>
  );
}

// ============================================
// Severity Badge
// ============================================

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <Badge className={cn('border', config.className, className)}>
      {severity}
    </Badge>
  );
}

// ============================================
// Count Badge
// ============================================

interface CountBadgeProps {
  count: number;
  severity: Severity;
  label?: string;
  className?: string;
}

export function CountBadge({ count, severity, label, className }: CountBadgeProps) {
  const config = SEVERITY_CONFIG[severity];

  if (count === 0) return null;

  return (
    <span className={cn('text-sm font-medium', config.textClassName, className)}>
      {count} {label || severity.toLowerCase()}
    </span>
  );
}

// ============================================
interface SourceBadgeProps {
  source: string;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium',
        className
      )}
    >
      {source}
    </span>
  );
}



interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

import { getScoreColor, getScoreBgColor, getScoreBorderColor } from '@/lib/utils';

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
  };

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center font-bold border',
        getScoreBgColor(score),
        getScoreBorderColor(score),
        getScoreColor(score),
        sizeClasses[size],
        className
      )}
    >
      {score}
    </div>
  );
}


interface FindingsSummaryProps {
  critical: number;
  high: number;
  medium?: number;
  low?: number;
  compact?: boolean;
  className?: string;
}

export function FindingsSummary({
  critical,
  high,
  medium = 0,
  low = 0,
  compact = false,
  className,
}: FindingsSummaryProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        {critical > 0 && <CountBadge count={critical} severity="CRITICAL" />}
        {high > 0 && <CountBadge count={high} severity="HIGH" />}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-4 gap-4 text-center', className)}>
      <div className="p-3 rounded-lg bg-red-50">
        <div className="text-3xl font-bold text-red-600">{critical}</div>
        <div className="text-sm text-slate-500">Critical</div>
      </div>
      <div className="p-3 rounded-lg bg-amber-50">
        <div className="text-3xl font-bold text-amber-600">{high}</div>
        <div className="text-sm text-slate-500">High</div>
      </div>
      <div className="p-3 rounded-lg bg-yellow-50">
        <div className="text-3xl font-bold text-yellow-600">{medium}</div>
        <div className="text-sm text-slate-500">Medium</div>
      </div>
      <div className="p-3 rounded-lg bg-blue-50">
        <div className="text-3xl font-bold text-blue-600">{low}</div>
        <div className="text-sm text-slate-500">Low</div>
      </div>
    </div>
  );
}
