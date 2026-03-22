const express = require('express');
const { sendOtp, verifyOtp, login, refreshToken } = require('../controllers/authController');
const { validateAuthInput, validateOTP } = require('../middleware/validation');

const router = express.Router();

// Backwards-compatible route (old register flow)
router.post('/register', validateAuthInput, sendOtp);

router.post('/send-otp', validateAuthInput, sendOtp);
router.post('/verify-otp', validateOTP, verifyOtp);
router.post('/login', validateAuthInput, login);
router.post('/refresh-token', refreshToken);

module.exports = router;
