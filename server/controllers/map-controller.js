const mapServices = require('../services/map-services')
const mapController = {
  getMap: (req, res, next) => { mapServices.getMap(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  getDistanceMatrix: (req, res, next) => { mapServices.getDistanceMatrix(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) },
  postRoute: (req, res, next) => { mapServices.postRoute(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data })) }
}
module.exports = mapController
