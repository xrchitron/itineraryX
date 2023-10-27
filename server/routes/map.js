const router = require('express').Router()
const Map = require('../controllers/map-controller')
const { auth } = require('../middleware/auth')
router
  .route('/')
  .get(auth, Map.getMap) // get map info with token

module.exports = router
