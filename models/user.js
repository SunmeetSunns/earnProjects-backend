const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  unhashedPassword: String,
  isVerified: { type: Boolean, default: false },
  category: { type: String, required: true, default: 'professional' },
  mobile: { type: String, required: true, unique: true },
  country_code: { type: String, required: true },
  havePreference: {
    type: Boolean,
    default: false
  },
  planPurchased: {
    type: Boolean,
    default: false
  },
  portfolioLink: String,
 
  profilePic: {
    url: String,
    public_id: String
  },
  resume: {
    url: String,
    public_id: String
  }
  ,
  resetToken: String,
  resetTokenExpiry: Date,
});

// Prevent model overwrite error in dev (especially with hot reload)
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
