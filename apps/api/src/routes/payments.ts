import { Router, type Request, type Response, type NextFunction, type IRouter } from 'express';
import { z } from 'zod';
import { authenticateToken, getUserId, type AuthRequest } from '../middleware/auth.js';
import { config } from '../config.js';
import {
  createCheckoutSession,
  verifyWebhookSignature,
  processPaymentSuccess,
  processPaymentFailure,
  processPaymentRefund,
  getUserCredits,
  getPaymentHistory,
  PRODUCTS,
} from '../services/payments.js';
import type { ProductType } from '@prisma/client';

const router: IRouter = Router();

// Validation schemas
const checkoutSchema = z.object({
  productType: z.enum(['SCAN_CREDIT', 'SCAN_BUNDLE_5', 'SCAN_BUNDLE_10']),
});

// GET /api/payments/products - Get available products
router.get('/products', (_req: Request, res: Response) => {
  const products = Object.entries(PRODUCTS).map(([type, product]) => ({
    type,
    ...product,
    priceFormatted: `$${(product.price / 100).toFixed(2)}`,
    perScanPrice: product.price / product.credits,
    perScanFormatted: `$${(product.price / product.credits / 100).toFixed(2)}`,
  }));

  res.json({ products });
});

// POST /api/payments/checkout - Create checkout session
router.post('/checkout', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(400).json({ error: 'User email is required' });
      return;
    }

    const body = checkoutSchema.parse(req.body);

    const session = await createCheckoutSession({
      userId,
      userEmail,
      productType: body.productType as ProductType,
      successUrl: `${config.frontendUrl}/checkout/success?payment_id={PAYMENT_ID}`,
      cancelUrl: `${config.frontendUrl}/checkout/cancel`,
    });

    res.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0].message });
      return;
    }
    next(error);
  }
});

// GET /api/payments/credits - Get user's scan credits
router.get('/credits', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const credits = await getUserCredits(userId);
    res.json(credits);
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/history - Get user's payment history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const { payments, total } = await getPaymentHistory(userId, { limit, offset });

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/payments/webhook - Handle Dodo Payments webhooks
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = JSON.stringify(req.body);
    const headers = {
      'webhook-id': req.headers['webhook-id'] as string,
      'webhook-timestamp': req.headers['webhook-timestamp'] as string,
      'webhook-signature': req.headers['webhook-signature'] as string,
    };

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, headers)) {
      console.error('Invalid webhook signature');
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    const event = req.body;
    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment.succeeded':
      case 'payment.completed':
        await processPaymentSuccess(
          event.data.payment_id,
          event.data.metadata
        );
        break;

      case 'payment.failed':
        await processPaymentFailure(
          event.data.payment_id,
          event.data.failure_reason
        );
        break;

      case 'payment.refunded':
      case 'refund.succeeded':
        await processPaymentRefund(event.data.payment_id);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent retries for processing errors
    res.status(200).json({ received: true, error: 'Processing error' });
  }
});

export default router;
