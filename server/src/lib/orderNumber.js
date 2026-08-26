import Order from '../models/Order';

export async function nextOrderNumber() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
  return String(1000 + countToday + 1);
}
