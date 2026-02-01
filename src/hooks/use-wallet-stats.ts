'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WalletStats } from '@/components/wallet-stats-display';

interface UseWalletStatsResult {
  stats: WalletStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: (address: string) => Promise<void>;
  clearStats: () => void;
}

// Cache for wallet stats (in-memory, resets on page refresh)
const statsCache = new Map<string, { data: WalletStats; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useWalletStats(): UseWalletStatsResult {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (address: string) => {
    if (!address) {
      setStats(null);
      setError(null);
      return;
    }

    const normalizedAddress = address.toLowerCase();

    // Check cache first
    const cached = statsCache.get(normalizedAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[useWalletStats] Using cached stats for', normalizedAddress);
      setStats(cached.data);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useWalletStats] Fetching stats for', normalizedAddress);

      const response = await fetch(`/api/wallet-stats?address=${normalizedAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch wallet stats');
      }

      const data: WalletStats = await response.json();

      // Cache the result
      statsCache.set(normalizedAddress, {
        data,
        timestamp: Date.now(),
      });

      setStats(data);
      setError(null);
    } catch (err) {
      console.error('[useWalletStats] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet stats';
      setError(errorMessage);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearStats = useCallback(() => {
    setStats(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearStats,
  };
}
