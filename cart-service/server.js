require('dotenv').config();
const express = require('express');
const { connectProducer } = require('./Kafka/producer');
const mongoose = require('mongoose');
const cors = require('cors');
const { run } = require('./Kafka/consumer');
const router = require('./routes/cart_route');
const authmiddleware = require('./middleware/auth-middleware');
const app = express();
console.log("--------------------------------------------------------------")
app.use(cors());
app.use(express.json());
run().then(() => console.log('Kafka consumer connected and listening...')).catch(err => console.error('Kafka consumer error:', err));
app.use('/cart',authmiddleware,router);

app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("Connected to MongoDB");
        connectProducer()
        console.log("Connected to Kafka");
    }).catch((err)=>{
        console.log(err);
    })
    console.log(`Server is running on port ${process.env.PORT}`);
    connectProducer()
});