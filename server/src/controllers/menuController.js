const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/menu  -> categories with their items, in display order
const getFullMenu = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean();
  const items = await MenuItem.find({}).sort({ name: 1 }).lean();

  const itemsByCategory = items.reduce((acc, item) => {
    const key = String(item.category);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const menu = categories.map((cat) => ({
    ...cat,
    items: itemsByCategory[String(cat._id)] || [],
  }));

  res.json({ success: true, data: menu });
});

// GET /api/menu/items/:id
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('category', 'name slug');
  if (!item) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, data: item });
});

// ---- Admin/menu-management endpoints ----

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, data: { deleted: true } });
});

const createMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ success: true, data: item });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, data: item });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, data: { deleted: true } });
});

module.exports = {
  getFullMenu,
  getMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
