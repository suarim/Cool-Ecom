const jwt = require('jsonwebtoken');
const {User} = require('../models/User');
const {logger} = require('./logger');

const GenerateToken = async (data)=>{
    logger.info('Generating auth token')
    const token = jwt.sign({id:data.id,email:data.email},process.env.JWT_SECRET,{expiresIn:'7d',algorithm: 'HS256',
        issuer: 'cool-ecom',
        audience: 'nobody'})
    logger.info(`New auth token generated --> ${token}`)
    return token;
}
module.exports = {GenerateToken};