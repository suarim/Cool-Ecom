require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectProducer } = require('./kafka/producer');
const { run } = require('./kafka/consumer');
const app = express();
run().then(() => {
    console.log("Kafka Consumer is running123456");
}
).catch((err) => {
    console.log(err);
});
app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Connected to MongoDB");
        connectProducer()
    }).catch((err) => {
        console.log(err);
    })
    console.log(`Server is running on port ${process.env.PORT}`);
});