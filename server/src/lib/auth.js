import jwt from 'jsonwebtoken';
import { ApiError } from './apiHandler';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Add it in your .env.local (dev) or Vercel project env vars (prod).');
  }
  return secret;
}

export function signStaffToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

// Throws ApiError(401) if missing/invalid. Returns the decoded { id, username, role }.
export function requireAuth(req) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Not authorized — missing token');

  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    throw new ApiError(401, 'Not authorized — invalid or expired token');
  }
}

// Throws ApiError(403) if the authenticated staff member's role isn't allowed.
export function requireRole(staff, ...roles) {
  if (!roles.includes(staff.role)) {
    throw new ApiError(403, 'Forbidden — insufficient permissions');
  }
}
