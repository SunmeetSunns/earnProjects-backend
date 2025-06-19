const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 18
  },
  ifsc: {
    type: String,
    required: true,
    match: /^[A-Z]{4}0[A-Z0-9]{6}$/
  },
  bankName: {
    type: String
  },
  branch: {
    type: String
  },
  accountType: {
    type: String,
    enum: ['savings', 'current'],
    required: true
  },
  upiId: {
    type: String
  },

  // Optional for international users
  swiftCode: {
    type: String
  },
  iban: {
    type: String
  },
  country: {
    type: String
  },
  currency: {
    type: String
  },
  paypalEmail: {
    type: String,
    match: /^\S+@\S+\.\S+$/
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BankDetail', bankDetailSchema);
