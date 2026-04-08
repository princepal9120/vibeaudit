import PDFDocument from 'pdfkit';
import { prisma } from '../db.js';

interface PrdFinding {
   id: string;
   framework: string;
   frameworkItem: string;
   severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
   title: string;
   description: string;
   recommendation: string;
   section?: string;
}

interface FrameworkCoverage {
   framework: string;
   frameworkName: string;
   coveredItems: string[];
   missingItems: string[];
   coveragePercent: number;
}

interface PrdReviewData {
   id: string;
   title: string;
   fileName: string | null;
   securityScore: number | null;
   securedContent: string | null;
   findings: PrdFinding[] | null;
   frameworkCoverage: FrameworkCoverage[] | null;
   createdAt: Date;
   completedAt: Date | null;
   user: {
      name: string | null;
      email: string;
   };
}

export async function generatePrdReviewPdf(reviewId: string): Promise<Buffer> {
   const review = await prisma.prdReview.findUnique({
      where: { id: reviewId },
      select: {
         id: true,
         title: true,
         fileName: true,
         securityScore: true,
         securedContent: true,
         findings: true,
         frameworkCoverage: true,
         createdAt: true,
         completedAt: true,
         user: {
            select: {
               name: true,
               email: true,
            },
         },
      },
   });

   if (!review) {
      throw new Error('PRD review not found');
   }

   // Parse JSON fields
   const reviewData: PrdReviewData = {
      ...review,
      findings: review.findings as unknown as PrdFinding[] | null,
      frameworkCoverage: review.frameworkCoverage as unknown as FrameworkCoverage[] | null,
   };

   return createPrdPdfDocument(reviewData);
}

function createPrdPdfDocument(review: PrdReviewData): Promise<Buffer> {
   return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const reviewDate = review.completedAt || review.createdAt;

      // Header
      doc.fontSize(24)
         .fillColor('#10b981')
         .text('VibeAudit', 50, 50);

      doc.fontSize(10)
         .fillColor('#64748b')
         .text('PRD Security Review', 50, 78);

      doc.moveTo(50, 100)
         .lineTo(545, 100)
         .strokeColor('#e2e8f0')
         .stroke();

      // Title
      doc.fontSize(20)
         .fillColor('#0f172a')
         .text('PRD Security Analysis Report', 50, 120);

      doc.fontSize(14)
         .fillColor('#334155')
         .text(review.title, 50, 150, { width: 495 });

      let metaY = doc.y + 10;
      if (review.fileName) {
         doc.fontSize(10)
            .fillColor('#94a3b8')
            .text(`File: ${review.fileName}`, 50, metaY);
         metaY += 15;
      }

      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text(`Generated: ${reviewDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
         })}`, 50, metaY);

      // Security Score
      let y = metaY + 40;
      const score = review.securityScore ?? 0;
      const scoreColor = score >= 75 ? '#10b981'
         : score >= 50 ? '#f59e0b'
            : '#ef4444';
      const scoreLabel = score >= 90 ? 'Excellent'
         : score >= 75 ? 'Good'
            : score >= 50 ? 'Fair'
               : score >= 25 ? 'Poor'
                  : 'Critical';

      doc.roundedRect(50, y, 150, 80, 8)
         .fillColor('#f8fafc')
         .fill();

      doc.fontSize(36)
         .fillColor(scoreColor)
         .text(String(score), 70, y + 15, { width: 110, align: 'center' });

      doc.fontSize(10)
         .fillColor('#64748b')
         .text('Security Score', 70, y + 52, { width: 110, align: 'center' });

      doc.fontSize(9)
         .fillColor(scoreColor)
         .text(scoreLabel, 70, y + 65, { width: 110, align: 'center' });

      // Findings Summary
      const findings = review.findings || [];
      const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
      const highCount = findings.filter(f => f.severity === 'HIGH').length;
      const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
      const lowCount = findings.filter(f => f.severity === 'LOW').length;

      doc.roundedRect(220, y, 325, 80, 8)
         .fillColor('#f8fafc')
         .fill();

      doc.fontSize(11)
         .fillColor('#0f172a')
         .text('Findings Summary', 235, y + 10);

      const summaryY = y + 35;
      const colWidth = 75;

      // Critical
      doc.roundedRect(235, summaryY, 60, 35, 4)
         .fillColor('#fef2f2')
         .fill();
      doc.fontSize(16)
         .fillColor('#dc2626')
         .text(String(criticalCount), 235, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('Critical', 235, summaryY + 24, { width: 60, align: 'center' });

      // High
      doc.roundedRect(235 + colWidth, summaryY, 60, 35, 4)
         .fillColor('#fffbeb')
         .fill();
      doc.fontSize(16)
         .fillColor('#d97706')
         .text(String(highCount), 235 + colWidth, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('High', 235 + colWidth, summaryY + 24, { width: 60, align: 'center' });

      // Medium
      doc.roundedRect(235 + colWidth * 2, summaryY, 60, 35, 4)
         .fillColor('#fefce8')
         .fill();
      doc.fontSize(16)
         .fillColor('#ca8a04')
         .text(String(mediumCount), 235 + colWidth * 2, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('Medium', 235 + colWidth * 2, summaryY + 24, { width: 60, align: 'center' });

      // Low
      doc.roundedRect(235 + colWidth * 3, summaryY, 60, 35, 4)
         .fillColor('#eff6ff')
         .fill();
      doc.fontSize(16)
         .fillColor('#2563eb')
         .text(String(lowCount), 235 + colWidth * 3, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('Low', 235 + colWidth * 3, summaryY + 24, { width: 60, align: 'center' });

      y = y + 100;

      // Framework Coverage
      const frameworks = review.frameworkCoverage || [];
      if (frameworks.length > 0) {
         doc.fontSize(14)
            .fillColor('#0f172a')
            .text('Framework Coverage', 50, y);
         y += 25;

         for (const fw of frameworks) {
            if (y > 700) {
               doc.addPage();
               y = 50;
            }

            // Framework name and percentage
            doc.fontSize(11)
               .fillColor('#334155')
               .text(fw.frameworkName, 50, y);

            doc.fontSize(10)
               .fillColor(fw.coveragePercent >= 75 ? '#10b981' : fw.coveragePercent >= 50 ? '#f59e0b' : '#ef4444')
               .text(`${fw.coveragePercent}%`, 480, y, { width: 65, align: 'right' });

            y += 18;

            // Progress bar
            doc.roundedRect(50, y, 495, 8, 4)
               .fillColor('#e2e8f0')
               .fill();

            const barWidth = Math.max(0, Math.min(495 * (fw.coveragePercent / 100), 495));
            if (barWidth > 0) {
               doc.roundedRect(50, y, barWidth, 8, 4)
                  .fillColor(fw.coveragePercent >= 75 ? '#10b981' : fw.coveragePercent >= 50 ? '#f59e0b' : '#ef4444')
                  .fill();
            }

            y += 20;
         }

         y += 15;
      }

      // Findings by Framework
      if (findings.length > 0) {
         if (y > 650) {
            doc.addPage();
            y = 50;
         }

         doc.fontSize(14)
            .fillColor('#0f172a')
            .text(`Security Findings (${findings.length})`, 50, y);
         y += 25;

         // Group findings by framework
         const findingsByFramework = new Map<string, PrdFinding[]>();
         for (const finding of findings) {
            const frameworkFindings = findingsByFramework.get(finding.framework) || [];
            frameworkFindings.push(finding);
            findingsByFramework.set(finding.framework, frameworkFindings);
         }

         for (const [framework, frameworkFindings] of findingsByFramework) {
            if (y > 700) {
               doc.addPage();
               y = 50;
            }

            // Framework header
            const frameworkName = frameworks.find(f => f.framework === framework)?.frameworkName || framework;
            doc.fontSize(12)
               .fillColor('#475569')
               .text(frameworkName, 50, y);
            y += 20;

            for (const finding of frameworkFindings) {
               if (y > 700) {
                  doc.addPage();
                  y = 50;
               }

               const severityColors: Record<string, string> = {
                  CRITICAL: '#dc2626',
                  HIGH: '#d97706',
                  MEDIUM: '#ca8a04',
                  LOW: '#2563eb',
               };
               const severityBgColors: Record<string, string> = {
                  CRITICAL: '#fef2f2',
                  HIGH: '#fffbeb',
                  MEDIUM: '#fefce8',
                  LOW: '#eff6ff',
               };

               // Severity badge
               const badgeWidth = 55;
               doc.roundedRect(50, y, badgeWidth, 16, 3)
                  .fillColor(severityBgColors[finding.severity] || '#f1f5f9')
                  .fill();
               doc.fontSize(8)
                  .fillColor(severityColors[finding.severity] || '#64748b')
                  .text(finding.severity, 50, y + 4, { width: badgeWidth, align: 'center' });

               // Title
               doc.fontSize(11)
                  .fillColor('#0f172a')
                  .text(finding.title, 115, y, { width: 430 });

               y += 22;

               // Framework item
               doc.fontSize(8)
                  .fillColor('#94a3b8')
                  .text(finding.frameworkItem, 50, y);
               y += 15;

               // Description
               doc.fontSize(9)
                  .fillColor('#64748b')
                  .text('Issue:', 50, y);
               y += 12;
               doc.fillColor('#475569')
                  .text(finding.description, 50, y, { width: 495, lineGap: 2 });
               y = doc.y + 10;

               // Recommendation
               doc.fillColor('#64748b')
                  .text('Recommendation:', 50, y);
               y += 12;
               doc.fillColor('#475569')
                  .text(finding.recommendation, 50, y, { width: 495, lineGap: 2 });
               y = doc.y + 15;

               // Separator
               doc.moveTo(50, y)
                  .lineTo(545, y)
                  .strokeColor('#e2e8f0')
                  .stroke();
               y += 15;
            }
         }
      } else {
         doc.roundedRect(50, y, 495, 60, 8)
            .fillColor('#f0fdf4')
            .fill();

         doc.fontSize(12)
            .fillColor('#10b981')
            .text('No Security Issues Found', 50, y + 15, { width: 495, align: 'center' });

         doc.fontSize(10)
            .fillColor('#64748b')
            .text('Your PRD addresses all security requirements.', 50, y + 35, { width: 495, align: 'center' });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
         doc.switchToPage(i);

         doc.fontSize(8)
            .fillColor('#94a3b8')
            .text(
               `Generated by VibeAudit PRD Security Review • Page ${i + 1} of ${pageCount}`,
               50,
               780,
               { width: 495, align: 'center' }
            );
      }

      doc.end();
   });
}
