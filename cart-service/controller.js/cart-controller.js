const mongoose = require('mongoose');
const { Cart } = require('../models/Cart');
const { sendMessage } = require('../Kafka/producer');
const { stripelink } = require('../Kafka/consumer');
const { invalidateCache } = require('../Redis/Redis');

// console.log('----------------------------->add Connected to Redis');
// let p=await req.redis.get('x')
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
        invalidateCache(`cart:${req.id}`);
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
    invalidateCache(`cart:${req.id}`);
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
    invalidateCache(`cart:${req.id}`);

    // console.log(cart);
    return res.status(200).json({ message: 'Cart updated successfully', cart });
}

const GetCart = async (req, res) => {
  const cartkey = `cart:${req.id}`;
  const cached_cart = await req.redis.get(cartkey);
  if (cached_cart) {
    return res.status(200).json({message:"Cart fetched from cache", cart: JSON.parse(cached_cart)});
  }
    const cart = await Cart.findOne({ userId: req.id });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    await req.redis.setex(cartkey,60 * 60 * 24,JSON.stringify(cart));
    return res.status(200).json(cart);
}

const Checkout = async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.id });
      const {num} = req.body
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
  
      await sendMessage(cartCopy, req.email);
      // await setTimeout(()=>3000)
      // Ensure the payment link is set in Redis before proceeding
      const stripe_link = await new Promise((resolve, reject) => {
        req.redis.get('payment-link', (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
  
      if (!stripe_link) {
        return res.status(500).json({ message: 'Stripe payment link not found' });
      }
      if(num ===0){
        cart.products = [];
        cart.totalPrice = 0;
        cart.totalItems = 0;
        await cart.save();
      }
      // Send the payment URL in the response
      return res.status(200).json({ message: 'Checkout successful', url: stripe_link });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  };
  

module.exports = { AddToCart, DeleteFromCart, UpdateCart, GetCart ,Checkout};