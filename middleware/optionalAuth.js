const jwt = require('jsonwebtoken');
const User = require('../models/user');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      req.user = user;
    } catch (err) {
      console.warn('⚠️ Invalid token, proceeding without user');
    }
  }
  next();
};

module.exports = optionalAuth;
