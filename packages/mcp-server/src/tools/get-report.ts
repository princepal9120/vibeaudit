import { z } from 'zod';
import { apiClient, type Finding } from '../api-client.js';

export const getReportSchema = z.object({
  scanId: z.string().describe('The scan ID to get the report for'),
  includeLowSeverity: z
    .boolean()
    .optional()
    .default(false)
    .describe('If true, include LOW severity findings in the output'),
  maxFindings: z
    .number()
    .optional()
    .default(10)
    .describe('Maximum number of findings to include in the response (default: 10)'),
});

export type GetReportInput = z.infer<typeof getReportSchema>;

export const getReportTool = {
  name: 'get_report',
  description:
    'Get the security report for a completed scan. Returns the security score, findings with severity levels, plain-English explanations, and fix recommendations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      scanId: {
        type: 'string',
        description: 'The scan ID to get the report for',
      },
      includeLowSeverity: {
        type: 'boolean',
        description: 'If true, include LOW severity findings in the output',
        default: false,
      },
      maxFindings: {
        type: 'number',
        description:
          'Maximum number of findings to include in the response (default: 10)',
        default: 10,
      },
    },
    required: ['scanId'],
  },
};

export async function handleGetReport(input: unknown): Promise<string> {
  const parsed = getReportSchema.parse(input);

  // Get the scan with its report
  const scanResult = await apiClient.getScan(parsed.scanId);

  if (scanResult.error) {
    throw new Error(`Failed to get scan: ${scanResult.error}`);
  }

  const scan = scanResult.data!;

  // Check scan status
  if (scan.status === 'QUEUED' || scan.status === 'CLONING' || scan.status === 'SCANNING' || scan.status === 'ANALYZING' || scan.status === 'GENERATING_REPORT') {
    return formatScanInProgress(scan);
  }

  if (scan.status === 'FAILED') {
    return formatScanFailed(scan);
  }

  if (scan.status === 'CANCELLED') {
    return `Scan ${scan.id} was cancelled and has no report.`;
  }

  if (!scan.report) {
    return `Scan ${scan.id} completed but no report is available.`;
  }

  return formatReport(
    {
      ...scan,
      report: scan.report,
    },
    parsed.includeLowSeverity,
    parsed.maxFindings
  );
}

function formatScanInProgress(scan: {
  id: string;
  status: string;
  progress: string | null;
  progressPercent: number | null;
}): string {
  return `Scan is still in progress.

**Scan ID:** ${scan.id}
**Status:** ${scan.status}
**Progress:** ${scan.progress || 'Processing...'}
**Completion:** ${scan.progressPercent ?? 0}%

Please wait for the scan to complete and try again.`;
}

function formatScanFailed(scan: {
  id: string;
  errorMessage: string | null;
}): string {
  return `Scan failed and has no report.

**Scan ID:** ${scan.id}
**Error:** ${scan.errorMessage || 'Unknown error'}`;
}

function formatReport(
  scan: {
    id: string;
    githubRepoUrl: string | null;
    liveUrl: string | null;
    totalFindings: number | null;
    criticalCount: number | null;
    highCount: number | null;
    mediumCount: number | null;
    lowCount: number | null;
    completedAt: string | null;
    report: {
      securityScore: number;
      executiveSummary: string | null;
      findings?: Finding[];
    };
  },
  includeLowSeverity: boolean,
  maxFindings: number
): string {
  const report = scan.report;
  const score = report.securityScore;
  const target = scan.githubRepoUrl || scan.liveUrl || 'Unknown';

  let result = `# Security Report

**Target:** ${target}
**Security Score:** ${score}/100 ${getScoreIndicator(score)}
**Scanned:** ${scan.completedAt ? new Date(scan.completedAt).toLocaleString() : 'N/A'}

## Summary

| Severity | Count |
|----------|-------|
| Critical | ${scan.criticalCount ?? 0} |
| High | ${scan.highCount ?? 0} |
| Medium | ${scan.mediumCount ?? 0} |
| Low | ${scan.lowCount ?? 0} |
| **Total** | **${scan.totalFindings ?? 0}** |`;

  if (report.executiveSummary) {
    result += `

## Executive Summary

${report.executiveSummary}`;
  }

  // Format findings
  const findings = report.findings || [];
  let filteredFindings = includeLowSeverity
    ? findings
    : findings.filter((f) => f.severity !== 'LOW');

  // Sort by severity (CRITICAL first)
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  filteredFindings.sort(
    (a, b) =>
      (severityOrder[a.severity as keyof typeof severityOrder] ?? 4) -
      (severityOrder[b.severity as keyof typeof severityOrder] ?? 4)
  );

  // Limit findings
  const displayFindings = filteredFindings.slice(0, maxFindings);
  const remainingCount = filteredFindings.length - displayFindings.length;

  if (displayFindings.length > 0) {
    result += `

## Findings`;

    for (const finding of displayFindings) {
      result += formatFinding(finding);
    }

    if (remainingCount > 0) {
      result += `

---
*${remainingCount} more finding(s) not shown. Use \`maxFindings\` parameter to see more.*`;
    }
  } else {
    result += `

## Findings

No findings to display.`;

    if (!includeLowSeverity && (scan.lowCount ?? 0) > 0) {
      result += ` (${scan.lowCount} LOW severity findings hidden. Set \`includeLowSeverity: true\` to see them.)`;
    }
  }

  return result;
}

function formatFinding(finding: Finding): string {
  const severityIcon = getSeverityIcon(finding.severity);

  let result = `

### ${severityIcon} ${finding.title}

**Severity:** ${finding.severity}
**Category:** ${finding.category}
**Source:** ${finding.source}`;

  if (finding.filePath) {
    result += `
**Location:** ${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ''}`;
  }

  result += `

**What it is:**
${finding.description}

**Why it matters:**
${finding.impact}

**How to fix:**
${finding.remediation}`;

  if (finding.codeSnippet) {
    result += `

**Code:**
\`\`\`
${finding.codeSnippet}
\`\`\``;
  }

  return result;
}

function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return '[CRITICAL]';
    case 'HIGH':
      return '[HIGH]';
    case 'MEDIUM':
      return '[MEDIUM]';
    case 'LOW':
      return '[LOW]';
    default:
      return '[INFO]';
  }
}

function getScoreIndicator(score: number): string {
  if (score >= 90) return '(Excellent - Low Risk)';
  if (score >= 75) return '(Good - Some Issues)';
  if (score >= 50) return '(Needs Improvement - Moderate Risk)';
  if (score >= 25) return '(Poor - High Risk)';
  return '(Critical - Immediate Action Required)';
}
