import { connectDB } from '@/src/lib/db';
import StaffUser from '@/src/models/StaffUser';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { signStaffToken } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

export const POST = withHandler(async (req) => {
  await connectDB();
  const { username, password } = await req.json();

  if (!username || !password) throw new ApiError(400, 'username and password are required');

  const user = await StaffUser.findOne({ username: username.toLowerCase(), active: true });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const validPassword = await user.comparePassword(password);
  if (!validPassword) throw new ApiError(401, 'Invalid credentials');

  const token = signStaffToken({ id: user._id, username: user.username, role: user.role });

  return ok({
    token,
    staff: { id: user._id, name: user.name, username: user.username, role: user.role },
  });
});
