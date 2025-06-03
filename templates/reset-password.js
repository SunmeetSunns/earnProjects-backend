module.exports = function generateResetPasswordEmail(resetLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Reset Your Password - EarnProjects</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #fff; padding: 30px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #f44336;">Reset Your Password</h2>
      <p>Hi there,</p>
      <p>We received a request to reset the password for your <strong>EarnProjects</strong> account.</p>

      <p style="margin-top: 20px;">Click the button below to set a new password:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #f44336; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Reset Password
        </a>
      </div>

      <p>This link will expire in 15 minutes for security reasons.</p>
      <p>If you did not request a password reset, please ignore this email. No changes will be made to your account.</p>

      <p>Stay secure,<br>
      <strong>– Team EarnProjects</strong></p>
    </div>
  </body>
  </html>
  `;
};
