const redisServices = require('../utils/redis')
const redisController = {
  getRedis: async (req, res, next) => {
    try {
      const { key } = req.params
      const data = await redisServices.getRedis(key)
      // JSON.parse(data)
      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  },
  postRedis: async (req, res, next) => {
    try {
      const { key, value } = req.body
      console.log(key, value)
      // const saveResult = await redisServices.setRedis(key, value, 'EX', 3600)
      // JSON.stringify(value)
      res.status(200).json({ status: 'success', data: { key, value } })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = redisController
