'use client';

import { useAuth } from '@/hooks/use-auth';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  roles: string | string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard roles="ADMIN" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface AuditorOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuditorOnly({ children, fallback = null }: AuditorOnlyProps) {
  return (
    <RoleGuard roles={['ADMIN', 'AUDITOR']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  return (
    <RoleGuard roles="CLIENT" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
