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
  createScan: (data: CreateScanRequest) => Promise<Scan | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useCreateScan(): UseCreateScanResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createScan = useCallback(async (data: CreateScanRequest): Promise<Scan | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
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
      return null;
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
