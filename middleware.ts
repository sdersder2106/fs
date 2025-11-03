import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    const token = (req as any).nextauth?.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    // Auth page redirects
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

    if (isAuthPage) {
      if (isAuth) {
        // Already logged in, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // Not logged in, allow access to auth pages
      return null;
    }

    // Must be authenticated beyond this point
    if (!isAuth) {
      let from = pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // RBAC - Role-based access control
    const userRole = token?.role as string;

    // Admin-only routes
    const adminOnlyRoutes = [
      '/dashboard/templates',
      '/dashboard/company-settings',
      '/api/templates',
      '/api/companies',
    ];

    const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && userRole !== 'ADMIN') {
      // Not admin, redirect to dashboard
      if (pathname.startsWith('/api/')) {
        // API route - return 403 Forbidden
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'Admin access required' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Pentester and Admin routes
    const pentesterRoutes = [
      '/dashboard/pentests/new',
      '/dashboard/pentests/*/edit',
      '/dashboard/findings/new',
      '/dashboard/findings/*/edit',
      '/api/pentests',
      '/api/findings',
    ];

    const isPentesterRoute = pentesterRoutes.some(route => {
      const pattern = route.replace('*', '.*');
      return new RegExp(`^${pattern}$`).test(pathname);
    });

    if (isPentesterRoute && userRole === 'CLIENT') {
      // Client trying to access pentester route
      if (pathname.startsWith('/api/')) {
        // API route - return 403 Forbidden
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'Pentester access required' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Client read-only restrictions
    if (userRole === 'CLIENT') {
      // Clients can only use GET methods on most API routes
      const method = req.method;
      const isModifyingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');
      
      const clientWritableRoutes = [
        '/api/comments', // Clients can add comments
        '/api/auth', // Auth routes
      ];
      
      const isClientWritable = clientWritableRoutes.some(route => pathname.startsWith(route));

      if (isModifyingMethod && pathname.startsWith('/api/') && !isClientWritable) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden', message: 'Read-only access' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
    }

    // All checks passed
    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This is called before the middleware function above
        // Return true to continue to middleware, false to redirect to signin
        return true; // We handle auth in the middleware function
      },
    },
  }
);

// Configure which routes require authentication
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/api/:path*',
    // Auth routes
    '/login',
    '/signup',
    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
