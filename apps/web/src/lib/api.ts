// API client for the VibeAudit backend
// Authentication is handled by Better Auth via cookies (credentials: 'include')

// API_URL points to the backend server (e.g., http://localhost:8000)
// We need to append /api for the actual API routes
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_BASE = API_URL ? `${API_URL}/api` : '/api';

interface ApiError {
  error: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for Better Auth session
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Helper for authenticated file downloads
  async fetchWithAuth(url: string): Promise<Blob> {
    const response = await fetch(url, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.blob();
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

  async createScan(data: { auditType?: 'SECURITY' | 'CONVERSION'; githubRepoUrl?: string; liveUrl?: string; branch?: string }) {
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
  // Note: EventSource doesn't support credentials/cookies natively
  // The backend should validate session via other means or use polling instead
  subscribeScanProgress(
    id: number,
    onProgress: (progress: ScanProgress) => void,
    onError?: (error: Error) => void
  ): () => void {
    const url = `${API_BASE}/scans/${id}/progress`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const progress: ScanProgress = JSON.parse(event.data);
        onProgress(progress);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    eventSource.onerror = () => {
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
        currency?: string;
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

  // PRD Review endpoints
  async getPrdReviews(page = 1, limit = 10) {
    return this.request<{
      reviews: PrdReview[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/prd-reviews?page=${page}&limit=${limit}`);
  }

  async getPrdReview(id: string) {
    return this.request<PrdReviewDetail>(`/prd-reviews/${id}`);
  }

  async createPrdReview(data: { title: string; content: string; fileName?: string }) {
    return this.request<{ id: string; title: string; status: PrdReviewStatus; createdAt: string }>(
      '/prd-reviews',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async deletePrdReview(id: string) {
    return this.request<{ message: string }>(`/prd-reviews/${id}`, {
      method: 'DELETE',
    });
  }

  getPrdReviewDownloadUrl(id: string) {
    return `${API_BASE}/prd-reviews/${id}/download`;
  }

  async uploadPrdReviewPdf(id: string) {
    return this.request<{ url: string; fileId: string; size?: number; cached: boolean }>(
      `/prd-reviews/${id}/pdf/upload`,
      { method: 'POST' }
    );
  }

  getPrdReviewPdfUrl(id: string) {
    return `${API_BASE}/prd-reviews/${id}/pdf`;
  }

  async sharePrdReview(id: string, expiresInDays = 30) {
    return this.request<{ shareToken: string; shareUrl: string; expiresAt: string }>(
      `/prd-reviews/${id}/share`,
      {
        method: 'POST',
        body: JSON.stringify({ expiresInDays }),
      }
    );
  }

  async revokePrdReviewShare(id: string) {
    return this.request<{ message: string }>(`/prd-reviews/${id}/share`, {
      method: 'DELETE',
    });
  }

  async getSharedPrdReview(token: string) {
    return this.request<PrdReviewDetail & { authorName: string; isSharedView: boolean }>(
      `/prd-reviews/shared/${token}`
    );
  }

  // Subscription endpoints
  async getCurrentSubscription() {
    return this.request<{
      subscription: {
        plan: SubscriptionPlan;
        planName: string;
        status: SubscriptionStatus;
        currentPeriodEnd: string;
        cancelAtPeriodEnd: boolean;
      };
      usage: {
        scansUsed: number;
        scansLimit: number;
        periodStart: string;
        periodEnd: string;
        isUnlimited: boolean;
      };
    }>('/subscriptions/current');
  }

  async getSubscriptionPlans() {
    return this.request<{
      plans: SubscriptionPlanDetail[];
    }>('/subscriptions/plans');
  }

  async createSubscriptionCheckout() {
    return this.request<{ checkoutUrl: string }>('/subscriptions/checkout', {
      method: 'POST',
    });
  }

  async cancelSubscription() {
    return this.request<{ message: string }>('/subscriptions/cancel', {
      method: 'POST',
    });
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

// PRD Review types
export type PrdReviewStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PrdReview {
  id: string;
  title: string;
  fileName: string | null;
  status: PrdReviewStatus;
  securityScore: number | null;
  processingTimeMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PrdFinding {
  id: string;
  framework: string;
  frameworkItem: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendation: string;
  section?: string;
}

export interface FrameworkCoverage {
  framework: string;
  frameworkName: string;
  coveredItems: string[];
  missingItems: string[];
  coveragePercent: number;
}

export interface PrdReviewDetail extends PrdReview {
  userId: string;
  originalContent: string;
  securedContent: string | null;
  errorMessage: string | null;
  findings: PrdFinding[] | null;
  frameworkCoverage: FrameworkCoverage[] | null;
  // PDF and sharing
  pdfUrl: string | null;
  pdfFileId: string | null;
  shareToken: string | null;
  shareExpiresAt: string | null;
}

// Subscription types
export type SubscriptionPlan = 'FREE' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED';

export interface SubscriptionPlanDetail {
  id: string;
  productId: string;
  name: string;
  price: number;
  priceFormatted: string;
  scansPerMonth: number;
  scansFormatted: string;
  description: string;
  features: string[];
}

// Export singleton instance
export const api = new ApiClient();
