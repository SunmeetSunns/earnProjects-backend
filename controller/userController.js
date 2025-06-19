const Plan = require('../models/plans')
const Preference = require('../models/userPrefference')
const MyUser = require('../models/user')
const Subscription = require('../models/userSubscription')
const { sendSubscriptionMail } = require('../utils/mailer')
const nodemailer = require('nodemailer');
const User = require('../models/user');
const { isUserFromIndia } = require('../utils/locationHelper');


exports.submitDetails = async (req, res) => {
  const { fullName, address, collegeName, companyName, agencyName } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const additionalInfo = {};

  if (user.role === 'student') {
    additionalInfo.fullName = fullName;
    additionalInfo.address = address;
    additionalInfo.collegeName = collegeName;
  } else if (user.role === 'professional') {
    additionalInfo.fullName = fullName;
    additionalInfo.companyName = companyName;
  } else if (user.role === 'agency') {
    additionalInfo.agencyName = agencyName;
    additionalInfo.address = address;
  }

  if (req.file) {
    user.document = req.file.filename;
  }

  user.additionalInfo = additionalInfo;
  await user.save();

  res.status(200).json({ message: 'Details submitted successfully' });
};
exports.getPlansByCategory = async (req, res) => {
  try {
    const category = req.body.category;
    const user = req.user || null; // if login logic is used

    const isIndia = isUserFromIndia(req, user);
    const useUSD = !isIndia && category === 'agency';

    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    if (useUSD) {
      query.priceUSD = { $exists: true, $ne: null };
    } else {
      query.priceINR = { $exists: true, $ne: null };
    }

    const plans = await Plan.find(query);

    if (!plans.length) {
      return res.status(404).json({ message: 'No plans found', Status: 404 });
    }

    const formattedPlans = plans.map(plan => ({
      planName: plan.planName,
      planDescription: plan.planDescription,
      price: useUSD ? plan.priceUSD : plan.priceINR,
      discount: plan.discount,
      features: plan.features,
      category: plan.category,
      popular: plan.popular,
      noOfLeads: plan.noOfLeads,
      currency: useUSD ? 'USD' : 'INR',
    }));

    res.status(200).json({ plans: formattedPlans, Status: 200 });

  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Server error', Status: 500 });
  }
};
exports.savePreference = async (req, res) => {
  const userId = req.user.id;

  const prefference = req.body.prefference;
  const basicDetails = req.body.basic_data;

  if (!prefference || !basicDetails) {
    return res.status(400).json({
      message: 'Preference and basicDetails are required',
      Status: 400,
    });
  }

  try {
    let existingPref = await Preference.findOne({ userId });

    if (existingPref) {
      if (existingPref.userHavePreference) {
        // User already submitted preference, no update allowed
        return res.status(403).json({
          message: 'Preference already submitted and cannot be updated',
          Status: 403,
        });
      } else {
        // Update existing preference and mark as submitted
        existingPref.prefference = prefference;
        existingPref.basicDetails = basicDetails;
        existingPref.userHavePreference = true;
        await existingPref.save();

        await MyUser.findByIdAndUpdate(userId, { havePreference: true });

        return res.status(200).json({
          message: 'Preferences saved successfully',
          Status: 200,
        });
      }
    } else {
      // Create new preference and mark as submitted
      const newPref = new Preference({
        userId,
        prefference,
        basicDetails,
        userHavePreference: true,
      });

      await newPref.save();
      await MyUser.findByIdAndUpdate(userId, { havePreference: true }); // ✅ important line

      return res.status(201).json({
        message: 'Preferences saved successfully',
        userHavePreference: true,
        Status: 201,
      });
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({
      message: 'Server error',
      Status: 500,
    });
  }
};


// controllers/downloadController.js
const path = require('path');
const filesMap = {
  terms: 'Terms&Conditions.pdf',
  privacy: 'PrivacyPolicy.pdf',
  // yaha aur bhi add kar sakti ho
};


exports.makeUserPlan = async (req, res) => {
  try {
    const { userId, formDataArray, razorpayOrderId, razorpayPaymentId } = req.body;

    const formData = formDataArray[0];
    const planDetails = formDataArray[1];

    const planDuration = formData.paymentFrequency === 'Yearly' ? 365 : 30;

    const newSub = new Subscription({
      user: userId,
      planName: planDetails.name,
      category: planDetails.plan,
      paymentFrequency: formData.paymentFrequency,
      price: planDetails.amount,
      discount: planDetails.discount,
      features: planDetails.features,
      noOfLeads: planDetails.noOfProj,
      fullFormData: formData,
      expiryDate: new Date(Date.now() + planDuration * 24 * 60 * 60 * 1000),
      razorpayOrderId,
      razorpayPaymentId,
    });

    await newSub.save();

    // ✅ Update user's planPurchased flag
    await User.findByIdAndUpdate(userId, { planPurchased: true });

    // ✅ Send confirmation email
    await sendSubscriptionMail(formData.email, newSub);

    res.status(200).json({ message: '✅ Subscription saved successfully', status: 200 });
  } catch (err) {
    console.error('❌', err);
    res.status(500).json({ message: '❌ Failed to save subscription' });
  }
};

exports.findUserPlan = async (req, res) => {
  const userId = req.body.userId
  const userPlan = await Subscription.findOne({ user: userId });

  if (!userPlan) return res.status(201).json({ message: 'No plan found', status: 201 })
  const planPurchased = userPlan
  res.status(200).json({ planPurchased })

};
exports.getUserDetails = async (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({
      message: 'User ID is required',
      Status: 400,
    });
  }

  try {
    const user = await MyUser.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        Status: 404,
      });
    }

    const preference = await Preference.findOne({ userId }).lean();

    return res.status(200).json({
      message: 'User details fetched successfully',
      user,
      preference: preference || null,
      Status: 200,
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({
      message: 'Server error',
      Status: 500,
    });
  }
};