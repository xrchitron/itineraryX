const mapServices = require('../services/map-services')
const routeServices = require('../services/route-services')
const HttpError = require('../utils/httpError')
const redisServices = require('../utils/redis')
const routeController = {
  getRoute: async (req, res, next) => {
    try {
      const { itineraryId, originId, destinationId } = req.query
      if (!itineraryId) throw new HttpError(400, 'Itinerary id is required')
      if (!originId) throw new HttpError(400, 'Origin id is required')
      if (!destinationId) throw new HttpError(400, 'Destination id is required')

      // query redis first, if data exists, return data to reduce database query
      const getRouteFromRedis = await redisServices.getRoute(itineraryId, originId, destinationId)
      if (getRouteFromRedis) return res.status(200).json({ status: 'success', data: JSON.parse(getRouteFromRedis) })

      const route = await routeServices.getRoute(itineraryId, originId, destinationId)
      if (!route) throw new HttpError(404, 'Route not found')
      // rename route data
      const routeData = routeServices.processGetRouteData(route)

      // set route data to redis in order to reduce database query
      redisServices.setRoute(itineraryId, originId, destinationId, routeData)

      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  postRoute: async (req, res, next) => {
    try {
      const { itineraryId, transportationMode, originId, destinationId } = req.body
      if (!itineraryId) throw new HttpError(400, 'Itinerary id is required')
      if (!transportationMode) throw new HttpError(400, 'Transportation mode is required')
      if (!originId) throw new HttpError(400, 'Origin id is required')
      if (!destinationId) throw new HttpError(400, 'Destination id is required')

      // get origin from redis or database
      const getOriginFromRedis = await redisServices.getPlace(originId)
      const origin = await routeServices.getPlaceFromRedisOrDB(getOriginFromRedis, originId)
      if (!origin) throw new HttpError(404, 'Origin not found')

      // get destination data from redis or database
      const getDestinationFromRedis = await redisServices.getPlace(destinationId)
      const destination = await routeServices.getPlaceFromRedisOrDB(getDestinationFromRedis, destinationId)
      if (!destination) throw new HttpError(404, 'Destination not found')

      // get distance matrix data from google map api
      const apiResponse = await mapServices.distanceMatrix(origin, destination, transportationMode)
      if (!apiResponse.status === 'OK' || apiResponse.distance === undefined) throw new HttpError(404, 'No distanceMatrix results found')

      const createdRoute = await routeServices.createRoute(itineraryId, originId, destinationId, transportationMode, apiResponse)
      if (!createdRoute) throw new HttpError(500, 'Create route failed')

      // get related data from database
      const route = await routeServices.getRouteById(createdRoute.toJSON().id)
      if (!route) throw new HttpError(404, 'Route not found')
      // rename route data
      const routeData = routeServices.processGetRouteData(route)
      // set route data to redis in order to reduce database query
      redisServices.setRoute(itineraryId, originId, destinationId, routeData)

      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  patchRoute: async (req, res, next) => {
    try {
      const { routeId, transportationMode } = req.body
      if (!routeId) throw new HttpError(400, 'Route id is required')
      if (!transportationMode) throw new HttpError(400, 'Transportation mode is required')

      const route = await routeServices.getRouteById(routeId)
      if (!route) throw new HttpError(404, 'Route not found')

      // if route transportation mode is the same, return route data to reduce database query
      if (route.transportationMode === transportationMode) {
        const routeData = routeServices.processGetRouteData(route)
        return res.status(200).json({ status: 'success', data: routeData })
      }

      // get origin data from redis or database
      const getOriginFromRedis = await redisServices.getPlace(route.originId)
      const origin = await routeServices.getPlaceFromRedisOrDB(getOriginFromRedis, route.originId)
      if (!origin) throw new HttpError(404, 'Origin not found')

      // get destination data from redis or database
      const getDestinationFromRedis = await redisServices.getPlace(route.destinationId)
      const destination = await routeServices.getPlaceFromRedisOrDB(getDestinationFromRedis, route.destinationId)
      if (!destination) throw new HttpError(404, 'Destination not found')

      // get distance matrix data from google map api
      const apiResponse = await mapServices.distanceMatrix(origin, destination, transportationMode)
      if (!apiResponse.status === 'OK' || apiResponse.distance === undefined) throw new HttpError(404, 'No distanceMatrix results found')

      const updatedRoute = await routeServices.updateRoute(routeId, transportationMode, apiResponse)
      if (!updatedRoute) throw new HttpError(500, 'Update route failed')

      // get related data from database
      const routeWithLatLng = await routeServices.getRoute(updatedRoute.itineraryId, route.originId, route.destinationId)
      if (!routeWithLatLng) throw new HttpError(404, 'Route not found')
      // rename route data
      const routeData = routeServices.processGetRouteData(routeWithLatLng)
      // set route data to redis in order to reduce database query
      redisServices.setRoute(updatedRoute.itineraryId, route.originId, route.destinationId, routeData)

      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  deleteRoute: async (req, res, next) => {
    try {
      const { routeId } = req.params
      if (!routeId) throw new HttpError(400, 'Route id is required')

      const route = await routeServices.getRouteById(routeId)
      if (!route) throw new HttpError(404, 'Route not found')

      const deletedRoute = await routeServices.deleteRoute(route)
      if (!deletedRoute) throw new HttpError(500, 'Delete route failed')

      res.status(200).json({ status: 'success', data: deletedRoute.toJSON() })
    } catch (err) {
      next(err)
    }
  },
  getRoutesLatLng: async (req, res, next) => {
    try {
      const { itineraryId, startDate, endDate } = req.query
      if (!itineraryId) throw new HttpError(400, 'Itinerary id is required')
      if (!startDate) throw new HttpError(400, 'Start date is required')
      if (!endDate) throw new HttpError(400, 'End date is required')

      const placeDetails = await routeServices.getRoutesLatLng(itineraryId, startDate, endDate)
      if (!placeDetails || placeDetails.length === 0) throw new HttpError(404, 'Place details not found')

      res.status(200).json({ status: 'success', data: placeDetails })
    } catch (err) {
      next(err)
    }
  }
  // getRoutes: async (req, res, next) => {
  //   try {
  //     const { itineraryId, startDate, endDate } = req.query
  //     if (!itineraryId || !startDate || !endDate) throw new HttpError(400, 'Missing required parameters')

  //     const routes = await routeServices.getRoutes(itineraryId, startDate, endDate)
  //     if (!routes || routes.length === 0) throw new HttpError(404, 'Routes not found')

  //     res.status(200).json({ status: 'success', data: routes })
  //   } catch (err) {
  //     next(err)
  //   }
  // }
}
module.exports = routeController
