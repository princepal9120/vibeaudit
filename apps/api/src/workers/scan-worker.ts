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
import type { RawFinding, TriagedFinding } from '../services/scanners/types.js';

export async function processScanJob(job: Job<ScanJobData>): Promise<void> {
  const { scanId, githubRepoUrl, liveUrl, branch } = job.data;
  let repoPath: string | null = null;

  try {
    // Update status: Starting
    await updateScanStatus(scanId, 'SCANNING', 'Starting security scan...', 5);
    await job.updateProgress(5);

    const allFindings: RawFinding[] = [];

    // Clone repository if GitHub URL provided
    if (githubRepoUrl) {
      await updateScanStatus(scanId, 'CLONING', 'Cloning repository...', 10);
      await job.updateProgress(10);

      repoPath = await cloneRepository(githubRepoUrl, branch);

      // Run SAST tools in parallel
      await updateScanStatus(scanId, 'SCANNING', 'Running static analysis...', 20);
      await job.updateProgress(20);

      // Phase 1: Run traditional SAST tools in parallel
      const [semgrepFindings, npmAuditFindings, trivyFindings, gitleaksFindings] = await Promise.all([
        runSemgrep(repoPath).catch(err => {
          console.error('Semgrep error:', err);
          return [] as RawFinding[];
        }),
        runNpmAudit(repoPath).catch(err => {
          console.error('npm audit error:', err);
          return [] as RawFinding[];
        }),
        runTrivy(repoPath).catch(err => {
          console.error('Trivy error:', err);
          return [] as RawFinding[];
        }),
        runGitleaks(repoPath).catch(err => {
          console.error('Gitleaks error:', err);
          return [] as RawFinding[];
        }),
      ]);

      allFindings.push(...semgrepFindings, ...npmAuditFindings, ...trivyFindings, ...gitleaksFindings);
      await job.updateProgress(35);

      // Phase 2: Run advanced security scanners in parallel
      await updateScanStatus(scanId, 'SCANNING', 'Running advanced security analysis...', 40);

      const [advancedFindings, configFindings, frameworkFindings] = await Promise.all([
        runAdvancedSecurityScan(repoPath).catch(err => {
          console.error('Advanced security scan error:', err);
          return [] as RawFinding[];
        }),
        runConfigSecurityScan(repoPath).catch(err => {
          console.error('Config security scan error:', err);
          return [] as RawFinding[];
        }),
        runFrameworkSecurityScan(repoPath).catch(err => {
          console.error('Framework security scan error:', err);
          return [] as RawFinding[];
        }),
      ]);

      allFindings.push(...advancedFindings, ...configFindings, ...frameworkFindings);
      await job.updateProgress(45);

      // Phase 3: Run AI-powered deep analysis (separate phase for better progress tracking)
      await updateScanStatus(scanId, 'SCANNING', 'Running AI-powered deep analysis...', 48);

      const aiFindings = await runAIDeepAnalysis(repoPath).catch(err => {
        console.error('AI deep analysis error:', err);
        return [] as RawFinding[];
      });

      allFindings.push(...aiFindings);
      await job.updateProgress(50);
    }

    // Run DAST if live URL provided
    if (liveUrl) {
      await updateScanStatus(scanId, 'SCANNING', 'Running dynamic analysis on live URL...', 55);
      await job.updateProgress(55);

      const zapFindings = await runZap(liveUrl).catch(err => {
        console.error('ZAP error:', err);
        return [] as RawFinding[];
      });

      allFindings.push(...zapFindings);
      await job.updateProgress(62);

      // Phase 5: Launch Readiness Checks (SEO, Performance, Accessibility, Essentials)
      await updateScanStatus(scanId, 'SCANNING', 'Running launch readiness checks...', 63);

      const [seoFindings, perfFindings, a11yFindings, essentialsFindings] = await Promise.all([
        runSeoScanner(liveUrl).catch(err => {
          console.error('SEO scanner error:', err);
          return [] as RawFinding[];
        }),
        runPerformanceScanner(liveUrl).catch(err => {
          console.error('Performance scanner error:', err);
          return [] as RawFinding[];
        }),
        runAccessibilityScanner(liveUrl).catch(err => {
          console.error('Accessibility scanner error:', err);
          return [] as RawFinding[];
        }),
        runEssentialsScanner(liveUrl).catch(err => {
          console.error('Essentials scanner error:', err);
          return [] as RawFinding[];
        }),
      ]);

      allFindings.push(...seoFindings, ...perfFindings, ...a11yFindings, ...essentialsFindings);
      await job.updateProgress(70);
    }

    // Triage and filter findings
    await updateScanStatus(scanId, 'ANALYZING', 'Analyzing and filtering findings...', 75);
    await job.updateProgress(75);

    const triagedFindings = triageFindings(allFindings);

    // Generate AI explanations
    await updateScanStatus(scanId, 'ANALYZING', 'Generating AI-powered explanations...', 80);
    await job.updateProgress(80);

    const enhancedFindings = await generateAIExplanations(triagedFindings);
    await job.updateProgress(90);

    // Calculate security score
    const securityScore = calculateSecurityScore(enhancedFindings);

    // Count findings by severity
    const counts = countBySeverity(enhancedFindings);

    // Create report
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
        executiveSummary: generateExecutiveSummary(securityScore, counts, githubRepoUrl, liveUrl),
        findings: {
          create: enhancedFindings.map(f => ({
            title: f.title,
            severity: f.severity,
            category: f.category,
            source: f.source,
            description: f.description,
            impact: f.impact,
            remediation: f.remediation,
            filePath: f.filePath,
            lineNumber: f.lineNumber,
            codeSnippet: f.codeSnippet,
            confidence: f.confidence,
            aiValidated: f.aiValidated || false,
            rawFinding: f.rawFinding as object,
            ruleId: f.ruleId,
          })),
        },
      },
    });

    // Update scan with completion status
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'COMPLETED',
        progress: 'Scan completed successfully',
        progressPercent: 100,
        completedAt: new Date(),
        totalFindings: enhancedFindings.length,
        criticalCount: counts.CRITICAL,
        highCount: counts.HIGH,
        mediumCount: counts.MEDIUM,
        lowCount: counts.LOW,
      },
    });

    await job.updateProgress(100);
  } catch (error) {
    console.error('Scan job failed:', error);

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        completedAt: new Date(),
      },
    });

    throw error;
  } finally {
    // Cleanup cloned repository
    if (repoPath) {
      await cleanupRepository(repoPath);
    }
  }
}

async function updateScanStatus(
  scanId: string,
  status: 'QUEUED' | 'CLONING' | 'SCANNING' | 'ANALYZING' | 'GENERATING_REPORT' | 'COMPLETED' | 'FAILED',
  progress: string,
  progressPercent: number
): Promise<void> {
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status,
      progress,
      progressPercent,
      ...(status === 'CLONING' ? { startedAt: new Date() } : {}),
    },
  });
}

function triageFindings(findings: RawFinding[]): TriagedFinding[] {
  // Filter out known false positives and low-confidence findings
  return findings
    .filter(f => f.confidence >= 0.5) // Minimum confidence threshold
    .filter(f => !isKnownFalsePositive(f))
    .map(f => ({
      ...f,
      aiValidated: false,
    }));
}

function isKnownFalsePositive(finding: RawFinding): boolean {
  // Check for common false positive patterns
  const fpPatterns = [
    // Test files
    /\.test\.(ts|js|tsx|jsx)$/,
    /\.spec\.(ts|js|tsx|jsx)$/,
    /__tests__\//,
    // Documentation
    /\.md$/,
    // Example/sample directories
    /\/examples?\//i,
    /\/samples?\//i,
    // Mock/stub files
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

function countBySeverity(findings: TriagedFinding[]): Record<string, number> {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const finding of findings) {
    counts[finding.severity]++;
  }
  return counts;
}

function generateExecutiveSummary(
  score: number,
  counts: Record<string, number>,
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
