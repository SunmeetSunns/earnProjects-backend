// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { submitDetails, getPlansByCategory, savePreference,downloadFile } = require('../controller/userController');

router.post('/submit-details', auth, upload.single('document'), submitDetails);
router.post('/get-category-wise-plans',getPlansByCategory)
router.post('/save-prefference',auth,savePreference)
router.get('/:fileKey', downloadFile);
module.exports = router;
