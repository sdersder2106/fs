import { NextResponse } from 'next/server';

// This endpoint handles legacy polling requests and WebSocket fallbacks
// It prevents 404 errors from Socket.IO polling attempts
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      message: 'Service available',
      timestamp: new Date().toISOString()
    },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex',
      }
    }
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      status: 'ok',
      message: 'Service available',
      timestamp: new Date().toISOString()
    },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex',
      }
    }
  );
}
