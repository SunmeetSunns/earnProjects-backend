// controllers/bankController.js
const BankDetails = require('../models/bankDetails');
const axios = require('axios');

// Save bank details
exports.saveBankDetails = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      accountNumber,
      confirmAccountNumber,
      ifsc,
      bankName,
      branch,
      accountType,
      upiId,
      swiftCode,
      iban,
      country,
      currency,
      paypalEmail
    } = req.body;

    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({
        Status: 400,
        message: 'Account number and confirm account number do not match'
      });
    }

    const updatedData = {
      fullName,
      accountNumber,
      ifsc,
      bankName,
      branch,
      accountType,
      upiId,
      swiftCode,
      iban,
      country,
      currency,
      paypalEmail
    };

    const result = await BankDetails.findOneAndUpdate(
      { userId },         // Match by userId
      updatedData,        // Update fields
      { upsert: true, new: true } // Insert if not found
    );

    res.status(200).json({
      Status: 200,
      message: 'Bank details saved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      Status: 500,
      message: 'Failed to save bank details',
      error: error.message
    });
  }
};
exports.getBankDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const details = await BankDetails.findOne({ userId });
    console.log(details)
    if (!details) {
      return res.status(404).json({
        Status: 404,
        message: 'Bank details not found for this user'
      });
    }

    res.status(200).json({
      Status: 200,
      message: 'Bank details fetched successfully',
      data: details
    });
  } catch (error) {
    res.status(500).json({
      Status: 500,
      message: 'Error fetching bank details',
      error: error.message
    });
  }
};