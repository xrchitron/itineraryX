const destinationServices = require('../services/destination-services')
const itineraryServices = require('../services/itinerary-services')
const mapServices = require('../services/map-services')
const HttpError = require('../utils/httpError')
const destinationController = {
  postDestination: async (req, res, next) => {
    try {
      const { itineraryId, date, placeId } = req.body
      if (!itineraryId) throw new HttpError(400, 'ItineraryId is required')
      if (!date) throw new HttpError(400, 'Date is required')
      if (!placeId) throw new HttpError(400, 'PlaceId is required')

      const place = await mapServices.getPlace(placeId)
      if (!place) throw new HttpError(404, 'Place not found')

      const itinerary = await itineraryServices.getItineraryByPk(itineraryId)
      if (!itinerary) throw new HttpError(404, 'Itinerary not found')

      const destination = await destinationServices.createDestination(itineraryId, date, placeId)
      if (!destination) throw new HttpError(500, 'Failed to create destination')

      // get destination data after create
      let destinationData = await destinationServices.getDestination(destination.id)
      if (!destinationData) throw new HttpError(500, 'Failed to get destination')

      destinationData = destinationServices.processDestinationTimeFormat(destinationData)
      res.status(200).json({ status: 'success', data: destinationData })
    } catch (err) {
      next(err)
    }
  },
  getDestinations: async (req, res, next) => {
    try {
      const { itineraryId, date } = req.query
      let { order } = req.query
      if (!itineraryId) throw new HttpError(400, 'Itinerary id is required')
      if (!date) throw new HttpError(400, 'Date is required')
      if (!order) order = 'asc' // default order is ascending

      const itinerary = await itineraryServices.getItineraryByPk(itineraryId)
      if (!itinerary) throw new HttpError(404, 'Itinerary not found')

      const destinations = await destinationServices.getDestinations(itineraryId, date, order)
      if (!destinations || destinations.length === 0) throw new HttpError(404, 'Destinations not found')

      const destinationsData = destinationServices.processDestinationsTimeFormat(destinations)

      res.status(200).json({ status: 'success', data: destinationsData })
    } catch (err) {
      next(err)
    }
  },
  patchDestination: async (req, res, next) => {
    try {
      const { destinationId, date } = req.body
      if (!destinationId) throw new HttpError(400, 'DestinationId is required')
      if (!date) throw new HttpError(400, 'Date is required')

      const destination = await destinationServices.getDestination(destinationId)
      if (!destination) throw new HttpError(404, 'Destination not found')

      const updatedDestination = await destination.update({ date })
      if (!updatedDestination) throw new HttpError(500, 'Failed to update destination')

      // get destination data after update
      let destinationData = await destinationServices.getDestination(destinationId)
      if (!destinationData) throw new HttpError(500, 'Failed to get destination')

      destinationData = destinationServices.processDestinationTimeFormat(destinationData)

      res.status(200).json({ status: 'success', data: destinationData })
    } catch (err) {
      next(err)
    }
  },
  deleteDestination: async (req, res, next) => {
    try {
      const { destinationId } = req.params
      if (!destinationId) throw new HttpError(400, 'DestinationId is required')

      const destination = await destinationServices.getDestination(destinationId)
      if (!destination) throw new HttpError(404, 'Destination not found')

      const deletedDestination = await destination.destroy()
      if (!deletedDestination) throw new HttpError(500, 'Failed to delete destination')

      res.status(200).json({ status: 'success', data: deletedDestination })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = destinationController
