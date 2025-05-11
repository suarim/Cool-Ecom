const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:false
    },
    password:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    }, 
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    },
});
UserSchema.index({ createdAt: -1 }); // descending
UserSchema.pre('save',function(next){
    this.updatedAt = Date.now();
    this.createdAt = Date.now();
    next();
})
const User = mongoose.model('User',UserSchema);
module.exports = {User};