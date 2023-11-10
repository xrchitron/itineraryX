const router = require('express').Router()
const Map = require('../controllers/map-controller')
const { auth } = require('../middleware/auth')
router
  .route('/')
  .post(auth, Map.postPlace) // get place info
  // .get(auth, Map.getMap) // get map info with token

router
  .route('/routes')
  .post(auth, Map.postRoute) // get route info without token
  // .get(auth, Map.getRoute) // get route info with token

router
  .route('/distanceMatrix')
  .post(Map.getDistanceMatrix)

router
  .route('/:placeId')
  .get(auth, Map.getPlace)
  .delete(auth, Map.deletePlace) // delete place info
module.exports = router
