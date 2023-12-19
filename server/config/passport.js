const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')

const { User } = require('../models')
const redisServices = require('../utils/redis')
const HttpError = require('../utils/httpError')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
// set up Passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  async (req, email, password, cb) => {
    try {
      const user = await User.findOne({ where: { email } })
      if (!user) return cb(new HttpError(401, "Haven't registered yet!"))

      const res = await bcrypt.compare(password, user.password)
      if (!res) return cb(new HttpError(403, 'Password incorrect!'))

      return cb(null, user)
    } catch (err) {
      return cb(err)
    }
  }
))
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, cb) => {
  try {
    // check if user data exists in redis
    const redisData = await redisServices.getRedis(`getUser-uid${jwtPayload.id}`)
    if (redisData) {
      const userData = JSON.parse(redisData)
      cb(null, userData)
      return
    }
    // check if user data exists in database
    const user = await User.findByPk(jwtPayload.id)
    if (user) {
      const userData = user.toJSON()
      delete userData.password
      // set user data to redis
      redisServices.setRedis(`getUser-uid${jwtPayload.id}`, JSON.stringify(userData), 'EX', 3600)
      cb(null, userData)
    } else {
      cb(null, false)
    }
  } catch (err) {
    cb(err)
  }
}))
// serialize and deserialize user
// 序列化 的作法是只存 user id至session，不存整個 user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
// 反序列化 就是透過 user id，把整個 user 物件實例拿出來
passport.deserializeUser(async (id, cb) => {
  try {
    const redisData = await redisServices.getRedis(`getUser-uid${id}`)
    if (redisData) {
      const userData = JSON.parse(redisData)
      cb(null, userData)
      return
    }
    const user = await User.findByPk(id)
    const userData = user.toJSON()
    delete userData.password
    // set user data to redis
    redisServices.setRedis(`getUser-uid${id}`, JSON.stringify(userData), 'EX', 3600)
    cb(null, userData)
  } catch (err) {
    cb(err)
  }
})
module.exports = passport
