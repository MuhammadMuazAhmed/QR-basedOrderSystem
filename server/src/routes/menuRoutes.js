const express = require('express');
const {
  getFullMenu,
  getMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public — customer app
router.get('/', getFullMenu);
router.get('/items/:id', getMenuItem);

// Staff-only — menu management
router.post('/categories', requireAuth, requireRole('admin'), createCategory);
router.patch('/categories/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/categories/:id', requireAuth, requireRole('admin'), deleteCategory);

router.post('/items', requireAuth, requireRole('admin'), createMenuItem);
router.patch('/items/:id', requireAuth, requireRole('admin'), updateMenuItem);
router.delete('/items/:id', requireAuth, requireRole('admin'), deleteMenuItem);

module.exports = router;
