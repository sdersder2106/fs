import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      nextauth: !!process.env.NEXTAUTH_SECRET && !!process.env.NEXTAUTH_URL,
      pusher: !!process.env.PUSHER_APP_ID && !!process.env.NEXT_PUBLIC_PUSHER_KEY,
    };

    const allHealthy = Object.values(envCheck).every(Boolean);

    if (!allHealthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: envCheck,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database: 'connected',
        nextauth: 'configured',
        pusher: 'configured',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
