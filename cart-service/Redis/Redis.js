const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URI)
const invalidateCache = async (key) => {
    try {
        await redis.del(key);
        console.log(`Cache invalidated for key: ${key}`);
    } catch (error) {
        console.error('Error invalidating cache:', error);
        
    }
}
module.exports = {redis,invalidateCache}