const express  = require('express');
const { getAllProducts, getProduct, postProduct, updateProduct, deleteProduct } = require('../controller/controller');
const { verifyUser, AdmminMiddleware } = require('../middleware/auth-middleware');
const router = express.Router();
const { Redis } = require('../Redis/redis');
router.use((req,res,next)=>{
    req.redis = Redis;
    next();
})
router.get('/',verifyUser,getAllProducts)
router.get('/:id',verifyUser,getProduct)
router.post('/',AdmminMiddleware,postProduct)
router.put('/:id',AdmminMiddleware,updateProduct)
router.delete('/:id',AdmminMiddleware,deleteProduct)


module.exports = router;