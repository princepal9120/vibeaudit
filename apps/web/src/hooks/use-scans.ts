/**
 * Custom Hook: useScans
 * Manages fetching and caching scan list data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_URL, PAGINATION } from '@/lib/constants';
import type { ScanWithReportSummary, ScansResponse, PaginationMeta } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

interface UseScansOptions {
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseScansResult {
  scans: ScanWithReportSummary[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
}

export function useScans(options: UseScansOptions = {}): UseScansResult {
  const {
    page: initialPage = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [scans, setScans] = useState<ScanWithReportSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchScans = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `${API_URL}/api/scans?page=${page}&limit=${limit}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch scans');
      }

      const data: ScansResponse = await response.json();
      setScans(data.scans);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Initial fetch
  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Auto-refresh for active scans
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchScans, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchScans]);

  return {
    scans,
    pagination,
    loading,
    error,
    refetch: fetchScans,
    setPage,
  };
}
