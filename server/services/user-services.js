const bcrypt = require('bcryptjs')
const { User, Followship } = require('../models')
const jwt = require('jsonwebtoken')
const { localFileHandler } = require('../utils/file')
const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/009/734/564/original/default-avatar-profile-icon-of-social-media-user-vector.jpg'
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
  },
  login: (req, cb) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      const data = {
        token,
        user: userData
      }
      cb(null, data)
    } catch (err) {
      cb(err)
    }
  },
  getUser: (req, cb) => {
    return User.findByPk(req.user.id//, {
    //   include: [
    //     { model: User, as: 'Followers' },
    //     { model: User, as: 'Followings' }
    //   ]}
    )
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        cb(null, { user, DEFAULT_AVATAR })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name } = req.body
    const userId = req.user.id
    if (!name) throw new Error('User name is required!')
    const { file } = req
    return Promise.all([
      User.findByPk(userId),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")
        return user.update({ name, avatar: filePath || user.avatar })
      })
      .then(user => {
        const userData = user.toJSON()
        delete userData.password
        cb(null, { user: userData })
      })
      .catch(err => cb(err))
  },
  addFollowing: (req, cb) => {
    const { userId } = req.body
    return Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You are already following this user!')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  removeFollowing: (req, cb) => {
    const { userId } = req.body
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  }
}
module.exports = userServices
