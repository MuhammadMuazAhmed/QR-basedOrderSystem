import { connectDB } from '@/src/lib/db';
import WaiterCall from '@/src/models/WaiterCall';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';
import { pusher, CHANNELS, EVENTS } from '@/src/lib/pusher';

export const dynamic = 'force-dynamic';

export const PATCH = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin', 'cashier');

  const call = await WaiterCall.findByIdAndUpdate(
    params.id,
    { resolved: true, resolvedAt: new Date() },
    { new: true }
  );
  if (!call) throw new ApiError(404, 'Waiter call not found');

  await pusher.trigger(CHANNELS.staff, EVENTS.WAITER_CALL_RESOLVED, call);
  return ok(call);
});
