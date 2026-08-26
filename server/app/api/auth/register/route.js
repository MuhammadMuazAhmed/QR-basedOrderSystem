import { connectDB } from '@/src/lib/db';
import StaffUser from '@/src/models/StaffUser';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/auth/register  (admin only)
// Body: { name, username, password, role }
// The proper, ongoing way to create cashier/admin accounts once the
// first admin exists (see /api/auth/setup for creating that first one).
export const POST = withHandler(async (req) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const { name, username, password, role } = await req.json();

  if (!name || !username || !password) throw new ApiError(400, 'name, username and password are required');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
  if (!['cashier', 'admin'].includes(role)) throw new ApiError(400, 'role must be "cashier" or "admin"');

  const existing = await StaffUser.findOne({ username: username.toLowerCase() });
  if (existing) throw new ApiError(409, 'That username is already taken');

  const user = await StaffUser.create({
    name,
    username: username.toLowerCase(),
    passwordHash: await StaffUser.hashPassword(password),
    role,
  });

  return ok({ id: user._id, name: user.name, username: user.username, role: user.role }, 201);
});
