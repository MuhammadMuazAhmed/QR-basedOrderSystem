import { connectDB } from '@/src/lib/db';
import Table from '@/src/models/Table';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

export const PATCH = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const { status } = await req.json();
  if (!['active', 'inactive'].includes(status)) throw new ApiError(400, 'status must be active or inactive');

  const table = await Table.findByIdAndUpdate(params.id, { status }, { new: true });
  if (!table) throw new ApiError(404, 'Table not found');
  return ok(table);
});
