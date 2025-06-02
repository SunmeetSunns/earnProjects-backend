const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmailOtp } = require('../utils/mailer');

let otpStore = {}; // Temporary in-memory OTP store

// ✅ Step 1: Send OTP to email
exports.sendOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) return res.status(400).json({ error: "Email is required" });

  // 🔒 Check if user already signed up
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.name && existingUser.password) {
    return res.status(201).json({ message: "User already exists. Please login." ,Status:201});
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    createdAt: Date.now()
  };

  console.log("✅ Storing OTP for:", email, otp);

  try {
    await sendEmailOtp(email, otp);
    res.status(200).json({ message: "OTP sent to your email" ,Status:200});
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
  console.log("🔍 Verifying OTP for:", email, otp);
  console.log("🗃️ Available OTPs:", Object.keys(otpStore));

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ error: 'No OTP found for this email' ,status:400});
  }

  // Check OTP expiry (10 minutes)
  if (Date.now() - record.createdAt > 600000) {
    delete otpStore[email];
    return res.status(410).json({ error: 'OTP expired',status:410 });
  }

  if (record.otp !== otp) {
    return res.status(401).json({ error: 'Invalid OTP',status:401 });
  }

  // Mark OTP as verified in memory (no DB write yet)
  otpStore[email].isVerified = true;

  res.status(200).json({ message: "OTP verified", verified: true,status:200 });
};



// ✅ Step 3: Complete Signup
// ✅ Step 3: Complete Signup
exports.completeSignup = async (req, res) => {
  const { email, name, password, confirmPassword, category, mobile } = req.body;

  if (!email || !name || !password || !confirmPassword || !category || !mobile) {
    return res.status(400).json({ error: "All fields are required",status:400 });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" ,status:400});
  }

  // ✅ Check if OTP was verified
  const record = otpStore[email];
  if (!record || !record.isVerified) {
    return res.status(400).json({ error: "Email not verified. Please verify OTP first.",status:400 });
  }

  let user = await User.findOne({ email });

  // ❌ User already signed up fully
  if (user && user.name && user.password) {
    return res.status(400).json({ error: "User already signed up. Please login.",status:400 });
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
        isVerified: true
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

    res.status(200).json({ message: "Signup completed successfully" ,status:200});

  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Mobile number already in use" ,status:400});
    }
    res.status(500).json({ error: "Internal Server Error" ,status:500});
  }
};


// ✅ Step 4: Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid credentials" ,status:401});
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials",status:401 });
  }

  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: "Login successful", token,user ,status:200});
  } catch (err) {
    console.error("❌ JWT error:", err);
    res.status(500).json({ error: "Login failed",status:500 });
  }
};
