const redis = require('ioredis')
const Redis = new redis(process.env.REDIS_URI)
const InvalidateCache = async (key) => {
    try {
        const keys = await Redis.keys('products*')
        await Redis.del(...keys)
        console.log(`Cache for ${key} has been invalidated`)
    } catch (error) {
        console.log(error)
        
    }
}
module.exports = {Redis, InvalidateCache}