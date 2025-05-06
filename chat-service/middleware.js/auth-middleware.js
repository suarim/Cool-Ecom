const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Authorize = async (req,res,next)=>{
    const token = req.headers.authorization
    auth = token.split(' ')[1]
    if(!auth){
        return res.status(401).json({msg:"Unauthorized"})
    }
    const {id,email} = jwt.verify(auth,process.env.JWT_SECRET)
    if(!id || !email){
        return res.status(401).json({msg:"Unauthorized"})
    }
    const user = await mongoose.connection.db.collection('users').findOne({_id:new mongoose.Types.ObjectId(id)})
    if(!user){
        return res.status(401).json({msg:"Unauthorized"})
    }
    req.id = id
    req.email=email
    next()    
}
module.exports = Authorize