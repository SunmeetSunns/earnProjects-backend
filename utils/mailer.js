const nodemailer = require('nodemailer');
require('dotenv').config();
const generateOtpEmail = require("../templates/otp-template");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailOtp = async (to, otp) => {
  const mailOptions = {
    from: `EarnProjects <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for EarnProjects',
     html: generateOtpEmail(otp)  
  };
console.log(otp)
  await transporter.sendMail(mailOptions);
};
