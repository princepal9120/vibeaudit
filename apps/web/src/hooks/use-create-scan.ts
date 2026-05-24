/**
 * Custom Hook: useCreateScan
 * Manages scan creation with loading and error states
 */

'use client';

import { useState, useCallback } from 'react';
import { API_URL } from '@/lib/constants';
import type { Scan, CreateScanRequest } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

interface UseCreateScanResult {
  createScan: (data: CreateScanRequest) => Promise<Scan>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCreateScan(): UseCreateScanResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createScan = useCallback(async (data: CreateScanRequest): Promise<Scan> => {
    setLoading(true);
    setError(null);

    try {
      let body: string | FormData;
      const headers: HeadersInit = {};

      if (data.file) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('file', data.file);
        if (data.auditType) formData.append('auditType', data.auditType);
        if (data.githubRepoUrl) formData.append('githubRepoUrl', data.githubRepoUrl);
        if (data.liveUrl) formData.append('liveUrl', data.liveUrl);
        if (data.branch) formData.append('branch', data.branch);

        body = formData;
        // Content-Type header is omitted to let browser set it with boundary
      } else {
        // Use JSON for standard requests
        body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_URL}/api/scans`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create scan');
      }

      const scan: Scan = await response.json();
      return scan;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createScan,
    loading,
    error,
    clearError,
  };
}
