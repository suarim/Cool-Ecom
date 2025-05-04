const mongoose = require('mongoose');
const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    products:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
},{timestamps:true});
CartSchema.index({userId:1})
const Cart = mongoose.model('Cart', CartSchema);
module.exports = {Cart}