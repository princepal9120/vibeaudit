/**
 * Custom Hook: useScan
 * Manages fetching and polling a single scan
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL, POLLING_INTERVAL } from '@/lib/constants';
import type { Scan } from '@/lib/types';
import { getErrorMessage, isScanInProgress } from '@/lib/utils';

interface UseScanOptions {
  pollWhileActive?: boolean;
  pollInterval?: number;
}

interface UseScanResult {
  scan: Scan | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isPolling: boolean;
}

export function useScan(scanId: string, options: UseScanOptions = {}): UseScanResult {
  const { pollWhileActive = true, pollInterval = POLLING_INTERVAL } = options;

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchScan = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/scans/${scanId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch scan');
      }

      const data: Scan = await response.json();
      setScan(data);
      setError(null);

      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  // Initial fetch and polling setup
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      if (!mounted) return;

      const data = await fetchScan();

      // Continue polling if scan is still in progress
      if (data && isScanInProgress(data.status) && pollWhileActive) {
        setIsPolling(true);
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      } else {
        setIsPolling(false);
      }
    };

    poll();

    return () => {
      mounted = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchScan, pollWhileActive, pollInterval]);

  return {
    scan,
    loading,
    error,
    refetch: fetchScan,
    isPolling,
  };
}
