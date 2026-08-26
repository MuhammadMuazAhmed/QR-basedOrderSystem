import { NextResponse } from 'next/server';

// CLIENT_URL should be your deployed client's exact origin, e.g.
// https://qr-cafeteria-client.vercel.app (no trailing slash).
// You can allow multiple origins (e.g. localhost during dev + prod) by
// providing a comma-separated CLIENT_URL, e.g.
// "http://localhost:5173,https://qr-cafeteria-client.vercel.app"
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

function corsHeaders(origin) {
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function middleware(request) {
  const origin = request.headers.get('origin') || '';
  const headers = corsHeaders(origin);

  // Preflight requests never reach the route handler — answer directly.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
