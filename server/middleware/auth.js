const passport = require('../config/passport')
const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    req.user = user // covered by cb, should write it back or there is no req.user
    next()
  })(req, res, next)
}

const authAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'Permission denied' })
}
module.exports = {
  auth,
  authAdmin
}
