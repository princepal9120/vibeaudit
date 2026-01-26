import PDFDocument from 'pdfkit';
import { prisma } from '../db.js';

interface ReportData {
   id: string;
   securityScore: number;
   totalFindings: number;
   criticalCount: number;
   highCount: number;
   mediumCount: number;
   lowCount: number;
   executiveSummary: string | null;
   createdAt: Date;
   scan: {
      githubRepoUrl: string | null;
      liveUrl: string | null;
      completedAt: Date | null;
   };
   findings: Array<{
      id: string;
      title: string;
      severity: string;
      category: string;
      source: string;
      description: string;
      impact: string;
      remediation: string;
      filePath: string | null;
      lineNumber: number | null;
      confidence: number;
   }>;
}

export async function generatePdf(reportId: string): Promise<Buffer> {
   const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
         scan: {
            select: {
               githubRepoUrl: true,
               liveUrl: true,
               completedAt: true,
            },
         },
         findings: {
            orderBy: [
               { severity: 'asc' },
               { confidence: 'desc' },
            ],
            select: {
               id: true,
               title: true,
               severity: true,
               category: true,
               source: true,
               description: true,
               impact: true,
               remediation: true,
               filePath: true,
               lineNumber: true,
               confidence: true,
            },
         },
      },
   });

   if (!report) {
      throw new Error('Report not found');
   }

   return createPdfDocument(report);
}

function createPdfDocument(report: ReportData): Promise<Buffer> {
   return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const target = report.scan.githubRepoUrl || report.scan.liveUrl || 'Unknown';
      const scanDate = report.scan.completedAt || report.createdAt;

      // Header
      doc.fontSize(24)
         .fillColor('#10b981')
         .text('ShipSafe', 50, 50);

      doc.fontSize(10)
         .fillColor('#64748b')
         .text('Security Scanning for Indie Builders', 50, 78);

      doc.moveTo(50, 100)
         .lineTo(545, 100)
         .strokeColor('#e2e8f0')
         .stroke();

      // Title
      doc.fontSize(20)
         .fillColor('#0f172a')
         .text('Security Report', 50, 120);

      doc.fontSize(11)
         .fillColor('#64748b')
         .text(target, 50, 148);

      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text(`Generated: ${scanDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
         })}`, 50, 165);

      // Security Score
      let y = 200;
      const scoreColor = report.securityScore >= 75 ? '#10b981'
         : report.securityScore >= 50 ? '#f59e0b'
            : '#ef4444';
      const scoreLabel = report.securityScore >= 90 ? 'Excellent'
         : report.securityScore >= 75 ? 'Good'
            : report.securityScore >= 50 ? 'Fair'
               : report.securityScore >= 25 ? 'Poor'
                  : 'Critical';

      doc.roundedRect(50, y, 150, 80, 8)
         .fillColor('#f8fafc')
         .fill();

      doc.fontSize(36)
         .fillColor(scoreColor)
         .text(String(report.securityScore), 70, y + 15, { width: 110, align: 'center' });

      doc.fontSize(10)
         .fillColor('#64748b')
         .text('Security Score', 70, y + 52, { width: 110, align: 'center' });

      doc.fontSize(9)
         .fillColor(scoreColor)
         .text(scoreLabel, 70, y + 65, { width: 110, align: 'center' });

      // Findings Summary
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
         .text(String(report.criticalCount), 235, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('Critical', 235, summaryY + 24, { width: 60, align: 'center' });

      // High
      doc.roundedRect(235 + colWidth, summaryY, 60, 35, 4)
         .fillColor('#fffbeb')
         .fill();
      doc.fontSize(16)
         .fillColor('#d97706')
         .text(String(report.highCount), 235 + colWidth, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('High', 235 + colWidth, summaryY + 24, { width: 60, align: 'center' });

      // Medium
      doc.roundedRect(235 + colWidth * 2, summaryY, 60, 35, 4)
         .fillColor('#fefce8')
         .fill();
      doc.fontSize(16)
         .fillColor('#ca8a04')
         .text(String(report.mediumCount), 235 + colWidth * 2, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('Medium', 235 + colWidth * 2, summaryY + 24, { width: 60, align: 'center' });

      // Low
      doc.roundedRect(235 + colWidth * 3, summaryY, 60, 35, 4)
         .fillColor('#eff6ff')
         .fill();
      doc.fontSize(16)
         .fillColor('#2563eb')
         .text(String(report.lowCount), 235 + colWidth * 3, summaryY + 5, { width: 60, align: 'center' });
      doc.fontSize(8)
         .fillColor('#64748b')
         .text('Low', 235 + colWidth * 3, summaryY + 24, { width: 60, align: 'center' });

      y = y + 100;

      // Executive Summary
      if (report.executiveSummary) {
         doc.fontSize(14)
            .fillColor('#0f172a')
            .text('Executive Summary', 50, y);

         y += 25;
         doc.fontSize(10)
            .fillColor('#475569')
            .text(report.executiveSummary, 50, y, { width: 495, lineGap: 4 });

         y = doc.y + 30;
      }

      // Findings
      if (report.findings.length > 0) {
         doc.fontSize(14)
            .fillColor('#0f172a')
            .text(`Findings (${report.totalFindings})`, 50, y);

         y += 25;

         for (const finding of report.findings) {
            // Check if we need a new page
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
               .text(finding.title, 115, y, { width: 380 });

            // Source
            doc.fontSize(8)
               .fillColor('#94a3b8')
               .text(finding.source, 500, y + 3);

            y += 22;

            // File path
            if (finding.filePath) {
               doc.fontSize(8)
                  .fillColor('#64748b')
                  .font('Courier')
                  .text(`${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ''}`, 50, y);
               doc.font('Helvetica');
               y += 15;
            }

            // Description
            doc.fontSize(9)
               .fillColor('#64748b')
               .text('What it is:', 50, y);
            y += 12;
            doc.fillColor('#475569')
               .text(finding.description, 50, y, { width: 495, lineGap: 2 });
            y = doc.y + 10;

            // Impact
            doc.fillColor('#64748b')
               .text('Why it matters:', 50, y);
            y += 12;
            doc.fillColor('#475569')
               .text(finding.impact, 50, y, { width: 495, lineGap: 2 });
            y = doc.y + 10;

            // Remediation
            doc.fillColor('#64748b')
               .text('How to fix:', 50, y);
            y += 12;
            doc.fillColor('#475569')
               .text(finding.remediation, 50, y, { width: 495, lineGap: 2 });
            y = doc.y + 20;

            // Separator
            doc.moveTo(50, y)
               .lineTo(545, y)
               .strokeColor('#e2e8f0')
               .stroke();
            y += 15;
         }
      } else {
         doc.roundedRect(50, y, 495, 60, 8)
            .fillColor('#f0fdf4')
            .fill();

         doc.fontSize(12)
            .fillColor('#10b981')
            .text('No Issues Found', 50, y + 15, { width: 495, align: 'center' });

         doc.fontSize(10)
            .fillColor('#64748b')
            .text('No security vulnerabilities were detected.', 50, y + 35, { width: 495, align: 'center' });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
         doc.switchToPage(i);

         doc.fontSize(8)
            .fillColor('#94a3b8')
            .text(
               `Generated by ShipSafe • Page ${i + 1} of ${pageCount}`,
               50,
               780,
               { width: 495, align: 'center' }
            );
      }

      doc.end();
   });
}
