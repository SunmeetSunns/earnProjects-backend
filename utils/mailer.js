const nodemailer = require('nodemailer');
require('dotenv').config();
const generateOtpEmail = require("../templates/otp-template");
const generateResetPasswordEmail=require("../templates/reset-password.js")

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends either OTP or reset password link to user's email.
 * @param {string} to - Receiver email address
 * @param {string|null} otp - OTP code if needed
 * @param {string|null} resetLink - Password reset link if needed
 */
exports.sendEmailOtp = async (to, otp = null, resetLink = null) => {
  let subject = '';
  let html = '';

  if (otp) {
    subject = 'Your OTP for EarnProjects';
    html = generateOtpEmail(otp); // keep using your existing OTP template
  } else if (resetLink) {
    subject = 'Reset Your Password - EarnProjects';
    html =  generateResetPasswordEmail(resetLink);;
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
