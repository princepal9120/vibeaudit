'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Zap, Loader2, AlertCircle, Crown, Sparkles } from 'lucide-react';
import { api, type SubscriptionPlanDetail } from '@/lib/api';
import { UsageMeter } from '@/components/prd-review';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PRD Review plan data';
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start checkout';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel PRD Review Pro? You will still have access until the end of your billing period.')) {
      return;
    }

    try {
      setCancelling(true);
      await api.cancelSubscription();
      await fetchData();
      toast.success('PRD Review Pro cancelled successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel PRD Review Pro';
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
    <div className="space-y-8 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/prd-review"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to PRD Reviews
      </Link>

      {/* Header */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PRD Review Plans
        </h1>
        <p className="text-muted-foreground mt-1 hidden sm:block">
          Manage your PRD Review plan
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Welcome to PRD Review Pro!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You now have unlimited PRD reviews. Start analyzing your specs with confidence.
            </p>
          </div>
        </motion.div>
      )}

      {cancelled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-600">Checkout cancelled</p>
            <p className="text-sm text-muted-foreground mt-1">
              You can upgrade anytime to unlock unlimited PRD reviews.
            </p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Current Plan */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPro && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-primary" />
                </div>
              )}
              <h3
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {isPro ? 'PRD Review Pro' : 'Free Plan'}
              </h3>
              {isPro && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'Unlimited PRD reviews' : '2 free reviews per month'}
            </p>
          </div>
          {isPro && !subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel PRD Review Pro'}
            </button>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div className="pt-5 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-4">Current Usage</h4>
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
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-600">
              Your PRD Review Pro plan will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
              You&apos;ll be moved to the free plan after that.
            </p>
          </div>
        )}
      </div>

      {/* Plans Comparison */}
      <div className="space-y-5">
        <h3
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          PRD Review Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isProPlan = plan.id === 'PRO';

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: isProPlan ? -4 : -2 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative p-6 rounded-2xl border transition-all',
                  isProPlan
                    ? 'bg-card border-primary/30 shadow-lg'
                    : 'bg-card border-border'
                )}
              >
                {isProPlan && (
                  <>
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary via-primary to-accent" />
                    <div className="absolute -top-3 left-4">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <h4
                      className="text-lg font-bold text-foreground flex items-center gap-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {isProPlan && <Zap className="w-4 h-4 text-primary" />}
                      {plan.name}
                    </h4>
                    <p
                      className="text-3xl font-bold text-foreground mt-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.priceFormatted}
                    </p>
                    <p className="text-sm text-muted-foreground">{plan.reviewsFormatted}</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        isProPlan ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <Check className={cn('w-3 h-3', isProPlan ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium">
                    Current Plan
                  </div>
                ) : isProPlan ? (
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    variant="glow"
                    className="w-full gap-2"
                  >
                    {upgrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Upgrade to PRD Review Pro</span>
                      </>
                    )}
                  </Button>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3
          className="text-lg font-bold text-foreground mb-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Frequently Asked Questions
        </h3>
        <div className="space-y-5">
          {[
            {
              q: 'When does my free quota reset?',
              a: 'Your 2 free reviews reset at the beginning of each calendar month.',
            },
            {
              q: 'Can I cancel PRD Review Pro anytime?',
              a: "Yes. You can cancel PRD Review Pro anytime and keep access until the end of your billing period.",
            },
            {
              q: 'What happens to my reviews if I downgrade?',
              a: "All your existing reviews remain accessible. You just won't be able to create new ones beyond the free PRD review limit.",
            },
          ].map((item, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-foreground">{item.q}</h4>
              <p className="text-sm text-muted-foreground mt-1.5">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
