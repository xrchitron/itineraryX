const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Place, Route } = require('../models')
const axios = require('axios')
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
    const foundPlace = await Place.findOne({ where: { placeId: place.placeId } })
    if (foundPlace) return foundPlace

    const newPlace = await Place.create({
      name: place.name,
      placeId: place.placeId,
      address: place.address,
      rating: place.rating,
      url: place.url,
      lat: place.lat,
      lng: place.lng
    })
    return newPlace
  },
  async createRoute (itineraryId, date, originId, destinationId, elements) {
    const foundRoute = await Route.findOne({ where: { originId, destinationId } })
    if (foundRoute) {
      return foundRoute
    } else {
      const newRoute = await Route.create({
        itineraryId,
        date,
        originId,
        destinationId,
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
  }

}
module.exports = mapServices
