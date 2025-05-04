const  {Kafka}  = require('kafkajs');


const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'user-group' });

const run = async(redis)=>{
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-created', fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const key = message.key.toString();
          const value = JSON.parse(message.value.toString());
    
          if (key === 'user.created') {
            const keys = await redis.keys('listusers*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            console.log(`Invalidated cache for ${keys}`);
          }
        },
      });
}


module.exports = { run };