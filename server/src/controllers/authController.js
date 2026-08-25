const jwt = require('jsonwebtoken');
const StaffUser = require('../models/StaffUser');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new ApiError(400, 'username and password are required');

  const user = await StaffUser.findOne({ username: username.toLowerCase(), active: true });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  res.json({
    success: true,
    data: { token, staff: { id: user._id, name: user.name, username: user.username, role: user.role } },
  });
});

// GET /api/auth/me (requires auth)
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.staff });
});

module.exports = { login, me };
