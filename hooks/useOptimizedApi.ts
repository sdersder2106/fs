import { useCallback, useEffect, useRef, useState } from 'react';
import axios, { AxiosError, AxiosRequestConfig, CancelTokenSource } from 'axios';

interface UseApiOptions extends AxiosRequestConfig {
  cache?: boolean;
  cacheTime?: number;
  debounce?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface ApiState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  lastFetch: number | null;
}

// Global cache store
const apiCache = new Map<string, { data: any; timestamp: number }>();

// Optimized API hook with caching, debouncing, and retry logic
export function useOptimizedApi<T = any>(
  url: string | null,
  options: UseApiOptions = {}
) {
  const {
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    debounce = 0,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    ...axiosConfig
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
    lastFetch: null,
  });

  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Generate cache key
  const getCacheKey = useCallback(() => {
    if (!url) return null;
    return `${url}-${JSON.stringify(axiosConfig.params || {})}`;
  }, [url, axiosConfig.params]);

  // Check cache
  const checkCache = useCallback(() => {
    if (!cache || !url) return null;
    
    const cacheKey = getCacheKey();
    if (!cacheKey) return null;

    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    return null;
  }, [cache, cacheTime, getCacheKey, url]);

  // Fetch data with optimization
  const fetchData = useCallback(async () => {
    if (!url) return;

    // Check cache first
    const cachedData = checkCache();
    if (cachedData !== null) {
      setState({
        data: cachedData,
        error: null,
        loading: false,
        lastFetch: Date.now(),
      });
      onSuccess?.(cachedData);
      return;
    }

    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Request cancelled');
    }

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios({
        url,
        ...axiosConfig,
        cancelToken: cancelTokenRef.current.token,
        timeout: axiosConfig.timeout || 10000, // 10s timeout
        headers: {
          'Content-Type': 'application/json',
          ...axiosConfig.headers,
        },
      });

      const data = response.data;

      // Update cache
      if (cache) {
        const cacheKey = getCacheKey();
        if (cacheKey) {
          apiCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });

          // Clean old cache entries
          if (apiCache.size > 100) {
            const oldestKey = Array.from(apiCache.keys())[0];
            apiCache.delete(oldestKey);
          }
        }
      }

      setState({
        data,
        error: null,
        loading: false,
        lastFetch: Date.now(),
      });

      retryCountRef.current = 0;
      onSuccess?.(data);
    } catch (error) {
      if (axios.isCancel(error)) {
        return; // Don't update state for cancelled requests
      }

      const axiosError = error as AxiosError;
      const shouldRetry = 
        retryCountRef.current < retry &&
        axiosError.response?.status !== 401 &&
        axiosError.response?.status !== 403;

      if (shouldRetry) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
        return;
      }

      setState({
        data: null,
        error: axiosError,
        loading: false,
        lastFetch: Date.now(),
      });

      retryCountRef.current = 0;
      onError?.(axiosError);
    }
  }, [url, axiosConfig, cache, getCacheKey, checkCache, retry, retryDelay, onSuccess, onError]);

  // Debounced fetch
  const debouncedFetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (debounce > 0) {
      debounceTimerRef.current = setTimeout(() => {
        fetchData();
      }, debounce);
    } else {
      fetchData();
    }
  }, [debounce, fetchData]);

  // Auto-fetch on mount and URL change
  useEffect(() => {
    if (url) {
      debouncedFetch();
    }

    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [url, debouncedFetch]);

  // Manual refetch
  const refetch = useCallback(() => {
    if (cache) {
      const cacheKey = getCacheKey();
      if (cacheKey) {
        apiCache.delete(cacheKey);
      }
    }
    retryCountRef.current = 0;
    fetchData();
  }, [cache, getCacheKey, fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey();
    if (cacheKey) {
      apiCache.delete(cacheKey);
    }
  }, [getCacheKey]);

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    lastFetch: state.lastFetch,
    refetch,
    clearCache,
  };
}

// Batch API requests to reduce load
export class ApiBatcher {
  private queue: Map<string, Promise<any>> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private batchDelay: number = 50; // 50ms batch window

  async batch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if request is already in queue
    const existing = this.queue.get(key);
    if (existing) {
      return existing;
    }

    // Create new promise
    const promise = new Promise<T>((resolve, reject) => {
      // Clear existing timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
      }

      // Set new timer
      this.batchTimer = setTimeout(() => {
        // Execute all queued requests
        this.executeQueue();
      }, this.batchDelay);

      // Add to queue
      const fetchPromise = fetcher()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.queue.delete(key);
        });

      this.queue.set(key, fetchPromise);
    });

    return promise;
  }

  private executeQueue() {
    // Queue will execute automatically
    this.batchTimer = null;
  }
}

export const apiBatcher = new ApiBatcher();
