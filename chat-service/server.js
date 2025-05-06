require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/chat-route');
const http = require('http');
const socketio = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const redis = new Redis(process.env.REDIS_URL);
require('./socket/socket-handler')(io);

// Middleware
app.use(cors());
app.use(express.json());

// Redis injection for chat routes
app.use('/api/chat', (req, res, next) => {
    req.redis = redis;
    next();
});
app.use('/api/chat', router);

// Connect to MongoDB first, then start the server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(Number(process.env.PORT) || 5001, () => {
            console.log('Server is running on port', process.env.PORT || 5001);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });
