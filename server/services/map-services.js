const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Place } = require('../models')
const axios = require('axios')
const HttpError = require('../utils/httpError')
const key = process.env.API_KEY
const mapServices = {
  async getPlaceIdByGoogleMapApi (address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
    const apiResponse = await axios.get(url)
    if (apiResponse.data.status !== 'OK') throw new HttpError(400, 'Invalid request')
    if (apiResponse.data.results.length === 0) throw new HttpError(404, 'No result found')
    // return apiResponse.data.results[0].place_id
    const placeId = apiResponse.data.results[0].place_id
    const data = { placeId }
    return data
  },
  async getPlaceDetail (placeId) {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json?'
    const fields = ['name', 'place_id', 'formatted_address', 'geometry', 'rating', 'photos', 'url', 'editorial_summary']
    const linkedFields = fields.join('%2C')
    const placeDetail = await axios.get(url + `place_id=${placeId}&fields=${linkedFields}&key=${key}`)
    if (placeDetail.data.status !== 'OK') throw new Error('Invalid request')
    return placeDetail.data.result
  },
  async getPhotoByReference (placeDetail) {
    const photoReference = placeDetail.photos[1].photo_reference
    const url = 'https://maps.googleapis.com/maps/api/place/photo?'
    const photo = await axios.get(url + `maxwidth=400&photoreference=${photoReference}&key=${key}`)
    if (photo.status !== 200) throw new HttpError(400, 'Invalid request')
    const photoUrl = photo.request.res.responseUrl
    placeDetail.image = photoUrl
    return placeDetail
  },
  async getPlace (placeId) {
    const place = await Place.findByPk(placeId)
    return place
  },
  async getPlaceByPlaceId (placeId) {
    const place = await Place.findOne({ where: { placeId } })
    return place
  },
  async createPlace (place) {
    const foundPlace = await Place.findOne({ where: { placeId: place.place_id } })
    if (foundPlace) return foundPlace
    const newPlace = await Place.create({
      name: place.name,
      placeId: place.place_id,
      address: place.formatted_address,
      rating: place.rating,
      url: place.url,
      image: place.image,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      intro: (place.editorial_summary ? place.editorial_summary.overview : null)
    })
    return newPlace
  },
  checkModeType (transportationMode) {
    let modeType = ''
    // mode: driving, walking, bicycling, transit
    const mode = ['driving', 'walking', 'bicycling', 'transit']
    if (mode.includes(transportationMode)) modeType = `mode=${transportationMode}`

    // transit_mode: bus, subway, train, tram, rail
    const transitMode = ['bus', 'subway', 'train', 'tram', 'rail']
    if (transitMode.includes(transportationMode)) modeType = `transit_mode=${transportationMode}`
    return modeType
  },
  async getRandomPlace () {
    const randomPlace = await Place.findOne({
      where: {
        id: {
          [Op.gte]: 1, // Greater than or equal to 1
          [Op.lte]: 10 // Less than or equal to 10
        }
      },
      order: Sequelize.literal('rand()'),
      limit: 1
    })
    if (!randomPlace) throw new Error('No place found, please try again')
    return randomPlace
  },
  async distanceMatrix (origin, destination, mode) {
    // check mode type
    const modeType = this.checkModeType(mode)
    // distance matrix url
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&${modeType}&key=${key}`
    // get distance matrix
    const apiResponse = await axios.get(url)
    // absorb elements from response
    const elements = apiResponse.data.rows[0].elements[0]
    return elements
  }
}
module.exports = mapServices
