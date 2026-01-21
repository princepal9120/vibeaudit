/**
 * SecurityScore Component
 * Displays security score with visual indicators
 */

import { Card, CardContent } from '@/components/ui/card';
import { SecurityScoreGauge } from '@/components/ui/security-score-gauge';
import {
  cn,
  getScoreColor,
  getScoreBgColor,
  getScoreBorderColor,
  getScoreLabel,
  getScoreGrade,
} from '@/lib/utils';

// ============================================
// Large Score Display
// ============================================

interface SecurityScoreCardProps {
  score: number;
  className?: string;
  showLabel?: boolean;
  showGrade?: boolean;
}

export function SecurityScoreCard({
  score,
  className,
  showLabel = true,
  showGrade = false,
}: SecurityScoreCardProps) {
  const bgColor = getScoreBgColor(score);
  const borderColor = getScoreBorderColor(score);
  const grade = getScoreGrade(score);

  return (
    <Card className={cn('border shadow-sm', bgColor, borderColor, className)}>
      <CardContent className="py-8 flex flex-col items-center justify-center">
        <div className="relative">
          {showGrade && (
            <div
              className={cn(
                'absolute -top-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-white shadow-md',
                getScoreColor(score)
              )}
            >
              {grade}
            </div>
          )}
          <SecurityScoreGauge score={score} size="lg" showLabel={showLabel} />
        </div>
        <div className="text-slate-500 text-sm mt-3">Security Score</div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Compact Score Badge
// ============================================

interface ScoreCompactProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'h-10 w-10',
    text: 'text-sm',
  },
  md: {
    container: 'h-14 w-14',
    text: 'text-lg',
  },
  lg: {
    container: 'h-20 w-20',
    text: 'text-2xl',
  },
};

export function ScoreCompact({ score, size = 'md', className }: ScoreCompactProps) {
  const color = getScoreColor(score);
  const bgColor = getScoreBgColor(score);
  const borderColor = getScoreBorderColor(score);
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center font-bold border',
        bgColor,
        borderColor,
        color,
        config.container,
        config.text,
        className
      )}
    >
      {score}
    </div>
  );
}

// ============================================
// Score with Label
// ============================================

interface ScoreWithLabelProps {
  score: number;
  label?: string;
  className?: string;
}

export function ScoreWithLabel({ score, label = 'Security Score', className }: ScoreWithLabelProps) {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className={cn('text-center', className)}>
      <div className={cn('text-4xl font-bold', color)}>{score}</div>
      <div className="text-slate-500 text-sm mt-1">{label}</div>
      <div className={cn('text-xs font-medium mt-0.5', color)}>{scoreLabel}</div>
    </div>
  );
}

// ============================================
// Score Progress Ring
// ============================================

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // Map text color to stroke color
  const strokeColor = color.replace('text-', 'stroke-');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-100"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-1000 ease-out', strokeColor)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', color)}>{score}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </div>
  );
}

// ============================================
// Score Comparison
// ============================================

interface ScoreComparisonProps {
  currentScore: number;
  previousScore?: number;
  className?: string;
}

export function ScoreComparison({
  currentScore,
  previousScore,
  className,
}: ScoreComparisonProps) {
  const color = getScoreColor(currentScore);
  const diff = previousScore !== undefined ? currentScore - previousScore : undefined;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <ScoreCompact score={currentScore} size="lg" />
      {diff !== undefined && (
        <div className="text-sm">
          {diff > 0 && (
            <span className="text-emerald-600 font-medium">+{diff} points</span>
          )}
          {diff < 0 && (
            <span className="text-red-600 font-medium">{diff} points</span>
          )}
          {diff === 0 && <span className="text-slate-500">No change</span>}
        </div>
      )}
    </div>
  );
}
