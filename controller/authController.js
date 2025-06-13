const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmailOtp } = require('../utils/mailer');
const nodemailer = require('nodemailer');
let otpStore = {}; // Temporary in-memory OTP store

// ✅ Step 1: Send OTP to email
exports.sendOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) return res.status(400).json({ error: "Email is required" });

  // 🔒 Check if user already signed up
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.name && existingUser.password) {
    return res.status(201).json({ message: "User already exists. Please login.", Status: 201 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    createdAt: Date.now()
  };
  try {
    await sendEmailOtp(email, otp);
    res.status(200).json({ message: "OTP sent to your email", Status: 200 });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ✅ Step 2: Verify OTP with 10-minute expiry
// Step 2: Verify OTP
// ✅ Step 2: Verify OTP with 10-minute expiry
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ error: 'No OTP found for this email', status: 400 });
  }

  // Check OTP expiry (10 minutes)
  if (Date.now() - record.createdAt > 600000) {
    delete otpStore[email];
    return res.status(201).json({ message: 'OTP expired', status: 201 });
  }

  if (record.otp !== otp) {
    return res.status(201).json({ message: 'Invalid OTP', status: 201 });
  }

  // Mark OTP as verified in memory (no DB write yet)
  otpStore[email].isVerified = true;

  res.status(200).json({ message: "OTP verified", verified: true, status: 200 });
};


// ✅ Step 3: Complete Signup
exports.completeSignup = async (req, res) => {
  const { email, name, password, confirmPassword, category, mobile, country_code } = req.body;

  if (!email || !name || !password || !confirmPassword || !category || !mobile) {
    return res.status(201).json({ error: "All fields are required", status: 201 });
  }

  if (password !== confirmPassword) {
    return res.status(201).json({ message: "Passwords do not match", status: 201 });
  }

  // ✅ Check if OTP was verified
  const record = otpStore[email];
  if (!record || !record.isVerified) {
    return res.status(201).json({ message: "Email not verified. Please verify OTP first.", status: 201 });
  }

  let user = await User.findOne({ email });

  // ❌ User already signed up fully
  if (user && user.name && user.password) {
    return res.status(201).json({ error: "User already signed up. Please login.", status: 201 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      // ✅ Create fresh user
      user = new User({
        email,
        name,
        password: hashedPassword,
        unhashedPassword: password,
        category,
        mobile,
        isVerified: true,
        country_code
      });
    } else {
      // ✅ Update existing partial user
      user.name = name;
      user.password = hashedPassword;
      user.unhashedPassword = password;
      user.category = category;
      user.mobile = mobile;
      user.isVerified = true;

    }

    await user.save();

    // ✅ Remove verified OTP from memory
    delete otpStore[email];

    res.status(200).json({ message: "Signup completed successfully", status: 200 });

  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === 11000) {
      return res.status(201).json({ error: "Mobile number already in use", status: 201 });
    }
    res.status(500).json({ error: "Internal Server Error", status: 500 });
  }
};


// ✅ Step 4: Login

const geoip = require('geoip-lite');
const requestIp = require('request-ip');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.password) {
    return res.status(201).json({ message: "Invalid credentials", status: 201 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(201).json({ message: "Invalid credentials", status: 201 });
  }

  try {
    const clientIp = requestIp.getClientIp(req);
    const geo = geoip.lookup(clientIp);
    const countryCode = geo?.country || 'IN';

    // ✅ Only update if country_code not already saved
    if (!user.country_code && countryCode) {
      user.country_code = countryCode;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
      status: 200,
    });

  } catch (err) {
    console.error("❌ JWT error:", err);
    res.status(500).json({ error: "Login failed", status: 500 });
  }
};


exports.sendResetLink = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(201).json({ message: "User not found", status: 201 });

  // Create reset token (valid for 15 mins)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  const resetLink = `https://earnprojects.com/reset-password/${resetToken}`;

  try {
    await sendEmailOtp(email, null, resetLink); // Update sendEmailOtp to support link
    res.status(200).json({ message: "Reset link sent to your email", status: 200 });
  } catch (err) {
    console.error("❌ Error sending reset email:", err);
    res.status(500).json({ error: "Failed to send reset link" });
  }
};
exports.resetPassword = async (req, res) => {
  const { token, password: newPassword } = req.body;


  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password is too short" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) return res.status(201).json({ message: "User not found", status: 201 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.unhashedPassword = newPassword;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully", status: 200 });
  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(201).json({ message: "Invalid or expired token", status: 201 });
  }
};

exports.talkToExpert = async (req, res) => {
  const { phone } = req.body;

  // Basic validation
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: "Valid phone number is required" });
  }

  try {
    // Setup mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    // Compose high-priority email
    const mailOptions = {
      from: `"Talk to Expert" <${process.env.EMAIL_USER}>`,
      to: 'ashok.choudhary@earnprojects.com',  // replace with real admin email
      subject: '🔥 Talk to Expert Request (High Priority)',
      html: `
      <div style="max-width:600px; margin:0 auto; font-family:Arial, sans-serif; border:1px solid #eee; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05); padding:24px;">
        <div style="text-align:center; padding-bottom:20px;">
          <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" alt="Success" width="60" height="60" style="margin-bottom:12px;" />
          <h2 style="color:#2E7D32; margin:0;">New Talk to Expert Request 🚀</h2>
        </div>
        
        <div style="border-top:1px solid #ddd; padding-top:16px;">
          <p style="font-size:16px; color:#333;"><strong>📞 Phone Number:</strong> ${phone}</p>
          <p style="font-size:16px; color:#333;"><strong>🕒 Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-top:30px; text-align:center;">
          <p style="font-size:14px; color:#888;">This is a high priority request. Please contact the user as soon as possible.</p>
        </div>
      </div>
`
      ,
      priority: 'high'
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Your request to talk to an expert has been sent successfully.", status: 200 });
  } catch (error) {
    console.error("❌ Error in talkToExpert:", error);
    return res.status(500).json({ error: "Failed to send email", status: 500 });
  }
};