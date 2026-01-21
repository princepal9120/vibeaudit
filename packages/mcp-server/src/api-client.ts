import { config } from './config.js';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface Scan {
  id: string;
  userId: string;
  githubRepoUrl: string | null;
  liveUrl: string | null;
  branch: string | null;
  status: string;
  progress: string | null;
  progressPercent: number | null;
  errorMessage: string | null;
  totalFindings: number | null;
  criticalCount: number | null;
  highCount: number | null;
  mediumCount: number | null;
  lowCount: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  report?: Report | null;
}

interface Report {
  id: string;
  scanId: string;
  securityScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  executiveSummary: string | null;
  pdfUrl: string | null;
  findings?: Finding[];
  createdAt: string;
}

interface Finding {
  id: string;
  reportId: string;
  title: string;
  severity: string;
  category: string;
  source: string;
  description: string;
  impact: string;
  remediation: string;
  filePath: string | null;
  lineNumber: number | null;
  codeSnippet: string | null;
  confidence: number;
  aiValidated: boolean;
  falsePositive: boolean;
}

interface ListScansResponse {
  scans: Scan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(config.requestTimeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json() as T;
      return { data };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          return { error: 'Request timed out' };
        }
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  async createScan(params: {
    githubRepoUrl?: string;
    liveUrl?: string;
    branch?: string;
  }): Promise<ApiResponse<Scan>> {
    return this.request<Scan>('POST', '/api/scans', params);
  }

  async getScan(scanId: string): Promise<ApiResponse<Scan>> {
    return this.request<Scan>('GET', `/api/scans/${scanId}`);
  }

  async listScans(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<ListScansResponse>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    const path = queryString ? `/api/scans?${queryString}` : '/api/scans';
    return this.request<ListScansResponse>('GET', path);
  }

  async getReport(reportId: string): Promise<ApiResponse<Report>> {
    return this.request<Report>('GET', `/api/reports/${reportId}`);
  }

  async waitForScanCompletion(
    scanId: string,
    onProgress?: (scan: Scan) => void
  ): Promise<ApiResponse<Scan>> {
    const startTime = Date.now();

    while (Date.now() - startTime < config.maxWaitTime) {
      const result = await this.getScan(scanId);

      if (result.error) {
        return result;
      }

      if (result.data) {
        if (onProgress) {
          onProgress(result.data);
        }

        const status = result.data.status;
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
          return result;
        }
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, config.pollInterval));
    }

    return { error: 'Scan timed out waiting for completion' };
  }
}

export const apiClient = new ApiClient();

export type { Scan, Report, Finding, ListScansResponse };
