const bcrypt = require('bcryptjs')
const { User } = require('../models')

const userServices = {
  signUp: (req, cb) => {
    const userInput = req.body
    // if two password different, establish a new error
    if (userInput.password !== userInput.passwordCheck) throw new Error('Password do not match!')
    // confirm whether email das exist, throw error if true
    return User.findOne({ where: { email: userInput.email } })
      .then(user => {
        if (user) throw new Error('Email already exist')
        return bcrypt.hash(userInput.password, 10) // hash password
      })
      .then(hash => {
        return User.create({
          name: userInput.name,
          email: userInput.email,
          password: hash
        })
      })
      .then(user => {
        const userData = user.toJSON()
        delete userData.password
        return userData
      })
      .then(data => cb(null, data))
      .catch(err => cb(err)) // catch error above and call error-handler middleware
  }
}
module.exports = userServices
