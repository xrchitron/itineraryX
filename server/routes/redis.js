const router = require('express').Router()

const Redis = require('../controllers/redis-controller')

router
  .get('/', Redis.getRedis)
  .post('/', Redis.postRedis)

module.exports = router
