const mapServices = require('../services/map-services')
const mapController = {
  getMap: (req, res, next) => { mapServices.getMap(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) }
}
module.exports = mapController
