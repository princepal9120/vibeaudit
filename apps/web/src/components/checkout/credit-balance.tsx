'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldIcon } from '@/components/icons';

interface CreditBalanceProps {
  showBuyButton?: boolean;
  compact?: boolean;
  className?: string;
}

export function CreditBalance({ showBuyButton = true, compact = false, className = '' }: CreditBalanceProps) {
  const [credits, setCredits] = useState<{
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCredits() {
      try {
        const res = await api.getScanCredits();
        setCredits(res);
      } catch (err) {
        console.error('Failed to load credits:', err);
        setError('Failed to load credits');
      } finally {
        setLoading(false);
      }
    }

    loadCredits();
  }, []);

  if (loading) {
    return (
      <Card className={`border-slate-200/60 shadow-sm ${className}`}>
        <CardContent className={compact ? 'py-3' : 'py-4'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !credits) {
    return (
      <Card className={`border-red-200/60 shadow-sm ${className}`}>
        <CardContent className={compact ? 'py-3' : 'py-4'}>
          <div className="text-sm text-red-600">
            {error || 'Unable to load credit balance'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLow = credits.availableCredits <= 1;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`h-6 w-6 rounded-md flex items-center justify-center ${
          isLow ? 'bg-amber-100' : 'bg-emerald-100'
        }`}>
          <ShieldIcon className={`h-3 w-3 ${isLow ? 'text-amber-600' : 'text-emerald-600'}`} />
        </div>
        <span className="text-sm font-medium text-slate-700">
          {credits.availableCredits} credit{credits.availableCredits !== 1 ? 's' : ''}
        </span>
        {showBuyButton && isLow && (
          <Link href="/checkout" className="text-xs text-emerald-600 hover:underline ml-2">
            Buy more
          </Link>
        )}
      </div>
    );
  }

  return (
    <Card className={`border-slate-200/60 shadow-sm ${
      isLow ? 'bg-gradient-to-r from-amber-50 to-amber-50/30' : 'bg-gradient-to-r from-emerald-50 to-emerald-50/30'
    } ${className}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isLow ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              <ShieldIcon className={`h-5 w-5 ${isLow ? 'text-amber-600' : 'text-emerald-600'}`} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">Scan Credits</div>
              <div className="text-sm text-slate-500">
                {credits.usedCredits} of {credits.totalCredits} used
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
              {credits.availableCredits}
            </div>
            {showBuyButton && (
              <Button asChild size="sm" variant={isLow ? 'default' : 'outline'} className={
                isLow ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200'
              }>
                <Link href="/checkout">
                  {isLow ? 'Buy Credits' : 'Buy More'}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function useScanCredits() {
  const [credits, setCredits] = useState<{
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCredits() {
      try {
        const res = await api.getScanCredits();
        setCredits(res);
      } catch (err) {
        console.error('Failed to load credits:', err);
        setError('Failed to load credits');
      } finally {
        setLoading(false);
      }
    }

    loadCredits();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getScanCredits();
      setCredits(res);
      setError(null);
    } catch {
      setError('Failed to refresh credits');
    } finally {
      setLoading(false);
    }
  };

  return { credits, loading, error, refresh };
}
