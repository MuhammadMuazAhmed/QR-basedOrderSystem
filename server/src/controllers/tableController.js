const { nanoid } = require('nanoid');
const Table = require('../models/Table');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/tables/resolve/:token
// Called by the customer app right after a QR scan to identify the table.
const resolveTable = asyncHandler(async (req, res) => {
  const table = await Table.findOne({ token: req.params.token });
  if (!table) throw new ApiError(404, 'Invalid or unknown table QR code');
  if (table.status !== 'active') throw new ApiError(409, 'This table is currently inactive. Please ask staff for help.');
  res.json({ success: true, data: table });
});

// GET /api/tables  (staff)
const listTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({}).sort({ tableNumber: 1 });
  res.json({ success: true, data: tables });
});

// POST /api/tables  (staff) — create a single new table
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber) throw new ApiError(400, 'tableNumber is required');
  const table = await Table.create({ tableNumber, token: nanoid(12) });
  res.status(201).json({ success: true, data: table });
});

// PATCH /api/tables/:id/regenerate  (staff) — issue a new QR token
const regenerateToken = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { token: nanoid(12) },
    { new: true }
  );
  if (!table) throw new ApiError(404, 'Table not found');
  res.json({ success: true, data: table });
});

// PATCH /api/tables/:id/status  (staff) — activate/deactivate
const setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) throw new ApiError(400, 'status must be active or inactive');
  const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!table) throw new ApiError(404, 'Table not found');
  res.json({ success: true, data: table });
});

module.exports = { resolveTable, listTables, createTable, regenerateToken, setStatus };
