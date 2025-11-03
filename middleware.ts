import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow access to auth pages
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth')
  ) {
    // Redirect to dashboard if already logged in
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard and API routes (except /api/auth)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    if (!token) {
      // Redirect to login if not authenticated
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // Return 401 for API routes
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role-based access control
    const userRole = token.role as string;

    // ADMIN-only routes
    if (pathname.startsWith('/dashboard/templates') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // CLIENT company restriction - only access their own company data
    if (userRole === 'CLIENT' && token.companyId) {
      const companyIdMatch = pathname.match(/\/(companies|pentests|targets|findings)\/([^\/]+)/);
      if (companyIdMatch) {
        const requestedCompanyId = companyIdMatch[2];
        // Allow if it's the user's company
        if (requestedCompanyId !== token.companyId) {
          if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
          return NextResponse.json(
            { message: 'Forbidden: Access denied to this resource' },
            { status: 403 }
          );
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
