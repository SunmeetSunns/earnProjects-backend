const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  isVerified: { type: Boolean, default: false },
  category: { type: String, required: true, default: 'professional' },
  mobile: { type: String, required: true, unique: true },
  havePreference: {
    type: Boolean,
    default: false
  },
  resetToken: String,
  resetTokenExpiry: Date,
});

// Prevent model overwrite error in dev (especially with hot reload)
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
