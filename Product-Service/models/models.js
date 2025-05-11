const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    name:{
        "type":String,
        "required":true
    },
    description:{
        "type":String,
        "required":true
    },
    cost:{
        "type":Number,
        "required":true
    },
    category:{
        "type":String,
        "enum":['electronics','clothes','books','furniture'],

    }
})
const Product = mongoose.model('Product',ProductSchema);
module.exports = Product;