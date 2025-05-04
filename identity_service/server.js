require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redisclient = require('ioredis')
const {logger} = require('./utils/logger');
const { default: mongoose } = require('mongoose');
const router = require('./routes/identity_route');
const userrouter = require('./routes/user_route');
const {connectProducer} = require('./kafka/producer')
const {run} = require('./kafka/consumer')
const app= express();
app.use(cors());
app.use(express.json());
const redis = new redisclient(process.env.REDIS_URI)
logger.info('Connected to Redis')
run(redis)
  .then(() => console.log('Kafka consumer connected and listening...'))
  .catch(err => console.error('Kafka consumer error:', err));

app.use((req,res,next)=>{
    logger.info(`${req.method} ${req.url}`);
    next();
})

app.get('/',(req,res)=>{
    return res.send('Welcome to Identity Service')
}
)
app.use('/api/auth',router)

app.use('/api/user/',(req,res,next)=>{
    req.redis = redis;
    next()
},userrouter)

app.listen(process.env.PORT,()=>{
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        logger.info('Connected to MongoDB')
    }).catch((err)=>{
        console.log(err);
    })

    connectProducer(); 
    logger.info('Connected to Kafka');

    logger.info(`Server is running on port ${process.env.PORT}`);
})