const mongoose = require('mongoose');
const {logger} = require('../utils/logger');
const {User} = require('../models/User');
const {UserRegisterSchemaValidation,UserLoginSchemaValidation} = require('../validation/validation');
const {GenerateToken} = require('../utils/generator')
const argon2 = require('argon2');
const { date } = require('joi');
const {emitUsercreateEvent} = require('../kafka/producer');

const registerUser = async (req,res)=>{
    if(!await req.redis.get(`verified:${req.body.email}`)){
        logger.error('OTP not verified');
        return res.status(400).json({success:false,message:'OTP not verified'});
    }
    const {email,password,username,age} = req.body;
    const {error} = UserRegisterSchemaValidation(req.body);
    if(error){
        logger.error('Validation error',error);
        return res.status(400).json({message:error.details[0].message});
    }
    const user = await User.find({email});
    if(user.length > 0){
        logger.error('User already exists');
        return res.status(400).json({message:'User already exists'});
    }

    const hashpassword = await argon2.hash(password);
    const newUser = new User({
        email,
        username,
        password:hashpassword,
        age
    })
    await newUser.save()
    const token = await GenerateToken({id:newUser._id,email:newUser.email})
    logger.info('User created successfully');
   await emitUsercreateEvent(newUser._id)
    return res.status(201).json({success:true,message:'User created successfully',data:{
        email,username,age,authToken:token,createdAt:Date.now(),updatedAt:Date.now()
    }});

}

const loginUser = async (req,res) =>{
    if(!await req.redis.get(`verified:${req.body.email}`)){
        logger.error('OTP not verified');
        return res.status(400).json({success:false,message:'OTP not verified'});
    }
    const {email,password} = req.body
    const {error} = UserLoginSchemaValidation(req.body)
    if(error){
        logger.error('Validation error',error);
        return res.status(400).json({message:error.details[0].message});
    }
    const user = await User.findOne({email});
    if(user){
        const match = await argon2.verify(user.password,password)
        if(match){
        logger.info('logged in successfully')
        const token = await GenerateToken({id:user._id,email:user.email})
        return res.status(201).json({success:true,message:'User logged in successfully',data:{
            email:user.email,username:user.username,age:user.age,authToken:token,createdAt:user.createdAt,updatedAt:user.updatedAt
        }});}
        else{
            logger.error('invalid password')
        return res.status(401).json({success:false,message:"invalid password or email"})

        }
    }
    else{
        logger.error('invalid email')
        return res.status(401).json({success:false,message:"invalid password or email"})

    }

}



module.exports = {registerUser,loginUser};