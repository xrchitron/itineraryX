const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Place, Route } = require('../models')
const axios = require('axios')
const key = process.env.API_KEY
const mapServices = {
  getMap: (req, cb) => {
    const { address } = req.query
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
    axios.get(url)
      .then(res => {
        const response = res.data.results[0]
        // const fullAddress = response.formatted_address
        // const placeId = response.place_id
        // const { lat, lng } = response.geometry.location
        // const geocodeResponse = { fullAddress, placeId, lat, lng }
        cb(null, response)
      })
      .catch(err => cb(err))
  },
  getDistanceMatrix (req, cb) {
    const { origin, destination } = req.body
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${key}`
    if (!origin || !destination) return cb(new Error('Missing required parameters'))
    Promise.all([
      createPlace(origin),
      createPlace(destination),
      axios.get(url)
    ])
      .then(([originContent, destinationContent, mapApiResponse]) => {
        const elements = mapApiResponse.data.rows[0].elements[0]
        if (!elements.status === 'OK' || elements.distance === undefined) {
          throw new Error('No results found')
        } else {
          const routeData = {
            // haven't added the real data yet
            itineraryId: 1,
            date: '2023-01-01 12:23:44',
            originId: originContent.id,
            destinationId: destinationContent.id,
            distanceText: elements.distance.text,
            distanceValue: elements.distance.value,
            durationText: elements.duration.text,
            durationValue: elements.duration.value
          }
          return routeData
        }
      })
      .then(routeData => {
        return createRoute(routeData)
      })
      .then(data => {
        const routeData = data.toJSON()
        return cb(null, { routeData })
      })
      .catch(err => cb(err))
  },
  getPlace (req, cb) {
    const { placeId } = req.body
    Place.findByPk(placeId, { raw: true })
      .then(place => {
        if (!place) throw new Error('Place not found')
        return cb(null, place)
      })
      .catch(err => cb(err))
  },
  postRoute (req, cb) {
    const { itineraryId, date, sort } = req.body
    const sortOrder = sort.order === 'asc' ? 'ASC' : 'DESC'
    const sortKey = sort.key === 'distance' ? 'distanceValue' : 'durationValue'
    return Route.findAll({
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
      .then(route => {
        if (!route || !route.length) throw new Error('Route not found')
        const data = route
        return cb(null, data)
      })
      .catch(err => cb(err))
  }

}
module.exports = mapServices

function createPlace (place) {
  return Place.findOne({ where: { placeId: place.placeId } })
    .then(foundPlace => {
      if (foundPlace) {
        return foundPlace
      } else {
        return Place.create({
          name: place.name,
          placeId: place.placeId,
          address: place.address,
          rating: place.rating,
          url: place.url,
          lat: place.lat,
          lng: place.lng
        })
      }
    })
}
function createRoute (data) {
  return Route.findOne({ where: { originId: data.originId, destinationId: data.destinationId } })
    .then(foundRoute => {
      if (foundRoute) {
        return foundRoute
      } else {
        return Route.create({
          itineraryId: data.itineraryId,
          date: data.date,
          originId: data.originId,
          destinationId: data.destinationId,
          distanceText: data.distanceText,
          distanceValue: data.distanceValue,
          durationText: data.durationText,
          durationValue: data.durationValue,
          color: getRandomLightColor()
        })
      }
    })
}
function getRandomLightColor () {
  const color = 'hsl(' + Math.random() * 360 + ', 100%, 75%)'
  return color
}
