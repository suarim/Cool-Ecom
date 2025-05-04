const {Kafka} = require('kafkajs');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
const mongoose = require('mongoose');
const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: ['localhost:9092'],
  });
  const consumer = kafka.consumer({ groupId: 'payment-gdroupw' ,  sessionTimeout: 45000,
    heartbeatInterval: 3000});
const producer = kafka.producer();

const run = async()=>{
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: 'cart-checkout', fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const payload = JSON.parse(message.value.toString());
            const { cart, email } = payload;
            const lineitems = []
            for(const product of cart.products){
                lineitems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.productname,
                        },
                        unit_amount: product.productcost * 100,
                    },
                    quantity: product.quantity,
                })
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineitems,
                mode: 'payment',
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/cancel',
                customer_email: email,
              });
              console.log('✅ Stripe session created:', session.url);
              await redis.set('payment-link', session.url, 'EX', 60 * 60 * 24); // Set the URL in Redis with a TTL of 24 hours
              await producer.send({
                topic: 'payment-link-made',
                messages: [
                  { value: JSON.stringify({ url: session.url }) }
                ],
              })
        }
    })
}

module.exports = { run };