// const //logger = require('../utils///logger')
const mongoose = require('mongoose');
const {User} = require('../models/User');
const {  getallUsersValidation } = require('../validation/validation');
const getallUsers = async (req,res)=>{
        const {error} = getallUsersValidation(req.body);
        if(error){
            // //logger.error('Validation error',error);
            return res.status(400).json({message:error.details[0].message});
        }
    const {limit,offset} = req.body;
        const cachedusers=await req.redis.get(`listusers;limit:${limit};offset:${offset}`)
        if(cachedusers){
            //logger.info('cache hit')
            const users = JSON.parse(cachedusers);
            return res.status(200).json({success:true,message:"listing all users",users})
        }
        const users = await User.find({}).limit(limit).skip(offset).select('-password')
        req.redis.setex(`listusers;limit:${limit};offset:${offset}`,300,JSON.stringify(users))
        return res.status(200).json({success:true,message:"listing all users",users})
}

const getUser = async (req,res)=>{
    const {id} = req.params;
    const cacheduser = await req.redis.get(`user:${id}`)
    if(cacheduser){
        const user = JSON.parse(cacheduser);
            return res.status(200).json({success:true,message:"listing user",user})
    }
    const user = await User.findById(id).select('-password')
        req.redis.setex(`user:${id}`,300,JSON.stringify(user))
        return res.status(200).json({success:true,message:"listing user",user})
}

module.exports = {getallUsers,getUser}