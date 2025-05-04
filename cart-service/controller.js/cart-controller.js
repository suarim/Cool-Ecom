const mongoose = require('mongoose');
const { Cart } = require('../models/Cart');
const { sendMessage } = require('../Kafka/producer');
const { stripelink } = require('../Kafka/consumer');
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL)
redis.on('connect', () => {
    console.log('----------------------------->add Connected to Redis');
  });
// console.log('----------------------------->add Connected to Redis');
// let p=await redis.get('x')
// console.log(p)
// console.log('----------------------------->add Connected to Redis');


const AddToCart = async (req, res) => {
    console.log("Add to cart called");
    const {productId,quantity} = req.body;
    try{
        const cart = await Cart.findOne({userId:req.id});
        if(!cart){
            return res.status(404).json({message:'Cart not found'});
        }
        const product = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productId) });

        if(!product){
            return res.status(404).json({message:'Product not found'});
        }
        console.log(product);
        cart.products.push({ productId: new mongoose.Types.ObjectId(productId), quantity });

        console.log(cart.products);

        console.log(product.cost)
        cart.totalPrice += quantity * product.cost;
        console.log(cart.totalPrice);
        cart.totalItems += quantity;
        await cart.save();
        return res.status(200).json({message:'Product added to cart successfully',cart});
        
    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}

const DeleteFromCart = async (req, res) => {
    const productids = req.params.id;
    const cart = await Cart.findOne({userId:req.id});
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    console.log(cart);
    const productIndex = cart.products.findIndex(product => 
        product.productId.toString() === productids.toString()
    );
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }
    const p = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productids) });
    console.log(p);
    const product = cart.products[productIndex];
    cart.products.splice(productIndex, 1);
    cart.totalPrice -= product.quantity * p.cost;
    cart.totalItems -= product.quantity;
    await cart.save();
    return res.status(200).json({ message: 'Product removed from cart successfully', cart });

}

const UpdateCart = async (req, res) => {
    const { productIds, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.id });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    // console.log(cart);
    // console.log(cart.products[0].productId)
    console.log(new mongoose.Types.ObjectId(productIds))
    const productIndex = cart.products.findIndex(product => 
        product.productId.toString() === productIds.toString()
    );
        if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }
    const product = cart.products[productIndex];
    console.log(product);
    const p = await mongoose.connection.db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(productIds) });

    cart.totalPrice += (quantity - product.quantity) * p.cost;
    cart.totalItems += (quantity - product.quantity);
    product.quantity = quantity;

    // console.log(cart.totalPrice);
    // console.log(cart.totalItems);
    await cart.save();
    // console.log(cart);
    return res.status(200).json({ message: 'Cart updated successfully', cart });
}

const GetCart = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.id });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    return res.status(200).json(cart);
}

const Checkout = async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Create a copy of the cart and populate product details
      const cartCopy = JSON.parse(JSON.stringify(cart));
      for (const product of cartCopy.products) {
        const p = await mongoose.connection.db.collection('products').findOne({
          _id: new mongoose.Types.ObjectId(product.productId),
        });
  
        if (!p) {
          return res.status(404).json({ message: `Product with ID ${product.productId} not found` });
        }
  
        product.productname = p.name;
        product.productcost = p.cost;
      }
  
      // Send the cart details to Kafka producer (i.e., for processing further)
      await sendMessage(cartCopy, req.email);
  
      // Ensure the payment link is set in Redis before proceeding
      const stripe_link = await new Promise((resolve, reject) => {
        redis.get('payment-link', (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
  
      if (!stripe_link) {
        return res.status(500).json({ message: 'Stripe payment link not found' });
      }
  
      // Send the payment URL in the response
      return res.status(200).json({ message: 'Checkout successful', url: stripe_link });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  };
  

module.exports = { AddToCart, DeleteFromCart, UpdateCart, GetCart ,Checkout};