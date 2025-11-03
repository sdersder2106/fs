import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionUser } from '@/types';

/**
 * Get the current user session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

/**
 * Require ADMIN role
 * Redirects to dashboard if not admin
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return user;
}

/**
 * Check if user has access to a company's resources
 */
export async function requireCompanyAccess(companyId: string): Promise<SessionUser> {
  const user = await requireAuth();
  
  // ADMIN can access all companies
  if (user.role === 'ADMIN') {
    return user;
  }
  
  // CLIENT can only access their own company
  if (user.companyId !== companyId) {
    redirect('/dashboard');
  }
  
  return user;
}

/**
 * Check if user is authenticated (for API routes)
 * Returns user or throws error
 */
export async function getAuthUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Check if user is ADMIN (for API routes)
 */
export async function requireAdminApi(): Promise<SessionUser> {
  const user = await getAuthUser();
  
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return user;
}

/**
 * Check company access (for API routes)
 */
export async function requireCompanyAccessApi(companyId: string): Promise<SessionUser> {
  const user = await getAuthUser();
  
  // ADMIN can access all companies
  if (user.role === 'ADMIN') {
    return user;
  }
  
  // CLIENT can only access their own company
  if (user.companyId !== companyId) {
    throw new Error('Forbidden: Access denied to this company');
  }
  
  return user;
}
