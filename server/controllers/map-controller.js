const mapServices = require('../services/map-services')
const dateMethods = require('../utils/date-methods')
const redisServices = require('../utils/redis')
const key = process.env.API_KEY
const mapController = {
  getPlaceIdByGoogleMapApi: async (req, res, next) => { // not used anymore
    try {
      const { address } = req.query
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
      const apiResponse = await mapServices.getPlaceIdByGoogleMapApi(url)
      const data = { placeId: apiResponse }
      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  },
  postPlace: async (req, res, next) => {
    try {
      const { placeId } = req.body
      if (!placeId) throw new Error('placeId from Google Map is required')

      const placeDetail = await mapServices.getPlaceDetail(placeId)
      if (!placeDetail) throw new Error('Place not found')
      // get photo
      const photoReference = placeDetail.photos[1].photo_reference
      const photo = await mapServices.getPhotoByReference(photoReference)
      placeDetail.image = photo
      const placeData = await mapServices.createPlace(placeDetail)
      if (!placeData) throw new Error("Place didn't create successfully")
      res.status(200).json({ status: 'success', data: placeData })
    } catch (err) {
      next(err)
    }
  },
  postRoute: async (req, res, next) => {
    try {
      const { itineraryId, date, transportationMode, originId, destinationId } = req.body
      if (!itineraryId || !date || !transportationMode || !originId || !destinationId) throw new Error('Missing required parameters')
      // get origin and destination place data
      const origin = await mapServices.getPlace(originId)
      const destination = await mapServices.getPlace(destinationId)

      // check if origin and destination place data exists
      if (!origin) throw new Error('Origin not found')
      if (!destination) throw new Error('Destination not found')
      // check if route data exists in redis
      const redisData = await redisServices.getRedis(`getRoute-iId${itineraryId}-oId${originId}-dId${destinationId}`)
      if (redisData) {
        const routeData = JSON.parse(redisData)
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        res.status(200).json({ status: 'success', data: routeData })
        return
      }
      // check data exist in database
      const route = await mapServices.getRoute(itineraryId, originId, destinationId)
      if (route && route.transportationMode === transportationMode) {
        const routeData = route.toJSON()
        // convert date format
        // routeData.date = dateMethods.toISOString(routeData.date)
        redisServices.setRedis(`getRoute-iId${itineraryId}-oId${originId}-dId${destinationId}`, JSON.stringify(routeData), 'EX', 60 * 60 * 24)
        res.status(200).json({ status: 'success', data: routeData })
        return
      } else if (route && route.transportationMode !== transportationMode) {
        await route.destroy()
      }

      // turn origin and destination place data into JSON
      const originData = origin.toJSON()
      const destinationData = destination.toJSON()

      const apiResponse = await mapServices.distanceMatrix(originData, destinationData, transportationMode)

      // check if routes are found
      if (!apiResponse.status === 'OK' || apiResponse.distance === undefined) throw new Error('No results found')

      // create route
      const createdRoute = await mapServices.createRoute(itineraryId, date, originData.id, destinationData.id, transportationMode, apiResponse)
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
      const route = await mapServices.getRouteById(routeId)
      if (!route) throw new Error('Route not found')
      const origin = await mapServices.getPlace(route.originId)
      const destination = await mapServices.getPlace(route.destinationId)
      if (!origin) throw new Error('Origin not found')
      if (!destination) throw new Error('Destination not found')
      const originData = origin.toJSON()
      const destinationData = destination.toJSON()
      const apiResponse = await mapServices.distanceMatrix(originData, destinationData, transportationMode)
      if (!apiResponse.status === 'OK' || apiResponse.distance === undefined) throw new Error('No results found')
      const updatedRoute = await route.update({ transportationMode, elements: apiResponse })
      const routeData = updatedRoute.toJSON()
      // convert date format
      routeData.date = dateMethods.toISOString(routeData.date)
      res.status(200).json({ status: 'success', data: routeData })
    } catch (err) {
      next(err)
    }
  },
  getRandomPlace: async (req, res, next) => {
    try {
      const data = await mapServices.getRandomPlace()

      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  },
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
      const route = await mapServices.getRoute(itineraryId, originId, destinationId)
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
  }

}
module.exports = mapController
