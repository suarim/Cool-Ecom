const express = require('express');
const {registerUser,loginUser} = require('../controller/identity_controller');
const {logger} = require('../utils/logger');
const router = express.Router();
router.post('/register',registerUser)
router.post('/login',loginUser)
module.exports = router;