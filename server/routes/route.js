const router = require('express').Router()
const Route = require('../controllers/route-controller')
const { auth } = require('../middleware/auth')

router
  .route('/')
  .get(auth, Route.getRoute)
  .post(auth, Route.postRoute)
  .patch(auth, Route.patchRoute)

router
  .route('/latLng')
  .get(auth, Route.getRoutesLatLng)

router
  .route('/all')
  .get(auth, Route.getRoutes)

module.exports = router
