import { connectDB } from '@/src/lib/db';
import Table from '@/src/models/Table';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export const PATCH = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const table = await Table.findByIdAndUpdate(params.id, { token: nanoid(12) }, { new: true });
  if (!table) throw new ApiError(404, 'Table not found');
  return ok(table);
});
