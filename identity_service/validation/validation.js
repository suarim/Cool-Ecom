const JOI = require('joi');
const {logger} = require('../utils/logger');
const UserRegisterSchemaValidation = (data)=>{
    const schema = JOI.object({
        username:JOI.string().min(3).max(30).required(),
        password:JOI.string().min(6).max(20).required(),
        age:JOI.number().min(18).max(100).required(),
        email:JOI.string().email().required(),
    })
    return schema.validate(data);
}

const UserLoginSchemaValidation = (data)=>{
    const schema = JOI.object({
        email:JOI.string().email().required(),
        password:JOI.string().min(6).max(20).required(),
    })
    return schema.validate(data);
}

const getallUsersValidation = (data)=>{
    const schema =JOI.object({
        limit:JOI.number().min(1).max(100).default(10),
        offset:JOI.number().min(0).default(0)
    })
    return schema.validate(data);
}

module.exports = {UserRegisterSchemaValidation,UserLoginSchemaValidation,getallUsersValidation};