const {Kafka} = require('kafkajs');
const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['localhost:9092'],
  });
  const producer = kafka.producer();
  const connectProducer = async () => {
    await producer.connect();
  };
  const sendMessage = async (cart,email)=>{
    console.log("Sending message to Kafka");
    console.log(cart);
    console.log("---->",email);
    await producer.send({
        topic: 'cart-checkout',
        messages: [
            { value: JSON.stringify({cart,email}) }
        ],
    });
  }

module.exports = {connectProducer,sendMessage}