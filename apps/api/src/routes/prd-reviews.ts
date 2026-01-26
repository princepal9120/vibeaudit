import { Router, type Request, type Response, type NextFunction, type IRouter } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db.js';
import { authenticateToken, optionalAuth, getUserId, type AuthRequest } from '../middleware/auth.js';
import { analyzePrd, getSecurityFrameworks } from '../services/prd-analyzer.js';
import { canCreateReview, incrementUsage } from '../services/subscription-manager.js';
import { generatePrdReviewPdf } from '../services/prd-pdf-generator.js';
import { imagekit } from '../services/imagekit.js';

const router: IRouter = Router();

// Validation schemas
const createReviewSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(100).max(100000),
  fileName: z.string().optional(),
});

// GET /api/prd-reviews - List user's PRD reviews
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.prdReview.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          fileName: true,
          status: true,
          securityScore: true,
          processingTimeMs: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.prdReview.count({ where: { userId } }),
    ]);

    res.json({
      reviews,
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

// POST /api/prd-reviews - Create new PRD review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const body = createReviewSchema.parse(req.body);

    // Check if user can create a review (usage limits)
    const { allowed, reason, usage } = await canCreateReview(userId);
    if (!allowed) {
      res.status(402).json({
        error: 'Review limit reached',
        code: 'LIMIT_REACHED',
        message: reason,
        usage,
      });
      return;
    }

    // Create review record
    const review = await prisma.prdReview.create({
      data: {
        userId,
        title: body.title,
        originalContent: body.content,
        fileName: body.fileName,
        status: 'PENDING',
      },
    });

    // Increment usage count
    await incrementUsage(userId);

    // Process review asynchronously
    processReviewAsync(review.id, body.content, body.title);

    res.status(201).json({
      id: review.id,
      title: review.title,
      status: review.status,
      createdAt: review.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0].message });
      return;
    }
    next(error);
  }
});

// GET /api/prd-reviews/:id - Get single PRD review
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;

    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json(review);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/prd-reviews/:id - Delete a PRD review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;

    // Verify ownership
    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
      select: {
        id: true,
        pdfFileId: true,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Delete ImageKit file if it exists
    if (review.pdfFileId && imagekit.isConfigured()) {
      try {
        await imagekit.delete(review.pdfFileId);
      } catch (err) {
        // Log but don't fail the delete operation
        console.error(`Failed to delete ImageKit file ${review.pdfFileId}:`, err);
      }
    }

    await prisma.prdReview.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/prd-reviews/:id/download - Download secured PRD as markdown
router.get('/:id/download', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;

    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
      select: {
        title: true,
        securedContent: true,
        status: true,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== 'COMPLETED' || !review.securedContent) {
      res.status(400).json({ error: 'Review not completed yet' });
      return;
    }

    // Set headers for file download
    const filename = `${review.title.replace(/[^a-z0-9]/gi, '_')}_secured.md`;
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(review.securedContent);
  } catch (error) {
    next(error);
  }
});

// GET /api/prd-reviews/frameworks - Get available security frameworks
router.get('/frameworks/list', authenticateToken, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const frameworks = getSecurityFrameworks();
    res.json({ frameworks });
  } catch (error) {
    next(error);
  }
});

// GET /api/prd-reviews/shared/:token - View shared PRD review (no auth required)
router.get('/shared/:token', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token as string;

    const review = await prisma.prdReview.findFirst({
      where: {
        shareToken: token,
        shareExpiresAt: {
          gt: new Date(), // Not expired
        },
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        status: true,
        securityScore: true,
        securedContent: true,
        findings: true,
        frameworkCoverage: true,
        processingTimeMs: true,
        createdAt: true,
        completedAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found or link has expired' });
      return;
    }

    // Extract user and rest of review data
    const { user, ...reviewData } = review as typeof review & { user: { name: string | null } };

    res.json({
      ...reviewData,
      authorName: user?.name || 'Anonymous',
      isSharedView: true,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/prd-reviews/:id/pdf - Generate PDF on-the-fly
router.get('/:id/pdf', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;

    // Verify ownership
    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Review not completed yet' });
      return;
    }

    // Generate PDF on-the-fly
    const pdfBuffer = await generatePrdReviewPdf(reviewId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ShipSafe-prd-review-${reviewId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

// POST /api/prd-reviews/:id/pdf/upload - Upload PDF to ImageKit for permanent storage
router.post('/:id/pdf/upload', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;

    // Check if ImageKit is configured
    if (!imagekit.isConfigured()) {
      res.status(503).json({
        error: 'Cloud storage not configured',
        message: 'ImageKit credentials are not set. PDF download is still available.',
      });
      return;
    }

    // Verify ownership and get review
    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        pdfUrl: true,
        pdfFileId: true,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Review not completed yet' });
      return;
    }

    // If PDF already uploaded, return existing URL
    if (review.pdfUrl && review.pdfFileId) {
      res.json({
        url: review.pdfUrl,
        fileId: review.pdfFileId,
        cached: true,
      });
      return;
    }

    // Generate PDF
    const pdfBuffer = await generatePrdReviewPdf(reviewId);
    const fileName = `ShipSafe-prd-review-${reviewId}.pdf`;

    // Upload to ImageKit
    const uploadResult = await imagekit.upload(pdfBuffer, fileName, '/ShipSafe-prd-reviews');

    // Save URL to database
    await prisma.prdReview.update({
      where: { id: reviewId },
      data: {
        pdfUrl: uploadResult.url,
        pdfFileId: uploadResult.fileId,
      },
    });

    res.json({
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      size: uploadResult.size,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/prd-reviews/:id/share - Generate share link
router.post('/:id/share', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;
    const expiresInDays = parseInt(req.body.expiresInDays) || 30;

    // Verify ownership
    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Review not completed yet' });
      return;
    }

    // Generate or update share token
    const shareToken = uuidv4();
    const shareExpiresAt = new Date();
    shareExpiresAt.setDate(shareExpiresAt.getDate() + expiresInDays);

    const updatedReview = await prisma.prdReview.update({
      where: { id: reviewId },
      data: {
        shareToken,
        shareExpiresAt,
      },
      select: {
        shareToken: true,
        shareExpiresAt: true,
      },
    });

    res.json({
      shareToken: updatedReview.shareToken,
      shareUrl: `/prd-review/shared/${updatedReview.shareToken}`,
      expiresAt: updatedReview.shareExpiresAt,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/prd-reviews/:id/share - Revoke share link
router.delete('/:id/share', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reviewId = req.params.id as string;

    // Verify ownership
    const review = await prisma.prdReview.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    await prisma.prdReview.update({
      where: { id: reviewId },
      data: {
        shareToken: null,
        shareExpiresAt: null,
      },
    });

    res.json({ message: 'Share link revoked' });
  } catch (error) {
    next(error);
  }
});

/**
 * Process PRD review asynchronously
 */
async function processReviewAsync(
  reviewId: string,
  content: string,
  title: string
): Promise<void> {
  try {
    // Update status to processing
    await prisma.prdReview.update({
      where: { id: reviewId },
      data: { status: 'PROCESSING' },
    });

    // Analyze the PRD
    const result = await analyzePrd(content, title);

    // Update review with results
    await prisma.prdReview.update({
      where: { id: reviewId },
      data: {
        status: 'COMPLETED',
        securedContent: result.securedContent,
        securityScore: result.securityScore,
        findings: result.findings as unknown as Record<string, unknown>[],
        frameworkCoverage: result.frameworkCoverage as unknown as Record<string, unknown>[],
        processingTimeMs: result.processingTimeMs,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`PRD review ${reviewId} failed:`, error);

    // Update status to failed
    await prisma.prdReview.update({
      where: { id: reviewId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

export default router;
