import { type Job } from 'bullmq';
import { prisma } from '../db.js';
import type { ScanJobData } from './queue.js';
import { runSemgrep } from '../services/scanners/semgrep.js';
import { runNpmAudit } from '../services/scanners/npm-audit.js';
import { runTrivy } from '../services/scanners/trivy.js';
import { runZap } from '../services/scanners/zap.js';
import { runGitleaks } from '../services/scanners/gitleaks.js';
import { runAdvancedSecurityScan } from '../services/scanners/advanced-security.js';
import { runConfigSecurityScan } from '../services/scanners/config-security.js';
import { runFrameworkSecurityScan } from '../services/scanners/framework-security.js';
import { runAIDeepAnalysis } from '../services/scanners/ai-deep-analysis.js';
import { runSeoScanner } from '../services/scanners/seo-scanner.js';
import { runPerformanceScanner } from '../services/scanners/performance-scanner.js';
import { runAccessibilityScanner } from '../services/scanners/accessibility-scanner.js';
import { runEssentialsScanner } from '../services/scanners/essentials-scanner.js';
import { cloneRepository, cleanupRepository } from '../services/git.js';
import { generateAIExplanations } from '../services/ai-explanations.js';
import { calculateSecurityScore } from '../services/scoring.js';
import { runConversionAudit } from '../services/conversion-audit.js';
import type { RawFinding, Severity, TriagedFinding } from '../services/scanners/types.js';

type ActiveScanStatus =
  | 'QUEUED'
  | 'CLONING'
  | 'SCANNING'
  | 'ANALYZING'
  | 'GENERATING_REPORT'
  | 'COMPLETED'
  | 'FAILED';

export async function processScanJob(job: Job<ScanJobData>): Promise<void> {
  const { auditType = 'SECURITY' } = job.data;

  if (auditType === 'CONVERSION') {
    await processConversionJob(job);
    return;
  }

  await processSecurityJob(job);
}

async function processSecurityJob(job: Job<ScanJobData>): Promise<void> {
  const { scanId, githubRepoUrl, liveUrl, branch } = job.data;
  let repoPath: string | null = null;

  try {
    await updateScanStatus(scanId, 'SCANNING', 'Starting security scan...', 5);
    await job.updateProgress(5);

    const allFindings: RawFinding[] = [];

    if (githubRepoUrl) {
      await updateScanStatus(scanId, 'CLONING', 'Cloning repository...', 10);
      await job.updateProgress(10);

      repoPath = await cloneRepository(githubRepoUrl, branch);

      await updateScanStatus(scanId, 'SCANNING', 'Running static analysis...', 20);
      await job.updateProgress(20);

      const [semgrepFindings, npmAuditFindings, trivyFindings, gitleaksFindings] = await Promise.all([
        runSemgrep(repoPath).catch((err) => {
          console.error('Semgrep error:', err);
          return [] as RawFinding[];
        }),
        runNpmAudit(repoPath).catch((err) => {
          console.error('npm audit error:', err);
          return [] as RawFinding[];
        }),
        runTrivy(repoPath).catch((err) => {
          console.error('Trivy error:', err);
          return [] as RawFinding[];
        }),
        runGitleaks(repoPath).catch((err) => {
          console.error('Gitleaks error:', err);
          return [] as RawFinding[];
        }),
      ]);

      allFindings.push(...semgrepFindings, ...npmAuditFindings, ...trivyFindings, ...gitleaksFindings);
      await job.updateProgress(35);

      await updateScanStatus(scanId, 'SCANNING', 'Running advanced security analysis...', 40);

      const [advancedFindings, configFindings, frameworkFindings] = await Promise.all([
        runAdvancedSecurityScan(repoPath).catch((err) => {
          console.error('Advanced security scan error:', err);
          return [] as RawFinding[];
        }),
        runConfigSecurityScan(repoPath).catch((err) => {
          console.error('Config security scan error:', err);
          return [] as RawFinding[];
        }),
        runFrameworkSecurityScan(repoPath).catch((err) => {
          console.error('Framework security scan error:', err);
          return [] as RawFinding[];
        }),
      ]);

      allFindings.push(...advancedFindings, ...configFindings, ...frameworkFindings);
      await job.updateProgress(45);

      await updateScanStatus(scanId, 'SCANNING', 'Running AI-powered deep analysis...', 48);

      const aiFindings = await runAIDeepAnalysis(repoPath).catch((err) => {
        console.error('AI deep analysis error:', err);
        return [] as RawFinding[];
      });

      allFindings.push(...aiFindings);
      await job.updateProgress(50);
    }

    if (liveUrl) {
      await updateScanStatus(scanId, 'SCANNING', 'Running dynamic analysis on live URL...', 55);
      await job.updateProgress(55);

      const zapFindings = await runZap(liveUrl).catch((err) => {
        console.error('ZAP error:', err);
        return [] as RawFinding[];
      });

      allFindings.push(...zapFindings);
      await job.updateProgress(62);

      await updateScanStatus(scanId, 'SCANNING', 'Running launch readiness checks...', 63);

      const [seoFindings, perfFindings, a11yFindings, essentialsFindings] = await Promise.all([
        runSeoScanner(liveUrl).catch((err) => {
          console.error('SEO scanner error:', err);
          return [] as RawFinding[];
        }),
        runPerformanceScanner(liveUrl).catch((err) => {
          console.error('Performance scanner error:', err);
          return [] as RawFinding[];
        }),
        runAccessibilityScanner(liveUrl).catch((err) => {
          console.error('Accessibility scanner error:', err);
          return [] as RawFinding[];
        }),
        runEssentialsScanner(liveUrl).catch((err) => {
          console.error('Essentials scanner error:', err);
          return [] as RawFinding[];
        }),
      ]);

      allFindings.push(...seoFindings, ...perfFindings, ...a11yFindings, ...essentialsFindings);
      await job.updateProgress(70);
    }

    await updateScanStatus(scanId, 'ANALYZING', 'Analyzing and filtering findings...', 75);
    await job.updateProgress(75);

    const triagedFindings = triageFindings(allFindings);

    await updateScanStatus(scanId, 'ANALYZING', 'Generating AI-powered explanations...', 80);
    await job.updateProgress(80);

    const enhancedFindings = await generateAIExplanations(triagedFindings);
    await job.updateProgress(90);

    const securityScore = calculateSecurityScore(enhancedFindings);
    const counts = countBySeverity(enhancedFindings);

    await updateScanStatus(scanId, 'GENERATING_REPORT', 'Generating report...', 95);
    await job.updateProgress(95);

    await prisma.report.create({
      data: {
        scanId,
        userId: job.data.userId,
        securityScore,
        totalFindings: enhancedFindings.length,
        criticalCount: counts.CRITICAL,
        highCount: counts.HIGH,
        mediumCount: counts.MEDIUM,
        lowCount: counts.LOW,
        executiveSummary: generateSecurityExecutiveSummary(securityScore, counts, githubRepoUrl, liveUrl),
        findings: {
          create: enhancedFindings.map((finding) => ({
            title: finding.title,
            severity: finding.severity,
            category: finding.category,
            source: finding.source,
            description: finding.description,
            impact: finding.impact,
            remediation: finding.remediation,
            filePath: finding.filePath,
            lineNumber: finding.lineNumber,
            codeSnippet: finding.codeSnippet,
            confidence: finding.confidence,
            aiValidated: finding.aiValidated || false,
            rawFinding: finding.rawFinding as object,
            ruleId: finding.ruleId,
          })),
        },
      },
    });

    await completeScan(scanId, 'Scan completed successfully', enhancedFindings.length, counts);
    await job.updateProgress(100);
  } catch (error) {
    await failScan(scanId, error);
    throw error;
  } finally {
    if (repoPath) {
      await cleanupRepository(repoPath);
    }
  }
}

async function processConversionJob(job: Job<ScanJobData>): Promise<void> {
  const { scanId, liveUrl, userId } = job.data;

  if (!liveUrl) {
    throw new Error('Conversion audits require a live URL');
  }

  try {
    await updateScanStatus(scanId, 'SCANNING', 'Fetching landing page and extracting page signals...', 15);
    await job.updateProgress(15);

    await updateScanStatus(scanId, 'ANALYZING', 'Reviewing clarity, trust, and CTA friction...', 55);
    await job.updateProgress(55);

    const conversionReport = await runConversionAudit(liveUrl);
    const counts = countBySeverity(conversionReport.opportunities);

    await updateScanStatus(scanId, 'GENERATING_REPORT', 'Writing your conversion audit report...', 90);
    await job.updateProgress(90);

    await prisma.report.create({
      data: {
        scanId,
        userId,
        securityScore: conversionReport.score,
        totalFindings: conversionReport.opportunities.length,
        criticalCount: counts.CRITICAL,
        highCount: counts.HIGH,
        mediumCount: counts.MEDIUM,
        lowCount: counts.LOW,
        executiveSummary: conversionReport.executiveSummary,
        conversionData: conversionReport as unknown as object,
        findings: {
          create: conversionReport.opportunities.map((item) => ({
            title: item.title,
            severity: item.severity,
            category: 'OTHER',
            source: 'ADVANCED',
            description: item.description,
            impact: item.impact,
            remediation: item.recommendation,
            confidence: 0.9,
            aiValidated: Boolean(job.data.auditType === 'CONVERSION'),
            rawFinding: {
              auditType: 'CONVERSION',
              category: item.category,
              liveUrl,
            },
            ruleId: `conversion-${item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          })),
        },
      },
    });

    await completeScan(
      scanId,
      'Conversion audit completed successfully',
      conversionReport.opportunities.length,
      counts
    );
    await job.updateProgress(100);
  } catch (error) {
    await failScan(scanId, error);
    throw error;
  }
}

async function updateScanStatus(
  scanId: string,
  status: ActiveScanStatus,
  progress: string,
  progressPercent: number
): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status,
      progress,
      progressPercent,
      ...(progressPercent <= 15 ? { startedAt: new Date() } : {}),
    },
  });
}

async function completeScan(
  scanId: string,
  progress: string,
  totalFindings: number,
  counts: Record<Severity, number>
): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'COMPLETED',
      progress,
      progressPercent: 100,
      completedAt: new Date(),
      totalFindings,
      criticalCount: counts.CRITICAL,
      highCount: counts.HIGH,
      mediumCount: counts.MEDIUM,
      lowCount: counts.LOW,
    },
  });
}

async function failScan(scanId: string, error: unknown): Promise<void> {
  console.error('Scan job failed:', error);

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      completedAt: new Date(),
    },
  });
}

function triageFindings(findings: RawFinding[]): TriagedFinding[] {
  return findings
    .filter((finding) => finding.confidence >= 0.5)
    .filter((finding) => !isKnownFalsePositive(finding))
    .map((finding) => ({
      ...finding,
      aiValidated: false,
    }));
}

function isKnownFalsePositive(finding: RawFinding): boolean {
  const fpPatterns = [
    /\.test\.(ts|js|tsx|jsx)$/,
    /\.spec\.(ts|js|tsx|jsx)$/,
    /__tests__\//,
    /\.md$/,
    /\/examples?\//i,
    /\/samples?\//i,
    /\/__mocks__\//,
    /\.mock\.(ts|js|tsx|jsx)$/,
    /\/fixtures?\//i,
  ];

  if (finding.filePath) {
    for (const pattern of fpPatterns) {
      if (pattern.test(finding.filePath)) {
        return true;
      }
    }
  }

  return false;
}

function countBySeverity(
  findings: Array<{ severity: Severity }>
): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const finding of findings) {
    counts[finding.severity] += 1;
  }

  return counts;
}

function generateSecurityExecutiveSummary(
  score: number,
  counts: Record<Severity, number>,
  repoUrl?: string,
  liveUrl?: string
): string {
  const target = repoUrl || liveUrl || 'the application';
  const total = counts.CRITICAL + counts.HIGH + counts.MEDIUM + counts.LOW;

  let summary = `Security scan of ${target} completed with a score of ${score}/100.\n\n`;

  if (total === 0) {
    summary += 'No security vulnerabilities were detected. ';
  } else {
    summary += `Found ${total} potential security issue${total === 1 ? '' : 's'}:\n`;
    if (counts.CRITICAL > 0) summary += `• ${counts.CRITICAL} Critical\n`;
    if (counts.HIGH > 0) summary += `• ${counts.HIGH} High\n`;
    if (counts.MEDIUM > 0) summary += `• ${counts.MEDIUM} Medium\n`;
    if (counts.LOW > 0) summary += `• ${counts.LOW} Low\n`;
  }

  if (counts.CRITICAL > 0) {
    summary += '\n⚠️ CRITICAL issues require immediate attention before deployment.';
  } else if (counts.HIGH > 0) {
    summary += '\n⚠️ HIGH severity issues should be addressed before production release.';
  } else if (score >= 75) {
    summary += '\n✅ The application has a good security posture with only minor issues to address.';
  }

  return summary;
}
