'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Zap, Loader2, AlertCircle, Crown } from 'lucide-react';
import { api, type SubscriptionPlanDetail } from '@/lib/api';
import { UsageMeter } from '@/components/prd-review';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  const [subscription, setSubscription] = useState<{
    plan: string;
    planName: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null>(null);
  const [usage, setUsage] = useState<{
    reviewsUsed: number;
    reviewsLimit: number;
    isUnlimited: boolean;
    periodStart: string;
    periodEnd: string;
  } | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.all([
        api.getCurrentSubscription(),
        api.getSubscriptionPlans(),
      ]);
      setSubscription(subRes.subscription);
      setUsage(subRes.usage);
      setPlans(plansRes.plans);
      setError(null);
      setPlans(plansRes.plans);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const { checkoutUrl } = await api.createSubscriptionCheckout();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start checkout';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    try {
      setCancelling(true);
      await api.cancelSubscription();
      await fetchData();
      await api.cancelSubscription();
      await fetchData();
      toast.success('Subscription cancelled successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const isPro = subscription?.plan === 'PRO';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
          Manage your PRD Security Review subscription
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-500">Welcome to Pro!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You now have unlimited PRD security reviews. Start analyzing your PRDs with confidence.
            </p>
          </div>
        </div>
      )}

      {cancelled && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-600">Checkout cancelled</p>
            <p className="text-sm text-muted-foreground mt-1">
              You can upgrade anytime to get unlimited PRD reviews.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPro && <Crown className="w-5 h-5 text-primary" />}
              <h3 className="text-lg font-medium text-foreground">
                {subscription?.planName || 'Free'} Plan
              </h3>
              {isPro && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'Unlimited PRD security reviews' : '2 free reviews per month'}
            </p>
          </div>
          {isPro && !subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Plan'}
            </button>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Current Usage</h4>
            <UsageMeter
              reviewsUsed={usage.reviewsUsed}
              reviewsLimit={usage.reviewsLimit}
              isUnlimited={usage.isUnlimited}
              periodEnd={usage.periodEnd}
              showUpgrade={false}
            />
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600">
              Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
              You&apos;ll be moved to the free plan after that.
            </p>
          </div>
        )}
      </div>

      {/* Plans Comparison */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isProPlan = plan.id === 'PRO';

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative p-6 rounded-xl border',
                  isProPlan
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-card border-border'
                )}
              >
                {isProPlan && (
                  <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Recommended
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                      {isProPlan && <Zap className="w-4 h-4 text-primary" />}
                      {plan.name}
                    </h4>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {plan.priceFormatted}
                    </p>
                    <p className="text-sm text-muted-foreground">{plan.reviewsFormatted}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={cn('w-4 h-4 flex-shrink-0 mt-0.5', isProPlan ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-secondary text-muted-foreground text-sm font-medium">
                    Current Plan
                  </div>
                ) : isProPlan ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Upgrade to Pro</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h3 className="text-lg font-medium text-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground">When does my free quota reset?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Your 2 free reviews reset at the beginning of each calendar month.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Yes! You can cancel your Pro subscription anytime. You&apos;ll keep access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">What happens to my reviews if I downgrade?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              All your existing reviews remain accessible. You just won&apos;t be able to create new ones beyond the free tier limit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
