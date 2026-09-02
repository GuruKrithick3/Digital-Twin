const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
  name: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

userSchema.statics.comparePassword = function (plain, hash) {
  return bcrypt.compare(plain, hash);
};

module.exports = mongoose.model('User', userSchema);
