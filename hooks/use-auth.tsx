'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const hasRole = (roles: string | string[]) => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isAuditor = () => hasRole(['ADMIN', 'AUDITOR']);
  const isClient = () => hasRole('CLIENT');

  const requireAuth = (redirectTo = '/login') => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  };

  const requireRole = (roles: string | string[], redirectTo = '/dashboard') => {
    if (!isLoading && !hasRole(roles)) {
      router.push(redirectTo);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    isAdmin,
    isAuditor,
    isClient,
    requireAuth,
    requireRole,
  };
}
