const nodemailer = require('nodemailer');
require('dotenv').config();
const generateOtpEmail = require("../templates/otp-template");
const generateResetPasswordEmail=require("../templates/reset-password.js")
const generateSubscriptionEmail=require('../templates/send-subscriptionMail.js')
const generateExpiryReminderEmail=require('../templates/subscribtion-expiry.js')
const generateEmailUpdateOtpEmail=require('../templates/generateEmailUpdateOtpEmail.js')

// Code usage
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends either OTP or reset password link to user's email.
 * @param {string} to - Receiver email address
 * @param {string|null} otp - OTP code if needed
 * @param {string|null} resetLink - Password reset link if needed
 */
exports.sendEmailOtp = async (to, otp = null, resetLink = null, purpose = 'signup') => {
  let subject = '';
  let html = '';

  if (otp) {
    if (purpose === 'update') {
      subject = 'Confirm Your New Email - EarnProjects';
      html = generateEmailUpdateOtpEmail(otp); // 👈 new template
    } else {
      subject = 'Your OTP for EarnProjects';
      html = generateOtpEmail(otp); // existing signup OTP template
    }
  } else if (resetLink) {
    subject = 'Reset Your Password - EarnProjects';
    html = generateResetPasswordEmail(resetLink);
  } else {
    throw new Error("Either OTP or resetLink must be provided.");
  }

  const mailOptions = {
    from: `EarnProjects <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a subscription confirmation email.
 * @param {string} to - Receiver email
 * @param {object} sub - Subscription object
 */
exports.sendSubscriptionMail = async (to, sub) => {
  const expiry = new Date(sub.expiryDate).toLocaleDateString();
  const html = generateSubscriptionEmail(
    sub.fullFormData?.fullName || 'User',
    sub.planName,
    sub.paymentFrequency,
    expiry
  );
  const mailOptions = {
    from: `EarnProjects <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 Subscribed to ${sub.planName}!`,
    html:html
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a reminder before subscription expiry.
 * @param {string} to - Receiver email
 * @param {Date} expiryDate - Subscription expiry date
 * @param {string} planName - Name of the plan
 */
exports.scheduleExpiryEmail = async (to, expiryDate, planName, fullName = 'User') => {
  const expiry = new Date(expiryDate).toLocaleDateString();
  const html = generateExpiryReminderEmail(fullName, planName, expiry);
  const mailOptions = {
    from: `EarnProjects <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Your ${planName} plan expires soon`,
    html,
  };

  await transporter.sendMail(mailOptions);
};

