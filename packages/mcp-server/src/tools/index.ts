import { scanRepoTool, handleScanRepo } from './scan-repo.js';
import { scanUrlTool, handleScanUrl } from './scan-url.js';
import { getReportTool, handleGetReport } from './get-report.js';
import { listScansTool, handleListScans } from './list-scans.js';

export const tools = [scanRepoTool, scanUrlTool, getReportTool, listScansTool];

export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'scan_repo':
      return handleScanRepo(args);
    case 'scan_url':
      return handleScanUrl(args);
    case 'get_report':
      return handleGetReport(args);
    case 'list_scans':
      return handleListScans(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export { scanRepoTool, scanUrlTool, getReportTool, listScansTool };
