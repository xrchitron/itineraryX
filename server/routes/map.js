const router = require('express').Router()
const Map = require('../controllers/map-controller')
const { auth } = require('../middleware/auth')
router
  .route('/')
  .get(auth, Map.getPlaceIdByGoogleMapApi) // get map info with token
  .post(auth, Map.postPlace) // get place info

router
  .route('/routes')
  .get(auth, Map.getRoute) // get route info with token
  .post(auth, Map.postRoute) // get route info with token
  .patch(auth, Map.patchRoute) // get route info with token

router
  .route('/random')
  .get(auth, Map.getRandomPlace) // get route info with token

router
  .route('/routes/show')
  .get(auth, Map.getShowRoutes) // get place info with token

module.exports = router
