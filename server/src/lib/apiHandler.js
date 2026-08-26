import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}

// Wraps a route handler so any thrown ApiError (or unexpected error)
// becomes a clean JSON error response instead of a raw 500/HTML crash.
// Usage: export const POST = withHandler(async (req, ctx) => { ... return ok(data) })
export function withHandler(handler) {
  return async function wrapped(req, ctx) {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.message, err.statusCode);
      }
      console.error('[api] unexpected error:', err);
      return fail('Internal Server Error', 500);
    }
  };
}
