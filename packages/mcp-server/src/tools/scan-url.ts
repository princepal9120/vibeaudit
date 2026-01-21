import { z } from 'zod';
import { apiClient } from '../api-client.js';

export const scanUrlSchema = z.object({
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must use HTTPS',
    })
    .describe('Live URL to scan (must be HTTPS, e.g., https://example.com)'),
  waitForCompletion: z
    .boolean()
    .optional()
    .default(false)
    .describe('If true, wait for the scan to complete before returning results'),
});

export type ScanUrlInput = z.infer<typeof scanUrlSchema>;

export const scanUrlTool = {
  name: 'scan_url',
  description:
    'Scan a live web application for security vulnerabilities (DAST). Checks SSL/TLS configuration, security headers, XSS vulnerabilities, CSRF issues, and more. Provides AI-powered plain-English explanations with fix recommendations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'Live URL to scan (must be HTTPS, e.g., https://example.com)',
      },
      waitForCompletion: {
        type: 'boolean',
        description:
          'If true, wait for the scan to complete before returning results',
        default: false,
      },
    },
    required: ['url'],
  },
};

export async function handleScanUrl(input: unknown): Promise<string> {
  const parsed = scanUrlSchema.parse(input);

  // Create the scan
  const createResult = await apiClient.createScan({
    liveUrl: parsed.url,
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
  liveUrl: string | null;
  status: string;
}): string {
  return `DAST scan created successfully!

**Scan ID:** ${scan.id}
**URL:** ${scan.liveUrl}
**Status:** ${scan.status}

The scan is now running in the background. This typically checks:
- SSL/TLS configuration
- Security headers (CSP, HSTS, etc.)
- XSS vulnerabilities
- Cookie security

Use \`get_report\` with scan ID "${scan.id}" to check the results once completed.`;
}

function formatScanFailed(scan: {
  id: string;
  liveUrl: string | null;
  errorMessage: string | null;
}): string {
  return `DAST scan failed.

**Scan ID:** ${scan.id}
**URL:** ${scan.liveUrl}
**Error:** ${scan.errorMessage || 'Unknown error'}

Possible issues:
- The URL may not be accessible
- The server may be blocking automated scans
- The URL may require authentication

Please verify the URL is accessible and try again.`;
}

function formatScanCompleted(scan: {
  id: string;
  liveUrl: string | null;
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

  let result = `DAST scan completed!

**URL:** ${scan.liveUrl}
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
