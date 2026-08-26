import { connectDB } from '@/src/lib/db';
import WaiterCall from '@/src/models/WaiterCall';
import { ok, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = withHandler(async (req) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin', 'cashier');

  const calls = await WaiterCall.find({ resolved: false }).sort({ createdAt: -1 });
  return ok(calls);
});
