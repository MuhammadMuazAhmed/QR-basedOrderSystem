import { connectDB } from '@/src/lib/db';
import Order from '@/src/models/Order';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

export const GET = withHandler(async (req, { params }) => {
  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  return ok(order);
});
