const router = require('express').Router()
const Map = require('../controllers/map-controller')
const { auth } = require('../middleware/auth')
router
  .route('/')
  .get(auth, Map.getPlaceIdByGoogleMapApi) // get map info with token
  .post(auth, Map.postPlace) // get place info

router
  .route('/random')
  .get(auth, Map.getRandomPlace) // get route info with token

module.exports = router
