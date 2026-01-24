'use client';

import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';
import Link from 'next/link';

interface UsageMeterProps {
  reviewsUsed: number;
  reviewsLimit: number;
  isUnlimited: boolean;
  periodEnd: string;
  className?: string;
  showUpgrade?: boolean;
}

export function UsageMeter({
  reviewsUsed,
  reviewsLimit,
  isUnlimited,
  periodEnd,
  className,
  showUpgrade = true,
}: UsageMeterProps) {
  const isAtLimit = !isUnlimited && reviewsUsed >= reviewsLimit;
  const percentUsed = isUnlimited ? 0 : Math.min((reviewsUsed / reviewsLimit) * 100, 100);

  const daysUntilReset = Math.ceil(
    (new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (isUnlimited) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Zap className="w-4 h-4 text-primary" />
        <span>
          <span className="font-medium text-primary">Pro Plan</span> - Unlimited reviews
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{reviewsUsed}</span> / {reviewsLimit} reviews used
        </span>
        {daysUntilReset > 0 && (
          <span className="text-muted-foreground text-xs">
            Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isAtLimit ? 'bg-destructive' : percentUsed >= 50 ? 'bg-yellow-500' : 'bg-primary'
          )}
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {isAtLimit && showUpgrade && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-destructive">Monthly limit reached</span>
          <Link
            href="/subscription"
            className="text-xs font-medium text-primary hover:underline"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
    </div>
  );
}
