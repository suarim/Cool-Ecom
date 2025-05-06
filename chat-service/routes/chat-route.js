const express = require('express');
const router = express.Router();
const { SendMessage, GetMessages } = require('../controller.js/chat-controller.js');
const Authorize = require('../middleware.js/auth-middleware.js');
router.use(Authorize);
router.post('/send', SendMessage);
router.get('/get/:convid', GetMessages);
module.exports = router;