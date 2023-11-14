const mapServices = require('../services/map-services')
const dateMethods = require('../utils/date-methods')
const key = process.env.API_KEY
const mapController = {
  // getMap: async (req, res, next) => { // not used anymore
  //   try {
  //     const { address } = req.query
  //     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
  //     const apiResponse = await mapServices.getMap(url)
  //     res.status(200).json({ status: 'success', data: apiResponse })
  //   } catch (err) {
  //     next(err)
  //   }
  // },
  getPlace: async (req, res, next) => {
    try {
      const { placeId } = req.params
      const place = await mapServices.getPlace(placeId)
      if (!place) throw new Error('Place not found')
      res.status(200).json({ status: 'success', data: place })
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
      console.log(placeDetail.image)
      const placeData = await mapServices.createPlace(placeDetail)
      if (!placeData) throw new Error("Place didn't create successfully")
      res.status(200).json({ status: 'success', data: placeData })
    } catch (err) {
      next(err)
    }
  },
  deletePlace: async (req, res, next) => {
    try {
      const { placeId } = req.params
      // check if placeId exists
      const place = await mapServices.getPlace(placeId)
      if (!place) throw new Error('Place not found')
      // delete place
      console.log(place)
      const deletedPlace = await place.destroy()
      res.status(200).json({ status: 'success', data: deletedPlace })
    } catch (err) {
      next(err)
    }
  },
  getDistanceMatrix: async (req, res, next) => {
    try {
      const { itineraryId, date, transportationMode, originPlaceId, destinationPlaceId } = req.body
      if (!itineraryId || !date || !transportationMode || !originPlaceId || !destinationPlaceId) throw new Error('Missing required parameters')
      // get origin and destination place data
      const origin = await mapServices.getPlace(originPlaceId)
      const destination = await mapServices.getPlace(destinationPlaceId)

      // check if origin and destination place data exists
      if (!origin) throw new Error('Origin not found')
      if (!destination) throw new Error('Destination not found')

      // turn origin and destination place data into JSON
      const originData = origin.toJSON()
      const destinationData = destination.toJSON()

      // check mode type
      const modeType = mapServices.checkModeType(transportationMode)

      // place data into url
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?language=zh-TW&origins=${originData.lat},${originData.lng}&destinations=${destinationData.lat},${destinationData.lng}&${modeType}&key=${key}`

      // get distance matrix
      const apiResponse = await mapServices.getDistanceMatrixWithUrl(url)

      // absorb elements from response
      const elements = apiResponse.data.rows[0].elements[0]

      // check if routes are found
      if (!elements.status === 'OK' || elements.distance === undefined) throw new Error('No results found')

      // create route
      const createdRoute = await mapServices.createRoute(itineraryId, date, originData.id, destinationData.id, transportationMode, elements)
      const routeData = createdRoute.toJSON()
      // convert date format
      routeData.date = dateMethods.toISOString(routeData.date)

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
  }
}
module.exports = mapController
