const userServices = require('../services/user-services')
const userController = {
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data }))
  },
  login: (req, res, next) => {
    userServices.login(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data }))
  },
  getUser: (req, res, next) => {
    userServices.getUser(req, (err, data) => err ? next(err) : res.status(200).json({ status: 'success', data }))
  }
}
module.exports = userController
