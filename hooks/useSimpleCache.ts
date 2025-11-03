'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute

// Generic fetch hook with caching
export function useFetch(url: string, options?: RequestInit) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = `${url}${JSON.stringify(options)}`;
      const cached = cache.get(cacheKey);
      
      // Check cache
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        // Update cache
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url, JSON.stringify(options)]);

  return { data, isLoading, error };
}

// Dashboard hook
export function useDashboard(period: string = '30') {
  return useFetch(`/api/dashboard?period=${period}`);
}

// Pentests hook with pagination
export function usePentests(page: number = 1, limit: number = 10) {
  return useFetch(`/api/pentests?page=${page}&limit=${limit}`);
}

// Findings hook with filters
export function useFindings(filters?: any, page: number = 1, limit: number = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  return useFetch(`/api/findings?${params}`);
}

// Targets hook
export function useTargets(page: number = 1, limit: number = 10) {
  return useFetch(`/api/targets?page=${page}&limit=${limit}`);
}

// Mutation helper
export function useMutation(url: string, method: string = 'POST') {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Clear related cache entries
      cache.clear();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [url, method]);

  return { mutate, isLoading, error };
}

// Create mutations
export function useCreatePentest() {
  return useMutation('/api/pentests', 'POST');
}

export function useCreateFinding() {
  return useMutation('/api/findings', 'POST');
}

export function useCreateTarget() {
  return useMutation('/api/targets', 'POST');
}

// Prefetch helper
export function usePrefetch() {
  const prefetch = useCallback((url: string) => {
    fetch(url, { priority: 'low' as any })
      .then(res => res.json())
      .then(data => {
        cache.set(url, {
          data,
          timestamp: Date.now()
        });
      })
      .catch(() => {}); // Silent fail for prefetch
  }, []);

  return {
    prefetchDashboard: () => prefetch('/api/dashboard'),
    prefetchPentests: () => prefetch('/api/pentests?page=1&limit=10'),
    prefetchFindings: () => prefetch('/api/findings?page=1&limit=10'),
    prefetchTargets: () => prefetch('/api/targets?page=1&limit=10'),
  };
}