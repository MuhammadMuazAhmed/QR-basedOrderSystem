const express = require('express');
const {
  resolveTable,
  listTables,
  createTable,
  regenerateToken,
  setStatus,
} = require('../controllers/tableController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public — customer app resolves its table right after a QR scan
router.get('/resolve/:token', resolveTable);

// Staff-only — table/QR management
router.get('/', requireAuth, requireRole('admin', 'cashier'), listTables);
router.post('/', requireAuth, requireRole('admin'), createTable);
router.patch('/:id/regenerate', requireAuth, requireRole('admin'), regenerateToken);
router.patch('/:id/status', requireAuth, requireRole('admin'), setStatus);

module.exports = router;
