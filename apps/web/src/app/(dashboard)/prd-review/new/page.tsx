'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Check, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { PrdUploadForm, UsageMeter } from '@/components/prd-review';

const securityFrameworks = [
  'OWASP Top 10',
  'NIST Cybersecurity Framework',
  'SOC 2 Trust Principles',
  'API Security Best Practices',
  'Secrets Management',
  'Compliance (GDPR, CCPA, HIPAA, PCI-DSS)',
];

export default function NewPrdReviewPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<{
    reviewsUsed: number;
    reviewsLimit: number;
    isUnlimited: boolean;
    periodEnd: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await api.getCurrentSubscription();
        setUsage(res.usage);
        // Check if user can submit
        setCanSubmit(res.usage.isUnlimited || res.usage.reviewsUsed < res.usage.reviewsLimit);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const handleSubmit = useCallback(
    async (data: { title: string; content: string; fileName?: string }) => {
      try {
        const review = await api.createPrdReview(data);
        router.push(`/prd-review/${review.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create review');
        throw err;
      }
    },
    [router]
  );

  const isAtLimit = usage && !usage.isUnlimited && usage.reviewsUsed >= usage.reviewsLimit;

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/prd-review"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to PRD Reviews
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">New PRD Security Review</h1>
        <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
          Upload your PRD to analyze it for security gaps across multiple frameworks
        </p>
      </div>

      {/* Usage Info */}
      {loading ? (
        <div className="p-4 rounded-xl bg-card border border-border animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
          <div className="h-2 bg-secondary rounded w-full" />
        </div>
      ) : usage ? (
        <div className="p-4 rounded-xl bg-card border border-border">
          <UsageMeter
            reviewsUsed={usage.reviewsUsed}
            reviewsLimit={usage.reviewsLimit}
            isUnlimited={usage.isUnlimited}
            periodEnd={usage.periodEnd}
          />
        </div>
      ) : null}

      {/* Limit Reached Warning */}
      {isAtLimit && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-3">
          <p className="text-destructive font-medium">Monthly review limit reached</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ve used all your free reviews for this month. Upgrade to Pro for unlimited reviews.
          </p>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Upload Form */}
      {!isAtLimit && (
        <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
          <PrdUploadForm onSubmit={handleSubmit} disabled={!canSubmit} error={error || undefined} />
        </div>
      )}

      {/* What we analyze */}
      <div className="space-y-3 md:space-y-4">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Security Frameworks We Check
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 sm:gap-y-3">
          {securityFrameworks.map((framework) => (
            <div key={framework} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{framework}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What you get */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-medium text-foreground">What You&apos;ll Get</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Security-Enhanced PRD</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your original PRD with security requirements added inline
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Security Findings</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed list of security gaps with severity and recommendations
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Framework Coverage Report</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                See how well your PRD covers each security framework
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Security Score</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overall security maturity score from 0-100
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
