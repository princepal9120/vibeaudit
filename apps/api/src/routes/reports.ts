import { Router, type Request, type Response, type NextFunction, type IRouter } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db.js';
import { authenticateToken, optionalAuth, getUserId, type AuthRequest } from '../middleware/auth.js';
import { generatePdf } from '../services/pdf-generator.js';

const router: IRouter = Router();

// GET /api/reports/:id - Get report (requires auth)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reportId = req.params.id as string;

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId,
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
    const userId = getUserId(req);
    const reportId = req.params.id as string;

    // Verify ownership
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    // Generate PDF on-the-fly
    const pdfBuffer = await generatePdf(reportId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vibeaudit-report-${reportId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

// POST /api/reports/:id/share - Generate share link
router.post('/:id/share', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const reportId = req.params.id as string;
    const expiresInDays = parseInt(req.body.expiresInDays) || 30;

    // Verify ownership
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId,
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
      shareToken: updatedReport.shareToken,
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
    const userId = getUserId(req);
    const reportId = req.params.id as string;

    // Verify ownership
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId,
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
    const token = req.params.token as string;

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

    // Extract user and rest of report data
    const { user, ...reportData } = report as typeof report & { user: { name: string | null } };

    res.json({
      ...reportData,
      authorName: user?.name || 'Anonymous',
      isSharedView: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
