const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/complete-signup', authController.completeSignup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.sendResetLink);
router.post('/reset-password', authController.resetPassword);
router.post('/talk-to-expert',authController.talkToExpert)

module.exports = router;
