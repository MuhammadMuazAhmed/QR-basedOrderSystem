const mongoose = require('mongoose');
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const WaiterCall = require('../models/WaiterCall');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { nextOrderNumber } = require('../utils/orderNumber');
const { getIO, EVENTS } = require('../sockets');

// POST /api/orders
// Body: { tableToken, items: [{ menuItemId, quantity }], notes? }
//
// SECURITY: the client never sends prices. We look up each item's current
// price/availability from the database and compute totals here. This is
// intentional — see project requirement "never trust client-provided prices".
const createOrder = asyncHandler(async (req, res) => {
  const { tableToken, items, notes } = req.body;

  if (!tableToken) throw new ApiError(400, 'tableToken is required');
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'Order must contain at least one item');

  const table = await Table.findOne({ token: tableToken });
  if (!table) throw new ApiError(404, 'Invalid table — please re-scan the QR code on your table');
  if (table.status !== 'active') throw new ApiError(409, 'This table is inactive. Please ask staff for help.');

  // De-dupe / validate requested item ids
  const ids = items.map((i) => i.menuItemId).filter(Boolean);
  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, 'One or more item ids are invalid');
  }

  const dbItems = await MenuItem.find({ _id: { $in: ids } });
  const dbItemsMap = new Map(dbItems.map((i) => [String(i._id), i]));

  const orderItems = [];
  let subtotal = 0;

  for (const requested of items) {
    const qty = Number(requested.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw new ApiError(400, `Invalid quantity for item ${requested.menuItemId}`);
    }
    const dbItem = dbItemsMap.get(String(requested.menuItemId));
    if (!dbItem) throw new ApiError(404, `Menu item ${requested.menuItemId} not found`);
    if (!dbItem.available) throw new ApiError(409, `"${dbItem.name}" is currently unavailable`);

    const lineTotal = Math.round(dbItem.price * qty * 100) / 100;
    subtotal += lineTotal;

    orderItems.push({
      menuItem: dbItem._id,
      name: dbItem.name,
      price: dbItem.price,
      quantity: qty,
      lineTotal,
    });
  }

  const total = Math.round(subtotal * 100) / 100; // room for future tax/service charge

  const orderNumber = await nextOrderNumber();

  const order = await Order.create({
    orderNumber,
    table: table._id,
    tableNumber: table.tableNumber,
    items: orderItems,
    subtotal,
    total,
    notes: notes || '',
    status: 'pending',
  });

  // Notify cashier/kitchen dashboards in real time.
  getIO().to('staff').emit(EVENTS.NEW_ORDER, order);

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders/:id  — used by the customer's order-confirmation screen
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
});

// GET /api/orders  (staff) — active orders by default, ?all=true for history
const listOrders = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { status: { $nin: ['completed', 'cancelled'] } };
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: orders });
});

// PATCH /api/orders/:id/status  (staff)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');

  getIO().to('staff').emit(EVENTS.ORDER_STATUS_UPDATED, order);
  getIO().to(`table:${order.tableNumber}`).emit(EVENTS.ORDER_STATUS_UPDATED, order);

  res.json({ success: true, data: order });
});

// POST /api/orders/waiter-call
// Body: { tableToken }
const callWaiter = asyncHandler(async (req, res) => {
  const { tableToken } = req.body;
  const table = await Table.findOne({ token: tableToken });
  if (!table) throw new ApiError(404, 'Invalid table');

  const call = await WaiterCall.create({ table: table._id, tableNumber: table.tableNumber });
  getIO().to('staff').emit(EVENTS.WAITER_CALL, call);

  res.status(201).json({ success: true, data: call });
});

// PATCH /api/orders/waiter-call/:id/resolve  (staff)
const resolveWaiterCall = asyncHandler(async (req, res) => {
  const call = await WaiterCall.findByIdAndUpdate(
    req.params.id,
    { resolved: true, resolvedAt: new Date() },
    { new: true }
  );
  if (!call) throw new ApiError(404, 'Waiter call not found');

  getIO().to('staff').emit(EVENTS.WAITER_CALL_RESOLVED, call);
  res.json({ success: true, data: call });
});

// GET /api/orders/waiter-calls  (staff) — unresolved calls
const listWaiterCalls = asyncHandler(async (req, res) => {
  const calls = await WaiterCall.find({ resolved: false }).sort({ createdAt: -1 });
  res.json({ success: true, data: calls });
});

module.exports = {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  callWaiter,
  resolveWaiterCall,
  listWaiterCalls,
};
