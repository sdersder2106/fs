// Edge Runtime configuration for better performance on simple APIs

// For auth/me route - convert to Edge
export const authMeConfig = {
  runtime: 'edge',
  regions: ['iad1'], // Deploy close to your database
};

// For search route - keep as Node.js for complex queries
export const searchConfig = {
  runtime: 'nodejs',
  maxDuration: 10,
};

// Helper for Edge-compatible responses
export function edgeResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=59',
    },
  });
}

// Middleware for API optimization
export async function apiMiddleware(request: Request) {
  // Add performance headers
  const headers = new Headers();
  headers.set('X-Response-Time', Date.now().toString());
  
  // Enable compression
  headers.set('Content-Encoding', 'gzip');
  
  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  
  return headers;
}

// Database connection pooling configuration
export const dbConfig = {
  connectionLimit: process.env.NODE_ENV === 'production' ? 10 : 5,
  queueLimit: 0,
  waitForConnections: true,
  connectionTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
};