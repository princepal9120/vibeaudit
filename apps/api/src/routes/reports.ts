import { Router, type Request, type Response, type NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db.js';
import { authenticateToken, optionalAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/reports/:id - Get report (requires auth)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      res.status(400).json({ error: 'Invalid report ID' });
      return;
    }

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId: req.userId,
      },
      include: {
        scan: {
          select: {
            githubRepoUrl: true,
            liveUrl: true,
            branch: true,
            createdAt: true,
            completedAt: true,
          },
        },
        findings: {
          orderBy: [
            { severity: 'asc' }, // CRITICAL, HIGH, MEDIUM, LOW
            { confidence: 'desc' },
          ],
        },
      },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/:id/pdf - Download PDF report
router.get('/:id/pdf', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      res.status(400).json({ error: 'Invalid report ID' });
      return;
    }

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId: req.userId,
      },
      select: {
        pdfUrl: true,
      },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (!report.pdfUrl) {
      res.status(404).json({ error: 'PDF not yet generated' });
      return;
    }

    // Redirect to S3 URL or serve from local storage
    res.redirect(report.pdfUrl);
  } catch (error) {
    next(error);
  }
});

// POST /api/reports/:id/share - Generate share link
router.post('/:id/share', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reportId = parseInt(req.params.id);
    const expiresInDays = parseInt(req.body.expiresInDays) || 30;

    if (isNaN(reportId)) {
      res.status(400).json({ error: 'Invalid report ID' });
      return;
    }

    // Verify ownership
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId: req.userId,
      },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    // Generate or update share token
    const shareToken = uuidv4();
    const shareExpiresAt = new Date();
    shareExpiresAt.setDate(shareExpiresAt.getDate() + expiresInDays);

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
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
      shareUrl: `/reports/shared/${updatedReport.shareToken}`,
      expiresAt: updatedReport.shareExpiresAt,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reports/:id/share - Revoke share link
router.delete('/:id/share', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reportId = parseInt(req.params.id);

    if (isNaN(reportId)) {
      res.status(400).json({ error: 'Invalid report ID' });
      return;
    }

    // Verify ownership
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId: req.userId,
      },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    await prisma.report.update({
      where: { id: reportId },
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

// GET /api/reports/shared/:token - View shared report (no auth required)
router.get('/shared/:token', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const report = await prisma.report.findFirst({
      where: {
        shareToken: token,
        shareExpiresAt: {
          gt: new Date(), // Not expired
        },
      },
      include: {
        scan: {
          select: {
            githubRepoUrl: true,
            liveUrl: true,
            createdAt: true,
            completedAt: true,
          },
        },
        findings: {
          orderBy: [
            { severity: 'asc' },
            { confidence: 'desc' },
          ],
          // Don't expose raw findings or file paths in shared reports
          select: {
            id: true,
            title: true,
            severity: true,
            category: true,
            source: true,
            description: true,
            impact: true,
            remediation: true,
            confidence: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found or link has expired' });
      return;
    }

    // Remove sensitive user info
    const { user, ...reportData } = report;

    res.json({
      ...reportData,
      authorName: user.name || 'Anonymous',
      isSharedView: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
