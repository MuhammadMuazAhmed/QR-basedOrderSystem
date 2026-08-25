const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['cashier', 'admin'], default: 'cashier' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

staffUserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

staffUserSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model('StaffUser', staffUserSchema);
