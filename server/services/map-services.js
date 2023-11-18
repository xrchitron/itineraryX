const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Place, Route } = require('../models')
const axios = require('axios')
const key = process.env.API_KEY
const mapServices = {
  // async getMap (url) {
  //   const apiResponse = await axios.get(url)
  //   return apiResponse.data.results[0]
  //   // const fullAddress = response.formatted_address
  //   // const placeId = response.place_id
  //   // const { lat, lng } = response.geometry.location
  //   // const geocodeResponse = { fullAddress, placeId, lat, lng }
  // },
  async getDistanceMatrixWithUrl (url) {
    const apiResponse = await axios.get(url)
    return apiResponse
  },
  async getPlaceDetail (placeId) {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json?'
    const fields = ['name', 'place_id', 'formatted_address', 'geometry', 'rating', 'photos', 'url', 'editorial_summary']
    const linkedFields = fields.join('%2C')
    const placeDetail = await axios.get(url + `place_id=${placeId}&fields=${linkedFields}&key=${key}`)
    console.log(placeDetail.data.result)
    if (placeDetail.data.status !== 'OK') throw new Error('Invalid request')
    return placeDetail.data.result
  },
  async getPhotoByReference (photoReference) {
    const url = 'https://maps.googleapis.com/maps/api/place/photo?'
    const photo = await axios.get(url + `maxwidth=400&photoreference=${photoReference}&key=${key}`)
    return photo.request.res.responseUrl
  },
  async getPlace (placeId) {
    const place = await Place.findByPk(placeId)
    return place
  },
  async getPlaceByPlaceId (placeId) {
    const place = await Place.findOne({ where: { placeId } })
    return place
  },
  async getOrderedRoute (itineraryId, date, sort) {
    const sortOrder = sort.order === 'asc' ? 'ASC' : 'DESC'
    const sortKey = sort.key === 'distance' ? 'distanceValue' : 'durationValue'
    const route = await Route.findAll({
      where: {
        itineraryId,
        date: {
          [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`]
        }
      },
      attributes: ['id', 'date', 'distanceText', 'distanceValue', 'durationText', 'durationValue', 'color'],
      include: [
        { model: Place, as: 'Origin', attributes: ['name', 'address', 'url', 'lat', 'lng'] },
        { model: Place, as: 'Destination', attributes: ['name', 'address', 'url', 'lat', 'lng'] }
      ],
      order: [[sortKey, sortOrder]]
    })
    return route
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
      intro: place.editorial_summary.overview
    })
    return newPlace
  },
  async createRoute (itineraryId, date, originId, destinationId, transportationMode, elements) {
    const foundRoute = await Route.findOne({ where: { originId, destinationId, transportationMode } })
    if (foundRoute) {
      // check if date is the same or not
      if (foundRoute.date === date) return foundRoute
      // if date is different, update date
      const updatedRoute = await foundRoute.update({ date })
      return updatedRoute
    } else {
      const newRoute = await Route.create({
        itineraryId,
        date,
        originId,
        destinationId,
        transportationMode,
        distanceText: elements.distance.text,
        distanceValue: elements.distance.value,
        durationText: elements.duration.text,
        durationValue: elements.duration.value,
        color: this.getRandomLightColor()
      })
      return newRoute
    }
  },
  getRandomLightColor () {
    const color = 'hsl(' + Math.random() * 360 + ', 100%, 75%)'
    return color
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
  }

}
module.exports = mapServices
