module.exports = function generateExpiryReminderEmail(userName, planName, expiryDate) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Plan Expiry Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; background: #fff; padding: 30px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://earnprojects.com/assets/images/hand_logo.png" alt="EarnProjects Logo" style="height: 60px;">
        </div>

        <h2 style="color: #FF9800;">⏰ Your Plan is Expiring Soon</h2>
        <p>Hi ${userName || 'there'},</p>

        <p>Your <strong>${planName}</strong> subscription will expire on <strong>${expiryDate}</strong>.</p>

        <p>To continue enjoying access to:</p>
        <ul style="line-height: 1.8;">
          <li>🚀 Real-world client projects</li>
          <li>📈 Skill growth via experience</li>
          <li>🤝 Direct project offers</li>
        </ul>

        <p style="margin-top: 20px;">
          Renew your subscription today and stay ahead!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://earnprojects.com/login" style="padding: 12px 25px; background-color: #7C3AED; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
        </div>

        <p>If you've already renewed, you can ignore this message.</p>

        <p style="margin-top: 30px;">Best,<br>
        <strong>Team EarnProjects</strong></p>
      </div>
    </body>
  </html>
  `;
};
