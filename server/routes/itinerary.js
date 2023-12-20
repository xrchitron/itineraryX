const router = require('express').Router()
const Itinerary = require('../controllers/itinerary-controller')
const { auth } = require('../middleware/auth')
const upload = require('../middleware/multer')
router
  .route('/:itineraryId')
  .get(Itinerary.getItinerary) // get Itinerary info by itinerary id

router
  .route('/')
  .get(auth, Itinerary.getItineraries) // get Itinerary info by token
  .post(auth, Itinerary.postItinerary) // create new Itinerary
  .put(auth, upload.single('image'), Itinerary.putItinerary) // update Itinerary info
  .delete(auth, Itinerary.deleteItinerary) // delete Itinerary info

router
  .route('/participant')
  .post(auth, Itinerary.postParticipant) // add participant to itinerary
  .delete(auth, Itinerary.deleteParticipant) // delete participant from itinerary
module.exports = router
