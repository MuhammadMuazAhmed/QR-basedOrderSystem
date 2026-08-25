const Order = require('../models/Order');

// Produces order numbers like "1001", "1002", ... based on how many orders
// exist today. Simple and readable on a receipt / cashier screen.
async function nextOrderNumber() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
  const seq = 1000 + countToday + 1;
  return String(seq);
}

module.exports = { nextOrderNumber };
