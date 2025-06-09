const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet()); // security headers
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


// ⏰ CRON JOB: Check expiring subscriptions daily at 9 AM
const cron = require('node-cron');
const Subscription = require('./models/userSubscription');
const { scheduleExpiryEmail } = require('./utils/mailer');

cron.schedule('0 9 * * *', async () => {
  console.log('🔁 Checking subscriptions expiring in 3 days...');
  try {
    const now = new Date();
    const target = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later

    const start = new Date(target.setHours(0, 0, 0, 0));
    const end = new Date(target.setHours(23, 59, 59, 999));

    const subs = await Subscription.find({
      expiryDate: { $gte: start, $lte: end }
    });

    for (const sub of subs) {
      await scheduleExpiryEmail(sub.fullFormData.email, sub.expiryDate, sub.planName);
      console.log(`📧 Reminder sent to ${sub.fullFormData.email}`);
    }
  } catch (err) {
    console.error('❌ Cron job error:', err.message);
  }
});
