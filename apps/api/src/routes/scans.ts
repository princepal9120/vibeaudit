import { Router, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authenticateToken, getUserId, type AuthRequest } from '../middleware/auth.js';
import { addScanJob } from '../workers/queue.js';

const router = Router();

// All scan routes require authentication
router.use(authenticateToken);

// Validation schemas
const createScanSchema = z.object({
  githubRepoUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  branch: z.string().optional(),
}).refine(
  data => data.githubRepoUrl || data.liveUrl,
  { message: 'Either githubRepoUrl or liveUrl is required' }
);

// GET /api/scans - List user's scans
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          report: {
            select: {
              id: true,
              securityScore: true,
              totalFindings: true,
              criticalCount: true,
              highCount: true,
            },
          },
        },
      }),
      prisma.scan.count({ where: { userId } }),
    ]);

    res.json({
      scans,
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

// POST /api/scans - Create new scan
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const body = createScanSchema.parse(req.body);

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        userId,
        githubRepoUrl: body.githubRepoUrl,
        liveUrl: body.liveUrl,
        branch: body.branch || 'main',
        status: 'QUEUED',
        progress: 'Scan queued...',
        progressPercent: 0,
      },
    });

    // Add to job queue
    try {
      await addScanJob({
        scanId: scan.id,
        userId,
        githubRepoUrl: body.githubRepoUrl,
        liveUrl: body.liveUrl,
        branch: body.branch || 'main',
      });
    } catch (queueError) {
      // Queue might not be available in development
      console.error('Failed to add scan to queue:', queueError);
      // Update scan status to indicate queue issue
      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Job queue unavailable. Please try again later.',
        },
      });
    }

    res.status(201).json(scan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues[0].message });
      return;
    }
    next(error);
  }
});

// GET /api/scans/:id - Get single scan
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const scanId = req.params.id as string;

    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
      },
      include: {
        report: {
          include: {
            findings: {
              orderBy: [
                { severity: 'asc' }, // CRITICAL first
                { confidence: 'desc' },
              ],
            },
          },
        },
      },
    });

    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    res.json(scan);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/scans/:id - Delete scan
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const scanId = req.params.id as string;

    // Verify ownership
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
      },
    });

    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    // Delete scan (cascade will delete report and findings)
    await prisma.scan.delete({
      where: { id: scanId },
    });

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/scans/:id/rescan - Re-run existing scan
router.post('/:id/rescan', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const scanId = req.params.id as string;

    // Get original scan
    const originalScan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
      },
    });

    if (!originalScan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    // Create new scan with same parameters
    const newScan = await prisma.scan.create({
      data: {
        userId,
        githubRepoUrl: originalScan.githubRepoUrl,
        liveUrl: originalScan.liveUrl,
        branch: originalScan.branch,
        status: 'QUEUED',
        progress: 'Scan queued...',
        progressPercent: 0,
      },
    });

    // Add to job queue
    try {
      await addScanJob({
        scanId: newScan.id,
        userId,
        githubRepoUrl: originalScan.githubRepoUrl || undefined,
        liveUrl: originalScan.liveUrl || undefined,
        branch: originalScan.branch || 'main',
      });
    } catch (queueError) {
      console.error('Failed to add rescan to queue:', queueError);
      await prisma.scan.update({
        where: { id: newScan.id },
        data: {
          status: 'FAILED',
          errorMessage: 'Job queue unavailable. Please try again later.',
        },
      });
    }

    res.status(201).json(newScan);
  } catch (error) {
    next(error);
  }
});

// GET /api/scans/:id/progress - Get scan progress (SSE)
router.get('/:id/progress', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const scanId = req.params.id as string;

    // Verify ownership
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
      },
    });

    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial status
    const sendProgress = async () => {
      const currentScan = await prisma.scan.findUnique({
        where: { id: scanId },
        select: {
          status: true,
          progress: true,
          progressPercent: true,
          errorMessage: true,
        },
      });

      if (currentScan) {
        res.write(`data: ${JSON.stringify(currentScan)}\n\n`);

        // If completed or failed, close the connection
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(currentScan.status)) {
          res.end();
          return true;
        }
      }
      return false;
    };

    // Poll for updates
    const interval = setInterval(async () => {
      const done = await sendProgress();
      if (done) {
        clearInterval(interval);
      }
    }, 2000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
    });

    // Send initial status immediately
    await sendProgress();
  } catch (error) {
    next(error);
  }
});

export default router;
