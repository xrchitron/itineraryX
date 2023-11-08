const router = require('express').Router()

const Redis = require('../controllers/redis-controller')

router
  .get('/:key', Redis.getRedis)
  .post('/', Redis.postRedis)

module.exports = router
