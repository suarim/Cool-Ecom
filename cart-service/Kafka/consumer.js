const  {Kafka}  = require('kafkajs');
const mongoose = require('mongoose');
const {Cart} = require('../models/Cart');

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'user-group1' });

const run = async()=>{
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-created', fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const key = message.key.toString();
          console.log(key);
          const value = JSON.parse(message.value.toString());
    
          if (key === 'user.created') {
            const cart = new Cart({
                userId: value.id
            })
            await cart.save();
            console.log('Cart created for user:', value.id);
          }
        },
      });
}
const consumer1 = kafka.consumer({ groupId: 'paymentlinkmad1s1e' });

const stripelink = async(redis)=>{
  await consumer1.connect();
  await consumer1.subscribe({ topic: 'payment-link-made', fromBeginning: false });
  await consumer1.run({
      eachMessage: async()=>{
        const payload = JSON.parse(message.value.toString());
        const { url } = payload;
        console.log('✅ Stripe session created:', url);
        await redis.set('payment-link', url, 'EX', 60 * 60 * 24); // Set the URL in Redis with a TTL of 24 hours
      }
  })

}

module.exports = { run ,stripelink};