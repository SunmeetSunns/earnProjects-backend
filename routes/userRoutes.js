// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { submitDetails, getPlansByCategory, savePreference,downloadFile,makeUserPlan,findUserPlan, getUserDetails } = require('../controller/userController');
const optionalAuth=require('../middleware/optionalAuth');
const { saveBankDetails, getBankDetails } = require('../controller/bankController');
router.post('/submit-details', auth, upload.single('document'), submitDetails);
router.post('/get-category-wise-plans',optionalAuth,getPlansByCategory)
router.post('/save-prefference',auth,savePreference)
router.post('/saveUserPlan',auth,makeUserPlan);
router.post('/findPlan',auth,findUserPlan);
router.post('/getUserDetails',auth,getUserDetails);
router.post('/saveBankDetails',saveBankDetails);
router.get('/getBankDetails/:userId',auth,getBankDetails)
router.get('/ifsc/:code', auth,async (req, res) => {
  const { code } = req.params;

  try {
    const response = await fetch(`https://ifsc.razorpay.com/${code}`);
    if (!response.ok) {
      return res.status(404).json({ message: 'Invalid IFSC Code' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching IFSC data', error: error.message });
  }
});
module.exports = router;
