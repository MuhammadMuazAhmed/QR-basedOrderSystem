const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

// Protects cashier/admin-only routes. Customer-facing routes never use this.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Not authorized — missing token'));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.staff = decoded; // { id, username, role }
    next();
  } catch (err) {
    next(new ApiError(401, 'Not authorized — invalid or expired token'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.staff || !roles.includes(req.staff.role)) {
      return next(new ApiError(403, 'Forbidden — insufficient permissions'));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
