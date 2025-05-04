const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ 
  groupId: 'cart-groudsp44d3f4',
  sessionTimeout: 45000,
  heartbeatInterval: 3000
});

// Setup Nodemailer transporter (dev mode)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'emma.kreiger@ethereal.email',
    pass: process.env.EMAIL_SECRET
  },
});

const run = async () => {
  try {
    // Connect to consumer
    await consumer.connect();
    console.log('✅ Kafka Consumer connected successfully');

    // Subscribe to topic
    await consumer.subscribe({ 
      topic: 'cart-checkout', 
      fromBeginning: false 
    });
    console.log('✅ Subscribed to cart-checkout topic');

    // Run consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          console.log('🔥 Message received:', message.value.toString());

          // Parse the message
          const value = JSON.parse(message.value.toString());

          // Extract relevant information
          const { 
            cart,email
          } = value;
          totalPrice = cart.totalPrice;
          totalItems = cart.totalItems;
          products = cart.products;
          console.log("----->",email, cart.totalPrice, cart.totalItems, cart.products);
  
          // Prepare email options
          const mailOptions = {
            from: '"Cool Ecom 👟" <muhammadsuarim@gmail.com>',
            to: email,
            subject: '🛒 Your Checkout Summary',
            html: `
              <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Cool Ecom Order</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #f0f0f0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #3f51b5;
    }
    .checkmark {
      width: 60px;
      height: 60px;
      background-color: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px auto;
    }
    .checkmark-icon {
      color: white;
      font-size: 32px;
    }
    .order-details {
      background-color: #f5f7ff;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .summary-row:last-child {
      border-bottom: none;
    }
    .product-list {
      padding: 0;
    }
    .product-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      margin-bottom: 8px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    .price {
      font-weight: bold;
      color: #3f51b5;
    }
    .total {
      font-size: 18px;
      font-weight: bold;
      color: #3f51b5;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #eee;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      margin-top: 20px;
      color: #777;
      font-size: 14px;
      border-top: 2px solid #f0f0f0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3f51b5;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 20px;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #777;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Cool Ecom 👟</div>
      <p>Your fashion destination</p>
    </div>
    
    <div class="checkmark">
      <span class="checkmark-icon">✓</span>
    </div>
    
    <h1 style="text-align: center; color: #333;">Order Confirmed!</h1>
    <p style="text-align: center;">Thank you for your purchase. Your order has been received and is being processed.</p>
    
    <div class="order-details">
      <h2>Order Summary</h2>
      
      <div class="summary-row">
        <span>Order Date:</span>
        <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      
      <div class="summary-row">
        <span>Total Items:</span>
        <span>${totalItems} items</span>
      </div>
      
      <h3>Products</h3>
      <div class="product-list">
        ${products.map(p => `
          <div class="product-item">
            <span>Product ID: ${p.productname}</span>
            <span>quantity: ${p.productcost} $</span>
          </div>
        `).join('')}
      </div>
      
      <div class="total">
        <div class="summary-row">
          <span>Total Price:</span>
          <span class="price">₹${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="https://example.com/track-order" class="button">Track Your Order</a>
    </div>
    
    <div class="footer">
      <p>If you have any questions, please contact our customer support.</p>
      <p>© 2025 Cool Ecom. All rights reserved.</p>
      
      <div class="social-links">
        <a href="#">Facebook</a> •
        <a href="#">Instagram</a> •
        <a href="#">Twitter</a>
      </div>
    </div>
  </div>
</body>
</html>
            `,
          };

          // Send email
          const info = await transporter.sendMail(mailOptions);
          console.log(`📧 Email sent to ${email}: ${info.messageId}`);

        } catch (error) {
          console.error('❌ Error processing message:', error);
        }
      },
      autoCommit: true,
      autoCommitInterval: 1000,
    });

  } catch (error) {
    console.error('❌ Kafka Consumer Setup Error:', error);
  }
};

module.exports = { run };