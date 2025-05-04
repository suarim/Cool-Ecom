const express = require('express');
const {getallUsers,getUser} = require('../controller/user_controller')
const {logger} = require('../utils/logger');
const userrouter = express.Router();
userrouter.get('/',getallUsers)
userrouter.get('/:id',getUser)
module.exports = userrouter;