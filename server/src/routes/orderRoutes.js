const express = require('express');
const {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  callWaiter,
  resolveWaiterCall,
  listWaiterCalls,
} = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public — customer app
router.post('/', createOrder);
router.get('/:id', getOrder);
router.post('/waiter-call', callWaiter);

// Staff-only
router.get('/', requireAuth, requireRole('admin', 'cashier'), listOrders);
router.patch('/:id/status', requireAuth, requireRole('admin', 'cashier'), updateOrderStatus);
router.get('/waiter-calls/all', requireAuth, requireRole('admin', 'cashier'), listWaiterCalls);
router.patch('/waiter-call/:id/resolve', requireAuth, requireRole('admin', 'cashier'), resolveWaiterCall);

module.exports = router;
