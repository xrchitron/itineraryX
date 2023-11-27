const mapServices = require('../services/map-services')
const HttpError = require('../utils/httpError')
const mapController = {
  getPlaceIdByGoogleMapApi: async (req, res, next) => {
    // only for testing
    try {
      const { address } = req.query
      if (!address) throw new HttpError(400, 'Address is required')

      const placeId = await mapServices.getPlaceIdByGoogleMapApi(address)
      if (!placeId) throw new HttpError(404, 'Place not found')

      res.status(200).json({ status: 'success', data: placeId })
    } catch (err) {
      next(err)
    }
  },
  postPlace: async (req, res, next) => {
    try {
      const { placeId } = req.body
      if (!placeId) throw new HttpError(400, 'placeId from Google Map API is required')

      let placeDetail = await mapServices.getPlaceDetail(placeId)
      if (!placeDetail) throw new HttpError(404, 'Place not found')

      placeDetail = await mapServices.getPhotoByReference(placeDetail)

      const placeData = await mapServices.createPlace(placeDetail)
      if (!placeData) throw new HttpError(500, "Place didn't create successfully")

      res.status(200).json({ status: 'success', data: placeData })
    } catch (err) {
      next(err)
    }
  },
  getRandomPlace: async (req, res, next) => {
    try {
      const data = await mapServices.getRandomPlace()
      if (!data) throw new HttpError(500, 'Failed to get random place')

      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = mapController
