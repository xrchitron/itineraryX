const axios = require('axios')
const key = process.env.API_KEY
const mapServices = {
  getMap: (req, cb) => {
    const { address } = req.query
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
    axios.get(url)
      .then(response => {
        const formattedAddress = response.data.results[0]
        cb(null, formattedAddress)
      })
      .catch(err => cb(err))
  }
}
module.exports = mapServices
// const { lat, lng } = req.query
// const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAP_API_KEY}`
// axios.get(url)
//   .then(response => {
//     const { formatted_address } = response.data.results[0]
//     cb(null, formatted_address)
//   })
//   .catch(err => cb(err))
