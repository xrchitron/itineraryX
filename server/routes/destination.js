const router = require('express').Router()
const Destination = require('../controllers/destination-controller')
const { auth } = require('../middleware/auth')
router
  .route('/')
  .get(auth, Destination.getDestinations) // get destinations
  .post(auth, Destination.postDestination) // add destination
  .patch(auth, Destination.patchDestination) // update destination
  .delete(auth, Destination.deleteDestination) // delete destination

module.exports = router
