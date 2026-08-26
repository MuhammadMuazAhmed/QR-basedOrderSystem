import { connectDB } from '@/src/lib/db';
import Order from '@/src/models/Order';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';
import { pusher, CHANNELS, EVENTS } from '@/src/lib/pusher';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export const PATCH = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin', 'cashier');

  const { status } = await req.json();
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new ApiError(400, `status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  const order = await Order.findByIdAndUpdate(params.id, { status }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');

  await Promise.all([
    pusher.trigger(CHANNELS.staff, EVENTS.ORDER_STATUS_UPDATED, order),
    pusher.trigger(CHANNELS.table(order.tableNumber), EVENTS.ORDER_STATUS_UPDATED, order),
  ]);

  return ok(order);
});
