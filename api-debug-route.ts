// app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('next-auth.session-token') || 
                       cookieStore.get('__Secure-next-auth.session-token');

  return NextResponse.json({
    // Configuration
    config: {
      nextauth_url: process.env.NEXTAUTH_URL || 'NOT SET',
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      node_env: process.env.NODE_ENV || 'NOT SET',
    },
    // Session info
    session: session || null,
    sessionToken: sessionToken ? 'EXISTS' : 'NOT FOUND',
    // Cookies
    cookies: cookieStore.getAll().map(c => ({
      name: c.name,
      value: c.value ? 'SET' : 'NOT SET'
    })),
    // Debug info
    debug: {
      expected_callback: `${process.env.NEXTAUTH_URL}/api/auth/callback/credentials`,
      expected_session_url: `${process.env.NEXTAUTH_URL}/api/auth/session`,
    }
  });
}
