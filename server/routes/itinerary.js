const router = require('express').Router()
const Itinerary = require('../controllers/itinerary-controller')
const { auth } = require('../middleware/auth')
router
  .route('/:itid')
  .get(auth, Itinerary.getItinerary) // get Itinerary info by itinerary id and holder id

router
  .route('/')
  .get(auth, Itinerary.getItineraries) // get Itinerary info by token
  .post(auth, Itinerary.postItinerary) // create new Itinerary
  .put(auth, Itinerary.putItinerary) // update Itinerary info
  .delete(auth, Itinerary.deleteItinerary) // delete Itinerary info

module.exports = router
