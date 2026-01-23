'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SecurityScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // Excellent - Emerald
  if (score >= 75) return '#10B981'; // Good - Emerald
  if (score >= 50) return '#FB923C'; // Moderate - Amber
  if (score >= 25) return '#F97316'; // Poor - Orange
  return '#EF4444'; // Critical - Red
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Work';
  if (score >= 25) return 'Poor';
  return 'Critical';
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
  xl: { width: 200, strokeWidth: 12, fontSize: 'text-5xl', labelSize: 'text-base' },
};

export function SecurityScoreGauge({
  score,
  size = 'md',
  animated = true,
  showLabel = true,
  className,
}: SecurityScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  useEffect(() => {
    if (!animated) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => setDisplayScore(score));
      return;
    }

    // Animate score from 0 to target
    const duration = 1500;
    const startTime = Date.now();
    const startScore = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + (score - startScore) * eased);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(config.fontSize, 'font-bold')}
          style={{ color }}
        >
          {displayScore}
        </span>
        {showLabel && (
          <span
            className={cn(config.labelSize, 'font-medium')}
            style={{ color }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// Simple numeric score display
interface SecurityScoreNumberProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function SecurityScoreNumber({
  score,
  size = 'md',
  showLabel = true,
  className,
}: SecurityScoreNumberProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const sizeClasses = {
    sm: { score: 'text-2xl', label: 'text-xs' },
    md: { score: 'text-4xl', label: 'text-sm' },
    lg: { score: 'text-6xl', label: 'text-base' },
  };

  return (
    <div className={cn('flex flex-col items-end', className)}>
      <span
        className={cn(sizeClasses[size].score, 'font-bold leading-none')}
        style={{ color }}
      >
        {score}
      </span>
      {showLabel && (
        <span
          className={cn(sizeClasses[size].label, 'font-medium')}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
