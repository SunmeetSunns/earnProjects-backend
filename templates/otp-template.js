module.exports = function generateOtpEmail(otp) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Welcome to EarnProjects</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #fff; padding: 30px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #4CAF50;">Welcome to EarnProjects! 🎉</h2>
      <p>Hi there,</p>
      <p>We're thrilled to have you join us at <strong>EarnProjects</strong> – the platform where you can start your journey of <strong>earning while learning</strong>.</p>
      
      <p>🚀 Real projects, no bidding<br>
      📈 Learn by doing<br>
      🤝 Connect with clients directly</p>

      <p style="margin-top: 20px;">To verify your email and get started, please use the OTP below:</p>

      <div style="font-size: 24px; font-weight: bold; color: #000; background: #e0f7fa; padding: 15px; text-align: center; border-radius: 5px;">
        ${otp}
      </div>

      <p style="margin-top: 20px;">This OTP is valid for the next 10 minutes.</p>

      <p>If you did not request this, please ignore this message.</p>

      <p>Welcome aboard!<br>
      <strong>– Team EarnProjects</strong></p>
    </div>
  </body>
  </html>
  `;
};
