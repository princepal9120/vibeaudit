import { Router, type Response, type NextFunction, type IRouter, type Request } from 'express';
import { z } from 'zod';
import { Webhook } from 'standardwebhooks';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { authenticateToken, getUserId, type AuthRequest } from '../middleware/auth.js';
import {
  getOrCreateSubscription,
  createSubscriptionCheckout,
  cancelSubscription,
  processSubscriptionWebhook,
  SUBSCRIPTION_PLANS,
} from '../services/subscription-manager.js';
import { getUserCredits } from '../services/payments.js';

const router: IRouter = Router();

// GET /api/subscriptions/current - Get current subscription and usage
router.get(
  '/current',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);

      const [subscription, credits] = await Promise.all([
        getOrCreateSubscription(userId),
        getUserCredits(userId),
      ]);

      const planConfig = SUBSCRIPTION_PLANS[subscription.plan];

      res.json({
        subscription: {
          plan: subscription.plan,
          planName: planConfig.name,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        },
        usage: {
          scansUsed: credits.usedCredits,
          scansLimit: credits.isUnlimited ? -1 : credits.totalCredits,
          periodStart: subscription.currentPeriodStart || new Date().toISOString(),
          periodEnd: subscription.currentPeriodEnd || new Date().toISOString(),
          isUnlimited: credits.isUnlimited,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/subscriptions/plans - Get available subscription plans
router.get('/plans', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      productId: plan.id,
      name: plan.name,
      price: plan.price,
      priceFormatted: plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(2)} one-time`,
      scansPerMonth: plan.scansPerMonth,
      scansFormatted:
        plan.scansPerMonth === -1 ? 'Unlimited' : `${plan.scansPerMonth} scans/month`,
      description: plan.description,
      features:
        key === 'PRO'
          ? [
              'Unlimited code security scans',
              'Unlimited landing page conversion audits',
              'AI-generated copy & paste fix prompts',
              'Fully hosted - zero maintenance',
              'Client-facing PDF reports',
            ]
          : [
              '1 code scan per month',
              'Basic security score',
              'Secrets detection',
              'Dependency checks',
            ],
    }));

    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscriptions/checkout - Create checkout session for Pro plan
router.post(
  '/checkout',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const userEmail = req.user?.email;

      if (!userEmail) {
        res.status(400).json({ error: 'User email not found' });
        return;
      }

      const successUrl = `${config.frontendUrl}/subscription?success=true`;
      const cancelUrl = `${config.frontendUrl}/subscription?cancelled=true`;

      const result = await createSubscriptionCheckout({
        userId,
        userEmail,
        plan: 'PRO',
        successUrl,
        cancelUrl,
      });

      res.json({
        checkoutUrl: result.checkoutUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/subscriptions/cancel - Cancel subscription at period end
router.post(
  '/cancel',
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);

      await cancelSubscription(userId);

      res.json({
        message: 'Subscription will be cancelled at the end of the current billing period',
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
);

// POST /api/subscriptions/webhook - Handle Dodo Payments webhooks
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = JSON.stringify(req.body);
    const headers = req.headers as Record<string, string>;

    // Verify webhook signature
    if (config.dodoPaymentsWebhookSecret) {
      try {
        const webhook = new Webhook(config.dodoPaymentsWebhookSecret);
        webhook.verify(payload, headers);
      } catch {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    const event = req.body as {
      type: string;
      data: {
        subscription_id: string;
        customer_id?: string;
        status?: string;
        current_period_start?: string;
        current_period_end?: string;
        metadata?: Record<string, string>;
      };
    };

    // Process subscription events
    if (event.type.startsWith('subscription.')) {
      await processSubscriptionWebhook(event.type, event.data);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    next(error);
  }
});

export default router;
