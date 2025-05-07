const {User} = require('../models/User');
const {logger} = require('../utils/logger');
const mongoose = require('mongoose');
const {generateOTP, sendOtpSMS} = require('../utils/twilio');
const { UserRegisterSchemaValidation } = require('../validation/validation');
const { registerUser, loginUser } = require('./identity_controller');

const sendOTPController = async (req,res)=>{
    const {email,password,username,age,type} = req.body;
    if(!type){
        logger.error('Type not provided');
        return res.status(400).json({success:false,message:'Type not provided'});
    }
    if(!email || !password){
        logger.error('Email or password not provided');
        return res.status(400).json({success:false,message:'Email or password not provided'});
    }
    const user = await User.findOne({email});
    if(user && type === 'register'){
        logger.error('User already exists');
        return res.status(400).json({success:false,message:'User already exists'});
    }
    const otp = generateOTP();
    sendOtpSMS("+919632717819",email,otp)
    otpmap = await req.redis.set(email,JSON.stringify({otp,email,password,username,age,type}), 'EX', 300)
    if(otpmap){
        logger.info('OTP sent successfully');
        return res.status(200).json({success:true,message:'OTP sent successfully',data:{
            email,username,age,createdAt:Date.now(),updatedAt:Date.now()
        }});
    }
    else{
        logger.error('Failed to send OTP');
        return res.status(500).json({success:false,message:'Failed to send OTP'});
    }

}

const verifyotp = async (req,res)=>{
    const {user_email,user_otp} = req.body;
    let cachedotp = JSON.parse(await req.redis.get(user_email));
    logger.info('cachedotp',cachedotp);
    if(!cachedotp){
        logger.error('OTP expired');
        return res.status(400).json({success:false,message:'OTP expired'});
    }
    if(user_otp !== cachedotp.otp){
        logger.error('Invalid OTP');
        return res.status(400).json({success:false,message:'Invalid OTP'});
    }
    const {otp,email,password,username,age,type} = cachedotp;
    if(type === 'register'){
    await req.redis.set(`verified:${email}`, 'true', 'EX', 600); 
    req.body = {email,password,username,age}
    // req.redis.del(user_email)
    logger.info('OTP verified successfully');
    return registerUser(req,res);
    }
    else if(type === 'login'){
        await req.redis.set(`verified:${email}`, 'true', 'EX', 600); 
        req.redis.del(user_email)
        logger.info('OTP verified successfully');
        req.body = {email,password}
        // req.redis.del(user_email)
        return loginUser(req,res);
    }
   
}

module.exports = {sendOTPController,verifyotp}