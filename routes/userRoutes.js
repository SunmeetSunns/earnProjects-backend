// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { submitDetails, getPlansByCategory, savePreference,downloadFile,makeUserPlan,findUserPlan } = require('../controller/userController');
const optionalAuth=require('../middleware/optionalAuth')
router.post('/submit-details', auth, upload.single('document'), submitDetails);
router.post('/get-category-wise-plans',optionalAuth,getPlansByCategory)
router.post('/save-prefference',auth,savePreference)
router.get('/:fileKey', downloadFile);
router.post('/saveUserPlan',auth,makeUserPlan);
router.post('/findPlan',auth,findUserPlan)
module.exports = router;
