import DodoPayments from 'dodopayments';
import { startOfMonth, endOfMonth } from 'date-fns';
import { prisma } from '../db.js';
import { config } from '../config.js';
import type { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

// Subscription pricing configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    reviewsPerMonth: 2,
    description: '2 PRD reviews per month',
  },
  PRO: {
    id: 'prd-pro-monthly',
    name: 'Pro',
    price: 1900, // $19 in cents
    reviewsPerMonth: -1, // Unlimited
    description: 'Unlimited PRD reviews',
  },
} as const;

// Initialize Dodo Payments client
const dodo = new DodoPayments({
  bearerToken: config.dodoPaymentsApiKey,
  environment: config.dodoPaymentsEnvironment === 'live_mode' ? 'live_mode' : 'test_mode',
});

/**
 * Get or create the current month's usage record for a user
 * Uses lazy evaluation - creates new record if current month doesn't exist
 */
export async function getCurrentUsage(userId: string): Promise<{
  reviewsUsed: number;
  reviewsLimit: number;
  periodStart: Date;
  periodEnd: Date;
}> {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  // Get user's subscription to determine limit
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan || 'FREE';
  const reviewsLimit = plan === 'PRO' ? -1 : SUBSCRIPTION_PLANS.FREE.reviewsPerMonth;

  // Upsert usage record for current month
  const usage = await prisma.prdUsage.upsert({
    where: {
      userId_periodStart: {
        userId,
        periodStart,
      },
    },
    create: {
      userId,
      periodStart,
      periodEnd,
      reviewsUsed: 0,
      reviewsLimit,
    },
    update: {
      // Update limit in case subscription changed
      reviewsLimit,
    },
  });

  return {
    reviewsUsed: usage.reviewsUsed,
    reviewsLimit: usage.reviewsLimit,
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
  };
}

/**
 * Check if user can create a new PRD review
 */
export async function canCreateReview(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  usage?: {
    reviewsUsed: number;
    reviewsLimit: number;
  };
}> {
  const usage = await getCurrentUsage(userId);

  // Unlimited (-1) means PRO plan
  if (usage.reviewsLimit === -1) {
    return {
      allowed: true,
      usage: {
        reviewsUsed: usage.reviewsUsed,
        reviewsLimit: usage.reviewsLimit,
      },
    };
  }

  // Check if user has reached their limit
  if (usage.reviewsUsed >= usage.reviewsLimit) {
    return {
      allowed: false,
      reason: 'Monthly review limit reached. Upgrade to Pro for unlimited reviews.',
      usage: {
        reviewsUsed: usage.reviewsUsed,
        reviewsLimit: usage.reviewsLimit,
      },
    };
  }

  return {
    allowed: true,
    usage: {
      reviewsUsed: usage.reviewsUsed,
      reviewsLimit: usage.reviewsLimit,
    },
  };
}

/**
 * Increment usage count after a review is created
 */
export async function incrementUsage(userId: string): Promise<void> {
  const now = new Date();
  const periodStart = startOfMonth(now);

  await prisma.prdUsage.update({
    where: {
      userId_periodStart: {
        userId,
        periodStart,
      },
    },
    data: {
      reviewsUsed: {
        increment: 1,
      },
    },
  });
}

/**
 * Get user's current subscription
 */
export async function getCurrentSubscription(userId: string): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
} | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return null;
  }

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

/**
 * Get or create default subscription for user
 */
export async function getOrCreateSubscription(userId: string): Promise<{
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}> {
  const existing = await getCurrentSubscription(userId);
  if (existing) {
    return existing;
  }

  // Create free subscription
  const now = new Date();
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      plan: 'FREE',
      status: 'ACTIVE',
      currentPeriodStart: startOfMonth(now),
      currentPeriodEnd: endOfMonth(now),
      cancelAtPeriodEnd: false,
    },
  });

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

export interface CreateSubscriptionCheckoutOptions {
  userId: string;
  userEmail: string;
  plan: 'PRO';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a checkout session for subscription
 */
export async function createSubscriptionCheckout(
  options: CreateSubscriptionCheckoutOptions
): Promise<{ checkoutUrl: string }> {
  const { userId, userEmail, plan, successUrl, cancelUrl } = options;

  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig) {
    throw new Error('Invalid subscription plan');
  }

  try {
    // Create subscription with Dodo Payments
    const subscription = await dodo.subscriptions.create({
      billing: {
        city: 'Unknown',
        country: 'US',
        state: 'Unknown',
        street: 'Unknown',
        zipcode: '00000',
      },
      customer: {
        email: userEmail,
        name: userEmail.split('@')[0],
      },
      product_id: planConfig.id,
      quantity: 1,
      payment_link: true,
      return_url: successUrl,
      metadata: {
        userId,
        plan,
      },
    });

    // Store pending subscription
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: 'FREE', // Will be updated on webhook
        status: 'ACTIVE',
        dodoSubscriptionId: subscription.subscription_id,
        dodoCustomerId: subscription.customer.customer_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: endOfMonth(new Date()),
      },
      update: {
        dodoSubscriptionId: subscription.subscription_id,
        dodoCustomerId: subscription.customer.customer_id,
      },
    });

    return {
      checkoutUrl: subscription.payment_link || '',
    };
  } catch (error) {
    console.error('Failed to create subscription checkout:', error);
    throw error;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error('No subscription found');
  }

  if (subscription.plan === 'FREE') {
    throw new Error('Cannot cancel free plan');
  }

  // Cancel with Dodo if there's an active subscription
  if (subscription.dodoSubscriptionId) {
    try {
      await dodo.subscriptions.update(subscription.dodoSubscriptionId, {
        status: 'cancelled',
      });
    } catch (error) {
      console.error('Failed to cancel subscription with Dodo:', error);
    }
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
    },
  });
}

/**
 * Process subscription webhook events
 */
export async function processSubscriptionWebhook(
  eventType: string,
  data: {
    subscription_id: string;
    customer_id?: string;
    status?: string;
    current_period_start?: string;
    current_period_end?: string;
    metadata?: Record<string, string>;
  }
): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { dodoSubscriptionId: data.subscription_id },
  });

  if (!subscription) {
    console.log(`Subscription not found for ID: ${data.subscription_id}`);
    return;
  }

  switch (eventType) {
    case 'subscription.active':
    case 'subscription.renewed':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: 'PRO',
          status: 'ACTIVE',
          currentPeriodStart: data.current_period_start
            ? new Date(data.current_period_start)
            : new Date(),
          currentPeriodEnd: data.current_period_end
            ? new Date(data.current_period_end)
            : endOfMonth(new Date()),
          cancelAtPeriodEnd: false,
        },
      });
      break;

    case 'subscription.cancelled':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          plan: 'FREE',
        },
      });
      break;

    case 'subscription.failed':
    case 'subscription.expired':
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: data.status === 'expired' ? 'EXPIRED' : 'PAST_DUE',
          plan: 'FREE',
        },
      });
      break;

    default:
      console.log(`Unhandled subscription event: ${eventType}`);
  }
}
