module.exports = function generateSubscriptionEmail(userName, planName, frequency, expiryDate) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Subscription Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; background: #fff; padding: 30px; margin: auto; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://earnprojects.com/assets/images/hand_logo.png" alt="EarnProjects Logo" style="height: 60px;">
        </div>

        <h2 style="color: #4CAF50;">🎉 Subscribed Successfully!</h2>
        <p>Hi ${userName || 'there'},</p>
        <p>You're now officially part of <strong>EarnProjects</strong> – welcome aboard!</p>

        <p>Here are your subscription details:</p>

        <ul style="line-height: 1.8;">
          <li><strong>Plan Name:</strong> ${planName}</li>
          <li><strong>Payment Frequency:</strong> ${frequency}</li>
          <li><strong>Valid Until:</strong> ${expiryDate}</li>
        </ul>

        <p>🔥 Start exploring real projects, earn while you learn, and grow your portfolio like never before!</p>

        <p>If you have any questions or need support, reply to this email anytime.</p>

        <p style="margin-top: 30px;">Cheers,<br>
        <strong>Team EarnProjects</strong></p>
      </div>
    </body>
  </html>
  `;
};
