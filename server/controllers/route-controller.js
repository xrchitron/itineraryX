const mapServices = require('../services/map-services')
const routeServices = require('../services/route-services')
const dateMethods = require('../utils/date-methods')
const HttpError = require('../utils/httpError')
const redisServices = require('../utils/redis')
const routeController = {
  getRoute: async (req, res, next) => {
    try {
      const { itineraryId, originId, destinationId } = req.query
      if (!itineraryId || !originId || !destinationId) throw new Error('Missing required parameters')
      // check if route data exists in redis
      const redisData = await redisServices.getRedis(`getRoute-iId${itineraryId}-oId${originId}-dId${destinationId}`)
      if (redisData) {
        const routeData = JSON.parse(redisData)
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        res.status(200).json({ status: 'success', data: routeData })
        return
      }
      const route = await routeServices.getRoute(itineraryId, originId, destinationId)
      if (route) {
        const routeData = route.toJSON()
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        redisServices.setRedis(`getRoute-iId${itineraryId}-oId${originId}-dId${destinationId}`, JSON.stringify(routeData), 'EX', 60 * 60 * 24)
        res.status(200).json({ status: 'success', data: routeData })
        return
      } else {
        throw new Error('Route not found')
      }
    } catch (err) {
      next(err)
    }
  },
  postRoute: async (req, res, next) => {
    try {
      const { itineraryId, date, transportationMode, originId, destinationId } = req.body
      if (!itineraryId || !date || !transportationMode || !originId || !destinationId) throw new Error('Missing required parameters')

      // get origin and destination place data
      let origin
      let destination
      const setPlaceRedis = async (placeId, placeData) => {
        redisServices.setRedis(`getPlace-pId${placeId}`, JSON.stringify(placeData), 'EX', 60 * 60 * 24)
      }
      const getOriginFromRedis = await redisServices.getRedis(`getPlace-pId${originId}`)
      const getDestinationFromRedis = await redisServices.getRedis(`getPlace-pId${destinationId}`)
      if (getOriginFromRedis) {
        origin = JSON.parse(getOriginFromRedis)
      } else {
        origin = await mapServices.getPlace(originId)
        await setPlaceRedis(originId, origin)
      }
      if (getDestinationFromRedis) {
        destination = JSON.parse(getDestinationFromRedis)
      } else {
        destination = await mapServices.getPlace(destinationId)
        await setPlaceRedis(destinationId, destination)
      }

      // check if origin and destination place data exists
      if (!origin) throw new Error('Origin not found')
      if (!destination) throw new Error('Destination not found')
      // check if route data exists in redis
      const redisData = await redisServices.getRedis(`getRoute-iId${itineraryId}-oId${originId}-dId${destinationId}`)
      const setRouteRedisAndRespond = async routeData => {
        redisServices.setRedis(`getRoute-iId${itineraryId}-oId${originId}-dId${destinationId}`, JSON.stringify(routeData), 'EX', 60 * 60 * 24)
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        res.status(200).json({ status: 'success', data: routeData })
      }
      if (redisData) {
        const routeData = JSON.parse(redisData)
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        res.status(200).json({ status: 'success', data: routeData })
        return
      }
      // check data exist in database
      const route = await routeServices.getRoute(itineraryId, originId, destinationId)
      if (route && route.transportationMode === transportationMode) {
        const routeData = route.toJSON()
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        await setRouteRedisAndRespond(routeData)
        return
      } else if (route && route.transportationMode !== transportationMode) {
        // if route data exists but transportation mode is different, update transportation mode
        const updatedRoute = await routeServices.updateRoute(route.id, transportationMode)
        const routeData = updatedRoute.toJSON()
        await setRouteRedisAndRespond(routeData)
        return
      }

      // turn origin and destination place data into JSON
      const originData = origin.toJSON()
      const destinationData = destination.toJSON()

      const apiResponse = await mapServices.distanceMatrix(originData, destinationData, transportationMode)

      // check if routes are found
      if (!apiResponse.status === 'OK' || apiResponse.distance === undefined) throw new Error('No results found')

      // create route
      const createdRoute = await routeServices.createRoute(itineraryId, date, originData.id, destinationData.id, transportationMode, apiResponse)
      const routeData = createdRoute.toJSON()
      // convert date format
      routeData.date = dateMethods.toISOString(routeData.date)

      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  patchRoute: async (req, res, next) => {
    try {
      const { routeId, transportationMode } = req.body
      if (!routeId || !transportationMode) throw new Error('Missing required parameters')
      const route = await routeServices.getRouteById(routeId)
      if (!route) throw new Error('Route not found')
      const origin = await mapServices.getPlace(route.originId)
      const destination = await mapServices.getPlace(route.destinationId)
      if (!origin) throw new Error('Origin not found')
      if (!destination) throw new Error('Destination not found')
      const originData = origin.toJSON()
      const destinationData = destination.toJSON()
      const apiResponse = await mapServices.distanceMatrix(originData, destinationData, transportationMode)
      if (!apiResponse.status === 'OK' || apiResponse.distance === undefined) throw new Error('No results found')
      const updatedRoute = await routeServices.updateRoute(routeId, transportationMode, apiResponse)
      const routeData = updatedRoute.toJSON()
      // convert date format
      routeData.date = dateMethods.toISOString(routeData.date)
      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  getRoutesLatLng: async (req, res, next) => {
    try {
      const { itineraryId, startDate, endDate } = req.query
      if (!itineraryId || !startDate || !endDate) throw new HttpError(400, 'Missing required parameters')

      const placeDetails = await routeServices.getRoutesLatLng(itineraryId, startDate, endDate)
      if (!placeDetails || placeDetails.length === 0) throw new HttpError(404, 'Place details not found')

      res.status(200).json({ status: 'success', data: placeDetails })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = routeController
