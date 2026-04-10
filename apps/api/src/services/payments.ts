import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';
import { prisma } from '../db.js';
import { config } from '../config.js';
import type { ProductType, PaymentStatus } from '@prisma/client';

// Product pricing configuration
export const PRODUCTS = {
  SCAN_CREDIT: {
    id: 'scan-single',
    name: 'Launch Audit',
    price: 2900, // $29 in cents (updated from $39)
    credits: 1,
    description: 'Full security scan for a launch, handoff, or release',
  },
  SCAN_BUNDLE_5: {
    id: 'scan-bundle-5',
    name: 'Growth Pack',
    price: 9900, // $99 in cents
    credits: 5,
    description: 'Five security scans - Save 49%',
  },
  SCAN_BUNDLE_10: {
    id: 'scan-bundle-10',
    name: 'Agency Pack',
    price: 17900, // $179 in cents
    credits: 10,
    description: 'Ten security scans - Save 54%',
  },
} as const;

// Initialize Dodo Payments client
const dodo = new DodoPayments({
  bearerToken: config.dodoPaymentsApiKey,
  environment: config.dodoPaymentsEnvironment === 'live_mode' ? 'live_mode' : 'test_mode',
});

// Webhook verifier (lazy-initialized to avoid startup errors when secret not set)
let webhookVerifier: Webhook | null = null;

function getWebhookVerifier(): Webhook {
  if (!webhookVerifier) {
    if (!config.dodoPaymentsWebhookSecret) {
      throw new Error('DODO_PAYMENTS_WEBHOOK_SECRET is required for webhook verification');
    }
    webhookVerifier = new Webhook(config.dodoPaymentsWebhookSecret);
  }
  return webhookVerifier;
}

export interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  productType: ProductType;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  paymentId: string;
  paymentLink: string;
}

/**
 * Create a checkout session for purchasing scan credits
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<CheckoutSession> {
  const { userId, userEmail, productType, successUrl, cancelUrl } = options;

  const product = PRODUCTS[productType];
  if (!product) {
    throw new Error(`Invalid product type: ${productType}`);
  }

  // Create payment in our database first
  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: product.price,
      currency: 'USD',
      productType,
      quantity: product.credits,
      status: 'PENDING',
      metadata: {
        productName: product.name,
        credits: product.credits,
      },
    },
  });

  try {
    // Create payment with Dodo Payments
    const dodoPayment = await dodo.payments.create({
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
      payment_link: true,
      product_cart: [
        {
          product_id: product.id,
          quantity: 1,
        },
      ],
      return_url: successUrl,
      metadata: {
        paymentId: payment.id,
        userId,
        productType,
        credits: product.credits.toString(),
      },
    });

    // Update our payment record with Dodo payment ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        dodoPaymentId: dodoPayment.payment_id,
      },
    });

    return {
      paymentId: payment.id,
      paymentLink: dodoPayment.payment_link || '',
    };
  } catch (error) {
    // Mark payment as failed if Dodo API call fails
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}

/**
 * Verify webhook signature from Dodo Payments
 */
export function verifyWebhookSignature(
  payload: string,
  headers: Record<string, string>
): boolean {
  try {
    getWebhookVerifier().verify(payload, headers);
    return true;
  } catch {
    return false;
  }
}

/**
 * Process a successful payment webhook
 */
export async function processPaymentSuccess(
  dodoPaymentId: string,
  metadata?: Record<string, string>
): Promise<void> {
  // Find the payment by Dodo payment ID
  let payment = await prisma.payment.findUnique({
    where: { dodoPaymentId },
  });

  // If not found by dodoPaymentId, try to find by our internal ID from metadata
  if (!payment && metadata?.paymentId) {
    payment = await prisma.payment.findUnique({
      where: { id: metadata.paymentId },
    });
  }

  if (!payment) {
    console.error(`Payment not found for Dodo payment ID: ${dodoPaymentId}`);
    return;
  }

  // Skip if already processed
  if (payment.status === 'COMPLETED') {
    console.log(`Payment ${payment.id} already processed`);
    return;
  }

  const product = PRODUCTS[payment.productType];
  const creditsToAdd = product?.credits || payment.quantity;

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        dodoPaymentId,
      },
    });

    // Credit user's scan balance (upsert to create if not exists)
    await tx.scanCredit.upsert({
      where: { userId: payment.userId },
      create: {
        userId: payment.userId,
        totalCredits: 1 + creditsToAdd, // 1 free + purchased
        usedCredits: 0,
      },
      update: {
        totalCredits: {
          increment: creditsToAdd,
        },
      },
    });
  });

  console.log(`Payment ${payment.id} processed successfully. Added ${creditsToAdd} credits.`);
}

/**
 * Process a failed payment webhook
 */
export async function processPaymentFailure(
  dodoPaymentId: string,
  reason?: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { dodoPaymentId },
  });

  if (!payment) {
    console.error(`Payment not found for Dodo payment ID: ${dodoPaymentId}`);
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      metadata: {
        ...(payment.metadata as object || {}),
        failureReason: reason,
      },
    },
  });
}

/**
 * Process a refund webhook
 */
export async function processPaymentRefund(
  dodoPaymentId: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { dodoPaymentId },
  });

  if (!payment) {
    console.error(`Payment not found for Dodo payment ID: ${dodoPaymentId}`);
    return;
  }

  const product = PRODUCTS[payment.productType];
  const creditsToDeduct = product?.credits || payment.quantity;

  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    // Deduct credits (but don't go below 0 used credits)
    const credit = await tx.scanCredit.findUnique({
      where: { userId: payment.userId },
    });

    if (credit) {
      const remainingCredits = credit.totalCredits - credit.usedCredits;
      const actualDeduction = Math.min(creditsToDeduct, remainingCredits);

      await tx.scanCredit.update({
        where: { userId: payment.userId },
        data: {
          totalCredits: {
            decrement: actualDeduction,
          },
        },
      });
    }
  });
}

/**
 * Get user's scan credits
 */
export async function getUserCredits(userId: string): Promise<{
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}> {
  const credit = await prisma.scanCredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    // Initialize credits for new user (1 free scan)
    const newCredit = await prisma.scanCredit.create({
      data: {
        userId,
        totalCredits: 1,
        usedCredits: 0,
      },
    });

    return {
      totalCredits: newCredit.totalCredits,
      usedCredits: newCredit.usedCredits,
      availableCredits: newCredit.totalCredits - newCredit.usedCredits,
    };
  }

  return {
    totalCredits: credit.totalCredits,
    usedCredits: credit.usedCredits,
    availableCredits: credit.totalCredits - credit.usedCredits,
  };
}

/**
 * Check if user has available credits
 */
export async function hasAvailableCredits(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits.availableCredits > 0;
}

/**
 * Deduct a credit for a scan (call when scan starts)
 */
export async function deductCredit(userId: string): Promise<boolean> {
  const credit = await prisma.scanCredit.findUnique({
    where: { userId },
  });

  if (!credit || credit.totalCredits - credit.usedCredits <= 0) {
    return false;
  }

  await prisma.scanCredit.update({
    where: { userId },
    data: {
      usedCredits: {
        increment: 1,
      },
    },
  });

  return true;
}

/**
 * Refund a credit (call when scan fails)
 */
export async function refundCredit(userId: string): Promise<void> {
  const credit = await prisma.scanCredit.findUnique({
    where: { userId },
  });

  if (credit && credit.usedCredits > 0) {
    await prisma.scanCredit.update({
      where: { userId },
      data: {
        usedCredits: {
          decrement: 1,
        },
      },
    });
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    productType: ProductType;
    quantity: number;
    createdAt: Date;
    completedAt: Date | null;
  }>;
  total: number;
}> {
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        productType: true,
        quantity: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return { payments, total };
}
