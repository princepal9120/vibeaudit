'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from '@/components/icons';

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto space-y-8 text-center">
      {/* Cancel Icon */}
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
          <XCircleIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>

      {/* Cancel Message */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout Cancelled</h1>
        <p className="text-muted-foreground mt-2">
          Your payment was cancelled. No charges were made.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/checkout">
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Try Again
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-border">
          <Link href="/dashboard">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Why Buy Section */}
      <Card className="border-border shadow-sm text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Why ShipSafe?</CardTitle>
          <CardDescription className="text-muted-foreground">
            Security scanning made simple for indie builders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-primary" />
              </div>
              Comprehensive SAST + DAST scanning
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-primary" />
              </div>
              AI-powered explanations in plain English
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-primary" />
              </div>
              Professional PDF reports for clients
            </li>
            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-3 w-3 text-primary" />
              </div>
              Pay-per-scan, no subscriptions
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Support Link */}
      <p className="text-sm text-muted-foreground">
        Having trouble? <Link href="mailto:support@ShipSafe.dev" className="text-primary hover:underline">Contact support</Link>
      </p>
    </div>
  );
}
