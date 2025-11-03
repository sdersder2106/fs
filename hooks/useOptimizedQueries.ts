'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/toast';

// API fetcher with error handling
const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  
  return res.json();
};

// Dashboard hook with caching
export const useDashboard = () => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['dashboard', session?.user?.companyId],
    queryFn: () => fetcher('/api/dashboard'),
    enabled: !!session?.user?.companyId,
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Pentests hook with pagination
export const usePentests = (page: number = 1, limit: number = 10) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['pentests', session?.user?.companyId, page, limit],
    queryFn: () => fetcher(`/api/pentests?page=${page}&limit=${limit}`),
    enabled: !!session?.user?.companyId,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });
};

// Findings hook with filters
export const useFindings = (
  filters?: { severity?: string; status?: string },
  page: number = 1,
  limit: number = 10
) => {
  const { data: session } = useSession();
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(filters?.severity && { severity: filters.severity }),
    ...(filters?.status && { status: filters.status }),
  });
  
  return useQuery({
    queryKey: ['findings', session?.user?.companyId, filters, page, limit],
    queryFn: () => fetcher(`/api/findings?${params}`),
    enabled: !!session?.user?.companyId,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
};

// Targets hook
export const useTargets = (page: number = 1, limit: number = 10) => {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['targets', session?.user?.companyId, page, limit],
    queryFn: () => fetcher(`/api/targets?page=${page}&limit=${limit}`),
    enabled: !!session?.user?.companyId,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
};

// Create pentest mutation with optimistic update
export const useCreatePentest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => 
      fetcher('/api/pentests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onMutate: async (newPentest) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['pentests'] });
      
      // Optimistically update the list
      const previousPentests = queryClient.getQueryData(['pentests']);
      queryClient.setQueryData(['pentests'], (old: any) => ({
        ...old,
        items: [newPentest, ...(old?.items || [])],
        total: (old?.total || 0) + 1,
      }));
      
      return { previousPentests };
    },
    onError: (err, newPentest, context) => {
      // Rollback on error
      queryClient.setQueryData(['pentests'], context?.previousPentests);
      toast({
        title: 'Error',
        description: 'Failed to create pentest',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['pentests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Create finding mutation
export const useCreateFinding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) =>
      fetcher('/api/findings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Success',
        description: 'Finding created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create finding',
        variant: 'destructive',
      });
    },
  });
};

// Prefetch hook for navigation
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  const prefetchDashboard = () => {
    queryClient.prefetchQuery({
      queryKey: ['dashboard', session?.user?.companyId],
      queryFn: () => fetcher('/api/dashboard'),
      staleTime: 60 * 1000,
    });
  };
  
  const prefetchPentests = () => {
    queryClient.prefetchQuery({
      queryKey: ['pentests', session?.user?.companyId, 1, 10],
      queryFn: () => fetcher('/api/pentests?page=1&limit=10'),
      staleTime: 30 * 1000,
    });
  };
  
  const prefetchFindings = () => {
    queryClient.prefetchQuery({
      queryKey: ['findings', session?.user?.companyId, {}, 1, 10],
      queryFn: () => fetcher('/api/findings?page=1&limit=10'),
      staleTime: 30 * 1000,
    });
  };
  
  return {
    prefetchDashboard,
    prefetchPentests,
    prefetchFindings,
  };
};

// Infinite scroll hook for large lists
export const useInfiniteFindings = () => {
  const { data: session } = useSession();
  
  return useInfiniteQuery({
    queryKey: ['findings-infinite', session?.user?.companyId],
    queryFn: ({ pageParam = 1 }) => 
      fetcher(`/api/findings?page=${pageParam}&limit=20`),
    enabled: !!session?.user?.companyId,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000,
  });
};

// WebSocket real-time updates
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Invalidate relevant queries based on update type
      switch (data.type) {
        case 'finding_created':
          queryClient.invalidateQueries({ queryKey: ['findings'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          break;
        case 'pentest_updated':
          queryClient.invalidateQueries({ queryKey: ['pentests'] });
          break;
        case 'target_added':
          queryClient.invalidateQueries({ queryKey: ['targets'] });
          break;
      }
    };
    
    return () => ws.close();
  }, [queryClient]);
};