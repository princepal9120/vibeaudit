// API client for VibeAudit backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiError {
  error: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('vibeaudit_token', token);
    } else {
      localStorage.removeItem('vibeaudit_token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('vibeaudit_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for better-auth session
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async signup(email: string, password: string, name?: string) {
    return this.request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request<User & { scanCount: number }>('/auth/me');
  }

  getGitHubAuthUrl() {
    return `${API_BASE}/auth/github`;
  }

  // Scans endpoints
  async getScans(page = 1, limit = 10) {
    return this.request<{
      scans: Scan[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/scans?page=${page}&limit=${limit}`);
  }

  async getScan(id: number) {
    return this.request<Scan>(`/scans/${id}`);
  }

  async createScan(data: { githubRepoUrl?: string; liveUrl?: string; branch?: string }) {
    return this.request<Scan>('/scans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteScan(id: number) {
    return this.request<{ message: string }>(`/scans/${id}`, {
      method: 'DELETE',
    });
  }

  async rescan(id: number) {
    return this.request<Scan>(`/scans/${id}/rescan`, {
      method: 'POST',
    });
  }

  // SSE for scan progress
  subscribeScanProgress(
    id: number,
    onProgress: (progress: ScanProgress) => void,
    onError?: (error: Error) => void
  ): () => void {
    const token = this.getToken();
    const url = `${API_BASE}/scans/${id}/progress`;

    const eventSource = new EventSource(url, {
      // Note: EventSource doesn't support custom headers, so we use query params in dev
      // In production, use cookies or a different approach
    });

    eventSource.onmessage = (event) => {
      try {
        const progress: ScanProgress = JSON.parse(event.data);
        onProgress(progress);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    eventSource.onerror = (error) => {
      onError?.(new Error('Connection error'));
      eventSource.close();
    };

    return () => eventSource.close();
  }

  // Reports endpoints
  async getReport(id: number) {
    return this.request<Report>(`/reports/${id}`);
  }

  async getSharedReport(token: string) {
    return this.request<Report & { authorName: string; isSharedView: boolean }>(
      `/reports/shared/${token}`
    );
  }

  async shareReport(id: number, expiresInDays = 30) {
    return this.request<{ shareUrl: string; expiresAt: string }>(
      `/reports/${id}/share`,
      {
        method: 'POST',
        body: JSON.stringify({ expiresInDays }),
      }
    );
  }

  async revokeShare(id: number) {
    return this.request<{ message: string }>(`/reports/${id}/share`, {
      method: 'DELETE',
    });
  }

  getPdfUrl(id: number) {
    return `${API_BASE}/reports/${id}/pdf`;
  }

  // Payment endpoints
  async getProducts() {
    return this.request<{
      products: Array<{
        type: ProductType;
        id: string;
        name: string;
        price: number;
        credits: number;
        description: string;
        priceFormatted: string;
        perScanPrice: number;
        perScanFormatted: string;
      }>;
    }>('/payments/products');
  }

  async createCheckoutSession(productType: ProductType) {
    return this.request<{
      paymentId: string;
      paymentLink: string;
    }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ productType }),
    });
  }

  async getScanCredits() {
    return this.request<{
      totalCredits: number;
      usedCredits: number;
      availableCredits: number;
    }>('/payments/credits');
  }

  async getPaymentHistory(page = 1, limit = 10) {
    return this.request<{
      payments: Payment[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/payments/history?page=${page}&limit=${limit}`);
  }
}

// Types
export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  githubId: string | null;
  createdAt: string;
}

export interface Scan {
  id: number;
  userId: number;
  githubRepoUrl: string | null;
  liveUrl: string | null;
  branch: string | null;
  status: ScanStatus;
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
  report?: {
    id: number;
    securityScore: number;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    findings?: Finding[];
  } | null;
}

export type ScanStatus =
  | 'QUEUED'
  | 'CLONING'
  | 'SCANNING'
  | 'ANALYZING'
  | 'GENERATING_REPORT'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ScanProgress {
  status: ScanStatus;
  progress: string | null;
  progressPercent: number | null;
  errorMessage: string | null;
}

export interface Report {
  id: number;
  scanId: number;
  userId: number;
  securityScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  executiveSummary: string | null;
  pdfUrl: string | null;
  shareToken: string | null;
  shareExpiresAt: string | null;
  createdAt: string;
  scan?: {
    githubRepoUrl: string | null;
    liveUrl: string | null;
    createdAt: string;
    completedAt: string | null;
  };
  findings?: Finding[];
}

export interface Finding {
  id: number;
  reportId: number;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
  ruleId: string | null;
  createdAt: string;
}

export type ProductType = 'SCAN_CREDIT' | 'SCAN_BUNDLE_5' | 'SCAN_BUNDLE_10';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  productType: ProductType;
  quantity: number;
  createdAt: string;
  completedAt: string | null;
}

// Export singleton instance
export const api = new ApiClient();
