import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const pathname = request.nextUrl.pathname;
  
  // Si l'utilisateur est connecté et essaie d'accéder à login/signup
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si l'utilisateur est connecté et sur la page d'accueil
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si l'utilisateur n'est pas connecté et essaie d'accéder au dashboard
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
