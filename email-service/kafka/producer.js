const {Kafka} = require('kafkajs');
const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['localhost:9092'],
  });
  const producer = kafka.producer();
  const connectProducer = async () => {
    await producer.connect();
  };
 

module.exports = {connectProducer}