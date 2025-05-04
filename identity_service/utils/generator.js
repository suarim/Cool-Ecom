const jwt = require('jsonwebtoken');
const {User} = require('../models/User');
const {logger} = require('./logger');

const GenerateToken = async (data)=>{
    logger.info('Generating auth token')
    console.log(data)
    logger.info(data.id)
    const token = jwt.sign({id:data.id,email:data.email},process.env.JWT_SECRET,{expiresIn:'7d'})
    logger.info('New auth token generated')
    return token;
}
module.exports = {GenerateToken};