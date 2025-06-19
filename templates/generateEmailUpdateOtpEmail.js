module.exports = function generateEmailUpdateOtpEmail(otp) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Verify Your New Email – EarnProjects</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #fff; padding: 30px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #4CAF50;">Verify Your New Email Address</h2>
      <p>Hello,</p>
      <p>We received a request to change the email address associated with your <strong>EarnProjects</strong> account.</p>
      
      <p style="margin-top: 20px;">To confirm this change, please use the OTP below:</p>

      <div style="font-size: 24px; font-weight: bold; color: #000; background: #e0f7fa; padding: 15px; text-align: center; border-radius: 5px;">
        ${otp}
      </div>

      <p style="margin-top: 20px;">This OTP is valid for the next 10 minutes.</p>

      <p>If you didn't request to change your email, please ignore this email or contact our support.</p>

      <p>Thanks,<br>
      <strong>Team EarnProjects</strong></p>
    </div>
  </body>
  </html>
  `;
};
