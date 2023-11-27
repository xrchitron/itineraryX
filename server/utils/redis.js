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

const expireTime = 60 * 60 * 24

const redisServices = {
  getRedis: promisify(client.get).bind(client),
  setRedis: promisify(client.set).bind(client),
  delRedis: promisify(client.del).bind(client),
  getRoute: async function (itineraryId, originId, destinationId) {
    return await this.getRedis(`Route-iId${itineraryId}-oId${originId}-dId${destinationId}`)
  },
  setRoute: async function (itineraryId, originId, destinationId, routeData) {
    await this.setRedis(`Route-iId${itineraryId}-oId${originId}-dId${destinationId}`, JSON.stringify(routeData), 'EX', expireTime)
  },
  getPlace: async function (placeId) {
    return await this.getRedis(`Place-pId${placeId}`)
  },
  setPlace: async function (placeId, placeData) {
    await this.setRedis(`Place-pId${placeId}`, JSON.stringify(placeData), 'EX', expireTime)
  }

}
module.exports = redisServices
