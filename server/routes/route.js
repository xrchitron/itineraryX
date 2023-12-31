const router = require('express').Router()
const Route = require('../controllers/route-controller')
const { auth } = require('../middleware/auth')

router
  .route('/')
  .get(Route.getRoute)
  .post(auth, Route.postRoute)
  .patch(auth, Route.patchRoute)

router
  .route('/:routeId')
  .delete(auth, Route.deleteRoute)

router
  .route('/latLng')
  .get(auth, Route.getRoutesLatLng)

// router
//   .route('/all')
//   .get(auth, Route.getRoutes)

module.exports = router
