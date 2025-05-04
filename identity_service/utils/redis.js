require('dotenv').config()
const logger = require('./logger')
const redisclient = require('ioredis')
const redis = new redisclient(process.env.REDIS_URI)
logger.info('Connected to Redis')
module.exports = {redis}