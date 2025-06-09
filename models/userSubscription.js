const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: String,
  category: String, // student, professional, agency
  paymentFrequency: String, // Monthly or Yearly
  price: Number,
  discount: Number,
  features: [String],
  noOfLeads: Number,
  fullFormData: Object, // all user form input
  paymentDate: { type: Date, default: Date.now },
  expiryDate: Date,
  paymentStatus: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
