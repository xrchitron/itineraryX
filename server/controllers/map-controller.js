const mapServices = require('../services/map-services')
const key = process.env.API_KEY
const mapController = {
  getMap: async (req, res, next) => { // not used anymore
    try {
      const { address } = req.query
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
      const apiResponse = await mapServices.getMap(url)
      res.status(200).json({ status: 'success', data: apiResponse })
    } catch (err) {
      next(err)
    }
  },
  getDistanceMatrix: async (req, res, next) => {
    try {
      const { origin, destination } = req.body
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${key}`
      if (!origin || !destination) throw new Error('Missing required parameters')

      const newOrigin = await mapServices.createPlace(origin)
      const newDestination = await mapServices.createPlace(destination)
      const apiResponse = await mapServices.getDistanceMatrixWithUrl(url)

      const elements = apiResponse.data.rows[0].elements[0]
      if (!elements.status === 'OK' || elements.distance === undefined) throw new Error('No results found')
      const itineraryId = 1 // temp
      const date = '2023-01-01 12:23:44' // temp
      const createdRoute = await mapServices.createRoute(itineraryId, date, newOrigin.id, newDestination.id, elements)
      const routeData = createdRoute.toJSON()
      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  postRoute: async (req, res, next) => {
    try {
      const { itineraryId, date, sort } = req.body
      if (!itineraryId || !date || !sort) throw new Error('Missing required parameters')
      const orderedRoute = await mapServices.getOrderedRoute(itineraryId, date, sort)
      if (!orderedRoute.length) throw new Error('Route not found')
      res.status(200).json({ status: 'success', data: orderedRoute })
    } catch (err) {
      next(err)
    }
  },
  getPlace: async (req, res, next) => {
    try {
      const { placeId } = req.body
      const place = await mapServices.getPlace(placeId)
      if (!place) throw new Error('Place not found')
      res.status(200).json({ status: 'success', data: place })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = mapController
