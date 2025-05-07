const express = require('express');
const {registerUser,loginUser} = require('../controller/identity_controller');
const {logger} = require('../utils/logger');
const { sendOTPController, verifyotp } = require('../controller/otp_controller');
const router = express.Router();
router.post('/register',registerUser)
router.post('/register/otp',sendOTPController)
router.post('/register/verifyotp',verifyotp)
router.post('/login',loginUser)
module.exports = router;