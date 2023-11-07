const redis = require('redis')
const { promisify } = require('util')
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
})
const redisServices = {
  getRedis: promisify(client.get).bind(client),
  setRedis: promisify(client.set).bind(client),
  delRedis: promisify(client.del).bind(client)
}
module.exports = redisServices