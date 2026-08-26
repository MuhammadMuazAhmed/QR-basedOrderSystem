import { connectDB } from '@/src/lib/db';
import StaffUser from '@/src/models/StaffUser';
import { ok, fail, ApiError, withHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

// POST /api/auth/setup
// Body: { name, username, password, setupSecret }
//
// This is how you create your FIRST admin account in a real deployment —
// there is no seed script that writes credentials into a production
// database. It only works when:
//   1. No staff accounts exist yet (so it can't be used to create rogue
//      admins later — it self-disables after the first successful call), and
//   2. The caller provides SETUP_SECRET, a value only you know (set it as
//      a Vercel environment variable and remove/rotate it after setup).
//
// Recommended flow: call this once right after your first deploy, then
// sign in at /cashier/login on the client with the account you just
// created, and use POST /api/auth/register (admin-only) to create any
// further cashier/admin accounts from there on.
export const POST = withHandler(async (req) => {
  await connectDB();

  const { name, username, password, setupSecret } = await req.json();

  const expectedSecret = process.env.SETUP_SECRET;
  if (!expectedSecret) {
    throw new ApiError(500, 'SETUP_SECRET is not configured on the server — set it in your environment variables first.');
  }
  if (setupSecret !== expectedSecret) {
    throw new ApiError(403, 'Invalid setup secret');
  }

  const existingCount = await StaffUser.countDocuments();
  if (existingCount > 0) {
    throw new ApiError(409, 'Setup has already been completed — an admin account already exists. Use /api/auth/register (signed in as admin) to add more staff.');
  }

  if (!name || !username || !password) {
    throw new ApiError(400, 'name, username and password are required');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const admin = await StaffUser.create({
    name,
    username: username.toLowerCase(),
    passwordHash: await StaffUser.hashPassword(password),
    role: 'admin',
  });

  return ok(
    { id: admin._id, name: admin.name, username: admin.username, role: admin.role },
    201
  );
});
