const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')

const { User } = require('../models')

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
  (req, email, password, cb) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) return cb(new Error('Account or password incorrect!')) // didn't support SSR
        bcrypt.compare(password, user.password)
          .then(res => {
            if (!res) return cb(new Error('Account or password incorrect!')) // didn't support SSR
            return cb(null, user)
          })
      })
      .catch(err => cb(err))
  }
))
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}
passport.use(new JWTStrategy(jwtOptions, (jwtPayload, cb) => {
  return User.findByPk(jwtPayload.id)
    .then(user => {
      const userData = user.toJSON()
      delete userData.password
      return userData
    })
    .then(user => cb(null, user))
    .catch(err => cb(err))
}))
// serialize and deserialize user
// 序列化 的作法是只存 user id至session，不存整個 user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
// 反序列化 就是透過 user id，把整個 user 物件實例拿出來
passport.deserializeUser((id, cb) => {
  return User.findByPk(id)
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})
module.exports = passport
