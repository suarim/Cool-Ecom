const Product = require("../models/models");
const { InvalidateCache } = require("../Redis/redis");
const { ProductValidationSchema } = require("../validation/product-validation");

const getAllProducts = async (req, res) => {
    let {limit,offset} = req.query;
    limit = parseInt(limit);
    offset = parseInt(offset);
    if(!limit || limit > 100){
        limit = 10;
    }
    if(!offset || offset < 0){
        offset = 0;
    }
    cachekey =`products:${limit}:${offset}`;
    const cachedproducts = await req.redis.get(cachekey);
    if(cachedproducts){ 
        return res.status(200).json({message:'Products fetched from cache',data:JSON.parse(cachedproducts)});
    }
    const products = await  Product.find().limit(limit).skip(offset);
    if(!products){
        return res.status(404).json({message:'No products found'});
    }
    await req.redis.setex(cachekey, 3600, JSON.stringify(products));
    return res.status(200).json({message:'Products fetched successfully',data:products});
}

const getProduct = async (req,res)=>{
    const {id} = req.params;
    const cachedproduct = await req.redis.get(`product:${id}`);
    if(cachedproduct){
        return res.status(200).json({message:'Product fetched from cache',data:JSON.parse(cachedproduct)});
    }
    if(!id){
        return res.status(400).json({message:'Product id is required'});
    }
    const product = await Product.find({_id:id});
    if(!product){
        return res.status(404).json({message:'Product not found'});
    }
    await req.redis.setex(`product:${id}`, 3600, JSON.stringify(product));
    return res.status(200).json({message:'Product fetched successfully',data:product});
}

const postProduct = async (req,res)=>{
    const {name,description,cost,category} = req.body;
    const {error} = ProductValidationSchema(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const product = await Product.create({name,description,cost,category});
    if(!product){
        return res.status(500).json({message:'Product not created'});
    }
    InvalidateCache();
    return res.status(201).json({message:'Product created successfully',data:product});
}

const updateProduct = async (req,res)=>{
    const {id} = req.params;
    const {name,description,cost,category} = req.body;
    updatebody={};
    if (name){
        updatebody.name = name;
    }
    if (description){
        updatebody.description = description;
    }
    if (cost){
        updatebody.cost = cost;
    }
    if (category){
        updatebody.category = category;
    }
    const Product_update = await Product.findOneAndUpdate({_id:id},updatebody,{new:true});
    if(!Product_update){
        return res.status(404).json({message:'Product not found'});
    }
    InvalidateCache();
    return res.status(200).json({message:'Product updated successfully',data:Product_update});
}

const deleteProduct = async (req,res)=>{
    const {id} = req.params;
    if(!id){
        return res.status(400).json({message:'Product id is required'});
    }
    const product = await Product.findOneAndDelete({_id:id});
    if(!product){
        return res.status(404).json({message:'Product not found'});
    }
    InvalidateCache();
    return res.status(200).json({message:'Product Deleted successfully',data:product});
}

module.exports={getAllProducts,getProduct,postProduct,updateProduct,deleteProduct}