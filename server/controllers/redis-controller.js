const redisServices = require('../utils/redis')
const redisController = {
  getRedis: async (req, res, next) => {
    try {
      const { key } = req.params
      const value = await redisServices.getRedis(key)
      const valueJson = JSON.parse(value)
      res.status(200).json({ status: 'success', data: valueJson })
    } catch (err) {
      next(err)
    }
  },
  postRedis: async (req, res, next) => {
    try {
      const { key, value } = req.body
      const valueStr = JSON.stringify(value)
      const saveResult = await redisServices.setRedis(key, valueStr, 'EX', 3600)
      res.status(200).json({ status: 'success', data: saveResult })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = redisController
