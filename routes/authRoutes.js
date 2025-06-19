const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const upload = require('../middleware/upload');


router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/complete-signup', authController.completeSignup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.sendResetLink);
router.post('/reset-password', authController.resetPassword);
router.post('/talk-to-expert',authController.talkToExpert);
router.post('/updateEmail',authController.updateEmail);
router.post('/update-user-details',authController.updateUserFields)


router.put('/:id/upload-files', upload.fields([
  { name: 'profilePic', maxCount: 3 },
  { name: 'resume', maxCount: 3 }
]), authController.updateProfileMedia);
module.exports = router;
