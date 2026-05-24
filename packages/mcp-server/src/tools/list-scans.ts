import { z } from 'zod';
import { apiClient, type Scan } from '../api-client.js';

export const listScansSchema = z.object({
  status: z
    .enum(['QUEUED', 'CLONING', 'SCANNING', 'ANALYZING', 'GENERATING_REPORT', 'COMPLETED', 'FAILED', 'CANCELLED'])
    .optional()
    .describe('Filter by scan status'),
  page: z
    .number()
    .optional()
    .default(1)
    .describe('Page number for pagination (default: 1)'),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe('Number of scans per page (default: 10, max: 50)'),
});

export type ListScansInput = z.infer<typeof listScansSchema>;

export const listScansTool = {
  name: 'list_scans',
  description:
    'List your security scans with their status and basic results. Use this to see scan history and find scan IDs for detailed reports.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        description: 'Filter by scan status',
        enum: ['QUEUED', 'CLONING', 'SCANNING', 'ANALYZING', 'GENERATING_REPORT', 'COMPLETED', 'FAILED', 'CANCELLED'],
      },
      page: {
        type: 'number',
        description: 'Page number for pagination (default: 1)',
        default: 1,
      },
      limit: {
        type: 'number',
        description: 'Number of scans per page (default: 10, max: 50)',
        default: 10,
      },
    },
    required: [],
  },
};

export async function handleListScans(input: unknown): Promise<string> {
  const parsed = listScansSchema.parse(input);

  const result = await apiClient.listScans({
    page: parsed.page,
    limit: Math.min(parsed.limit, 50),
    status: parsed.status,
  });

  if (result.error) {
    throw new Error(`Failed to list scans: ${result.error}`);
  }

  const { scans, pagination } = result.data!;

  if (scans.length === 0) {
    if (parsed.status) {
      return `No scans found with status "${parsed.status}".`;
    }
    return `No scans found. Use \`scan_repo\` or \`scan_url\` to create your first security scan.`;
  }

  return formatScanList(scans, pagination);
}

function formatScanList(
  scans: Scan[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): string {
  let result = `# Your Security Scans

**Page ${pagination.page} of ${pagination.totalPages}** (${pagination.total} total scans)

| ID | Target | Status | Score | Findings | Date |
|-----|--------|--------|-------|----------|------|`;

  for (const scan of scans) {
    const target = truncateTarget(scan.githubRepoUrl || scan.liveUrl || 'N/A');
    const status = formatStatus(scan.status);
    const score = scan.report?.securityScore ?? '-';
    const findings = scan.totalFindings ?? '-';
    const date = formatDate(scan.createdAt);

    result += `
| ${scan.id.slice(0, 8)}... | ${target} | ${status} | ${score} | ${findings} | ${date} |`;
  }

  result += `

---

**Quick Actions:**
- Use \`get_report\` with a scan ID to see detailed findings
- Use \`scan_repo\` to scan a GitHub repository
- Use \`scan_url\` to scan a live web application`;

  if (pagination.page < pagination.totalPages) {
    result += `
- Use \`page: ${pagination.page + 1}\` to see more scans`;
  }

  return result;
}

function truncateTarget(target: string): string {
  // Remove protocol
  let clean = target.replace(/^https?:\/\//, '');
  // Remove github.com prefix
  clean = clean.replace(/^github\.com\//, '');
  // Truncate if too long
  if (clean.length > 30) {
    return clean.slice(0, 27) + '...';
  }
  return clean;
}

function formatStatus(status: string): string {
  switch (status) {
    case 'QUEUED':
      return 'Queued';
    case 'CLONING':
      return 'Cloning...';
    case 'SCANNING':
      return 'Scanning...';
    case 'ANALYZING':
      return 'Analyzing...';
    case 'GENERATING_REPORT':
      return 'Generating...';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}
