const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cors=require('cors');
require('dotenv').config();

const app = express();
connectDB();
app.use(cors())
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT || 5000, () => {
  console.log('✅ Server running...');
});
