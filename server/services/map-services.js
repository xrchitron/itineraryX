const { Place, Distance } = require('../models')
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
          const distanceData = {
            // haven't added itineraryId and date
            originId: originContent.id,
            destinationId: destinationContent.id,
            distanceText: elements.distance.text,
            distanceValue: elements.distance.value,
            durationText: elements.duration.text,
            durationValue: elements.duration.value
          }
          return distanceData
        }
      })
      .then(distanceData => {
        return createDistance(distanceData)
      })
      .then(data => {
        const distanceData = data.toJSON()
        return cb(null, { distanceData })
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
function createDistance (data) {
  return Distance.findOne({ where: { originId: data.originId, destinationId: data.destinationId } })
    .then(foundDistance => {
      if (foundDistance) {
        return foundDistance
      } else {
        return Distance.create({
          originId: data.originId,
          destinationId: data.destinationId,
          distanceText: data.distanceText,
          distanceValue: data.distanceValue,
          durationText: data.durationText,
          durationValue: data.durationValue
        })
      }
    })
}
