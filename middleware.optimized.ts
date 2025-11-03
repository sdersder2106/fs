import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Handle Socket.IO polling requests (prevent 404 errors)
  if (
    pathname.includes('/socket.io') ||
    pathname.includes('/transport/polling') ||
    pathname.includes('EIO=') ||
    pathname.includes('transport=polling')
  ) {
    return NextResponse.json(
      { status: 'ok', message: 'WebSocket not available, use REST API' },
      { 
        status: 200,
        headers: {
          'X-Robots-Tag': 'noindex',
          'Cache-Control': 'no-store',
        }
      }
    );
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${ip}-${pathname}`;
    
    const now = Date.now();
    const rateLimit = rateLimitStore.get(rateLimitKey);
    
    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return NextResponse.json(
            { error: 'Too many requests' },
            { 
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((rateLimit.resetTime - now) / 1000)),
                'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
              }
            }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Clean old entries periodically
    if (rateLimitStore.size > 1000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    }
  }

  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public routes
  const publicRoutes = ['/login', '/signup', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // Redirect to dashboard if already logged in
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    const response = NextResponse.next();
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    return response;
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    if (!token) {
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
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

    // CLIENT restrictions
    if (userRole === 'CLIENT' && token.companyId) {
      const resourcePattern = /\/(companies|pentests|targets|findings)\/([^\/]+)/;
      const match = pathname.match(resourcePattern);
      
      if (match) {
        const requestedId = match[2];
        if (requestedId !== token.companyId) {
          if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
          return NextResponse.json(
            { message: 'Forbidden: Access denied' },
            { status: 403 }
          );
        }
      }
    }
  }

  // Add performance headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add performance metrics
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  // Add cache headers for API responses
  if (pathname.startsWith('/api') && request.method === 'GET') {
    const cacheableRoutes = ['/api/dashboard', '/api/companies', '/api/templates'];
    const isCacheable = cacheableRoutes.some(route => pathname.startsWith(route));
    
    if (isCacheable) {
      response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300');
    } else {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico, robots.txt (metadata files)
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
};
