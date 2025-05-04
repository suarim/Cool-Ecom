const express = require('express')
const { AddToCart, DeleteFromCart, UpdateCart, GetCart, Checkout } = require('../controller.js/cart-controller')
const router = express.Router()
router.post('/add',AddToCart)
router.delete('/delete/:id',DeleteFromCart)
router.put('/update',UpdateCart)
router.get('/getcart',GetCart)
router.post('/checkout',Checkout)
module.exports = router