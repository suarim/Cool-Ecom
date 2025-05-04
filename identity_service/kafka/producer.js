const {Kafka} = require('kafkajs');
const {logger} = require('../utils/logger');
const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['localhost:9092'],
  });
  const producer = kafka.producer();
  const connectProducer = async () => {
    await producer.connect();
  };
const emitUsercreateEvent = async (id)=>{
    await producer.send({
        topic: 'user-created',
        messages: [
            { key:"user.created",value: JSON.stringify({message:'User Created',id}) },
        ],
    })
}
module.exports = {connectProducer,emitUsercreateEvent}