const redis = require('redis')
const { promisify } = require('util')
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  legacyMode: true
})
client.connect()
  .then(() => console.log('Redis client connected'))
  .catch(err => console.error('Error connecting to Redis', err))

const redisServices = {
  getRedis: promisify(client.get).bind(client),
  setRedis: promisify(client.set).bind(client),
  delRedis: promisify(client.del).bind(client)
}
module.exports = redisServices
