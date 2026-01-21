import { z } from 'zod';
import { apiClient } from '../api-client.js';

export const scanRepoSchema = z.object({
  repositoryUrl: z
    .string()
    .url()
    .describe('GitHub repository URL to scan (e.g., https://github.com/owner/repo)'),
  branch: z
    .string()
    .optional()
    .default('main')
    .describe('Branch to scan (defaults to "main")'),
  waitForCompletion: z
    .boolean()
    .optional()
    .default(false)
    .describe('If true, wait for the scan to complete before returning results'),
});

export type ScanRepoInput = z.infer<typeof scanRepoSchema>;

export const scanRepoTool = {
  name: 'scan_repo',
  description:
    'Scan a GitHub repository for security vulnerabilities. Detects hardcoded secrets, dependency vulnerabilities, code security issues (SQL injection, XSS, etc.), and provides AI-powered plain-English explanations with fix recommendations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      repositoryUrl: {
        type: 'string',
        description:
          'GitHub repository URL to scan (e.g., https://github.com/owner/repo)',
      },
      branch: {
        type: 'string',
        description: 'Branch to scan (defaults to "main")',
        default: 'main',
      },
      waitForCompletion: {
        type: 'boolean',
        description:
          'If true, wait for the scan to complete before returning results',
        default: false,
      },
    },
    required: ['repositoryUrl'],
  },
};

export async function handleScanRepo(input: unknown): Promise<string> {
  const parsed = scanRepoSchema.parse(input);

  // Create the scan
  const createResult = await apiClient.createScan({
    githubRepoUrl: parsed.repositoryUrl,
    branch: parsed.branch,
  });

  if (createResult.error) {
    throw new Error(`Failed to create scan: ${createResult.error}`);
  }

  const scan = createResult.data!;

  if (!parsed.waitForCompletion) {
    return formatScanCreated(scan);
  }

  // Wait for completion
  const finalResult = await apiClient.waitForScanCompletion(scan.id);

  if (finalResult.error) {
    throw new Error(`Scan failed: ${finalResult.error}`);
  }

  const completedScan = finalResult.data!;

  if (completedScan.status === 'FAILED') {
    return formatScanFailed(completedScan);
  }

  if (completedScan.status === 'CANCELLED') {
    return `Scan ${completedScan.id} was cancelled.`;
  }

  return formatScanCompleted(completedScan);
}

function formatScanCreated(scan: {
  id: string;
  githubRepoUrl: string | null;
  status: string;
}): string {
  return `Scan created successfully!

**Scan ID:** ${scan.id}
**Repository:** ${scan.githubRepoUrl}
**Status:** ${scan.status}

The scan is now running in the background. Use \`get_report\` with scan ID "${scan.id}" to check the results once completed.`;
}

function formatScanFailed(scan: {
  id: string;
  githubRepoUrl: string | null;
  errorMessage: string | null;
}): string {
  return `Scan failed.

**Scan ID:** ${scan.id}
**Repository:** ${scan.githubRepoUrl}
**Error:** ${scan.errorMessage || 'Unknown error'}

Please check the repository URL and try again.`;
}

function formatScanCompleted(scan: {
  id: string;
  githubRepoUrl: string | null;
  totalFindings: number | null;
  criticalCount: number | null;
  highCount: number | null;
  mediumCount: number | null;
  lowCount: number | null;
  report?: {
    id: string;
    securityScore: number;
    executiveSummary: string | null;
  } | null;
}): string {
  const report = scan.report;
  const score = report?.securityScore ?? 'N/A';
  const scoreEmoji = getScoreEmoji(report?.securityScore);

  let result = `Scan completed!

**Repository:** ${scan.githubRepoUrl}
**Security Score:** ${score}/100 ${scoreEmoji}

**Findings Summary:**
- Critical: ${scan.criticalCount ?? 0}
- High: ${scan.highCount ?? 0}
- Medium: ${scan.mediumCount ?? 0}
- Low: ${scan.lowCount ?? 0}
- Total: ${scan.totalFindings ?? 0}`;

  if (report?.executiveSummary) {
    result += `

**Summary:**
${report.executiveSummary}`;
  }

  result += `

Use \`get_report\` with scan ID "${scan.id}" to see detailed findings with explanations and fix recommendations.`;

  return result;
}

function getScoreEmoji(score: number | undefined): string {
  if (score === undefined) return '';
  if (score >= 90) return '(Excellent)';
  if (score >= 75) return '(Good)';
  if (score >= 50) return '(Needs Improvement)';
  return '(Critical Issues)';
}
