const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // pure objects as-is store karne ke liye:
  prefference: { type: mongoose.Schema.Types.Mixed, required: true },

  basicDetails: { type: mongoose.Schema.Types.Mixed, required: true },

  userHavePreference: { type: Boolean, default: false }
});

module.exports = mongoose.model('Preference', PreferenceSchema);
