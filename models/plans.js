const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({

  planName: String,
  planDescription: String,
  priceINR: Number,
  priceUSD: Number,
  discount: Number,
  features: [String],
  category: String,
  popular: { type: Boolean, default: false },
  noOfLeads: Number
});



module.exports = mongoose.model('Plan', planSchema);
