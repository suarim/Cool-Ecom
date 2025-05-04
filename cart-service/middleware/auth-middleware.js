const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const authmiddleware = async (req, res, next) => {
    let auth = req.headers.authorization;
    auth = auth.split(' ')[1];
    console.log(auth)
    if(!auth){
        return res.status(401).json({message:'Authorization header is missing'});
    }
    const {id,email} = jwt.verify(auth,process.env.JWT_SECRET);
    console.log(id,email)
    const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(id) }); 
    if(!user){
        return res.status(401).json({message:'User not found'});
    }
    req.id = id;
    req.email = email;
    next(); 
}

module.exports = authmiddleware;