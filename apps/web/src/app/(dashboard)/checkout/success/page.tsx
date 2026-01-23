'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, ShieldIcon } from '@/components/icons';

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [credits, setCredits] = useState<{ totalCredits: number; usedCredits: number; availableCredits: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredits() {
      try {
        const creditsRes = await api.getScanCredits();
        setCredits(creditsRes);
      } catch (err) {
        console.error('Failed to load credits:', err);
      } finally {
        setLoading(false);
      }
    }

    // Give the webhook some time to process
    const timer = setTimeout(loadCredits, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-8 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Payment Successful!</h1>
        <p className="text-slate-500 mt-2">
          Your scan credits have been added to your account.
        </p>
      </div>

      {/* Credit Balance Card */}
      <Card className="border-slate-200/60 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldIcon className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-lg">Your New Balance</CardTitle>
          <CardDescription className="text-slate-500">Available scan credits</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 w-16 bg-emerald-200 rounded animate-pulse mx-auto" />
          ) : (
            <div className="text-4xl font-bold text-emerald-600">
              {credits?.availableCredits ?? '...'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/scan/new">
            <RocketIcon className="h-4 w-4 mr-2" />
            Start a Scan
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-200">
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* What's Next */}
      <Card className="border-slate-200/60 shadow-sm text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-emerald-600" />
              </div>
              Create a new scan with your GitHub repo or live URL
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-emerald-600" />
              </div>
              Get AI-powered security insights in plain English
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-emerald-600" />
              </div>
              Download or share your professional security report
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Receipt Info */}
      {paymentId && (
        <p className="text-xs text-slate-400">
          Payment ID: {paymentId}
        </p>
      )}
    </div>
  );
}
