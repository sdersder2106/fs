import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

export async function requireRole(roles: string | string[]) {
  const session = await requireAuth();
  const roleArray = Array.isArray(roles) ? roles : [roles];

  if (!roleArray.includes(session.user.role)) {
    redirect('/dashboard');
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export function hasRole(userRole: string, allowedRoles: string | string[]): boolean {
  const roleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roleArray.includes(userRole);
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function isAuditor(userRole: string): boolean {
  return ['ADMIN', 'AUDITOR'].includes(userRole);
}

export function canManageUsers(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function canManagePentests(userRole: string): boolean {
  return ['ADMIN', 'AUDITOR'].includes(userRole);
}

export function canManageFindings(userRole: string): boolean {
  return ['ADMIN', 'AUDITOR'].includes(userRole);
}

export function canViewReports(userRole: string): boolean {
  return true; // All roles can view reports
}

export function canGenerateReports(userRole: string): boolean {
  return ['ADMIN', 'AUDITOR'].includes(userRole);
}

export function canDeleteEntities(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function canModifySettings(userRole: string): boolean {
  return userRole === 'ADMIN';
}
