require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const { run } = require('./kafkajs/consumer');
const { connectProducer } = require('./kafkajs/producer');
// const cors = require('cors');
const app = express();
app.use(express.json());
run().then(()=>{console.log('✅ Kafka consumer started')}).catch((err)=>{console.log(err)}).catch((err)=>{console.log(err)});   
app.listen(process.env.PORT,()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{console.log('✅ MongoDB connected')
        connectProducer()
    })
    .catch((err)=>{console.log(err)});
    console.log('✅ Payment service started on port 6004');
})