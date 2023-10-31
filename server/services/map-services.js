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
    axios.get(url)
      .then(res => {
        const elements = res.data.rows[0].elements[0]
        if (!elements.status === 'OK' || elements.distance === undefined) {
          throw new Error('No results found')
        } else {
          const data = {
            distance: elements.distance,
            duration: elements.duration
          }
          console.log(data)
          return cb(null, data)
        }
      })
      .catch(err => cb(err))
  }
}
module.exports = mapServices
