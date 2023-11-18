const destinationServices = require('../services/destination-services')
const itineraryServices = require('../services/itinerary-services')
const mapServices = require('../services/map-services')
const dateMethods = require('../utils/date-methods')
const destinationController = {
  postDestination: async (req, res, next) => {
    try {
      const { itineraryId, date, placeId } = req.body
      if (!itineraryId || !date || !placeId) throw new Error('Missing itineraryId, date, or placeId')

      // check if placeId exists
      const place = await mapServices.getPlace(placeId)
      if (!place) throw new Error('Place not found')
      // check if itineraryId exists
      const itinerary = await itineraryServices.getItineraryByPk(itineraryId)
      if (!itinerary) throw new Error('Itinerary not found')

      // create destination
      const destination = await destinationServices.createDestination(itineraryId, date, placeId)
      if (!destination) throw new Error("Destination didn't create successfully")

      // get destination data
      let destinationData = await destinationServices.getDestination(destination.id)
      destinationData = destinationData.toJSON()
      destinationData.date = dateMethods.toISOString(destinationData.date)
      res.status(200).json({ status: 'success', data: destinationData })
    } catch (err) {
      next(err)
    }
  },
  getDestinations: async (req, res, next) => {
    try {
      const { itineraryId, date } = req.query
      let { order } = req.query
      if (!itineraryId) throw new Error('Missing itineraryId')

      // check if date exists
      if (!date) throw new Error('Missing date')

      // check if order exists
      if (!order) order = 'asc'

      // check if itineraryId exists
      const itinerary = await itineraryServices.getItineraryByPk(itineraryId)
      if (!itinerary) throw new Error('Itinerary not found')

      // get destinations
      const destinations = await destinationServices.getDestinations(itineraryId, date, order)
      if (!destinations || destinations.length === 0) throw new Error('Destinations not found')

      // get destinations data
      const destinationsData = destinations.map(destination => {
        const destinationData = destination.toJSON()
        destinationData.date = dateMethods.toISOString(destinationData.date)
        return destinationData
      })
      res.status(200).json({ status: 'success', data: destinationsData })
    } catch (err) {
      next(err)
    }
  },
  patchDestination: async (req, res, next) => {
    try {
      const { destinationId, date } = req.body
      if (!destinationId) throw new Error('Missing destinationId')
      if (!date) throw new Error('Missing date')
      // check if destination exists
      const destination = await destinationServices.getDestination(destinationId)
      if (!destination) throw new Error('Destination not found')
      // update destination
      const updatedDestination = await destination.update({ date })
      if (!updatedDestination) throw new Error("Destination didn't update successfully")

      // get destination data
      let destinationData = await destinationServices.getDestination(destinationId)
      destinationData = destinationData.toJSON()
      destinationData.date = dateMethods.toISOString(destinationData.date)
      res.status(200).json({ status: 'success', data: destinationData })
    } catch (err) {
      next(err)
    }
  },
  deleteDestination: async (req, res, next) => {
    try {
      const { destinationId } = req.body
      if (!destinationId) throw new Error('destinationId is required')

      // check if destination exists
      const destination = await destinationServices.getDestination(destinationId)
      if (!destination) throw new Error('Destination not found')

      // delete destination
      const deletedDestination = await destination.destroy()
      if (!deletedDestination) throw new Error("Destination didn't delete successfully")

      res.status(200).json({ status: 'success', data: deletedDestination })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = destinationController
