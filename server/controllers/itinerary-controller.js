const itineraryServices = require('../services/itinerary-services')
const itineraryController = {
  getItinerary: (req, res, next) => { itineraryServices.getItinerary(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  getItineraries: (req, res, next) => { itineraryServices.getItineraries(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  postItinerary: (req, res, next) => { itineraryServices.postItinerary(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  putItinerary: (req, res, next) => { itineraryServices.putItinerary(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  deleteItinerary: (req, res, next) => { itineraryServices.deleteItinerary(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  postParticipant: (req, res, next) => { itineraryServices.postParticipant(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  deleteParticipant: (req, res, next) => { itineraryServices.deleteParticipant(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) }
}
module.exports = itineraryController
