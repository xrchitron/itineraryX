const userServices = require('../services/user-services')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { localFileHandler } = require('../utils/file')
const userController = {
  signUp: async (req, res, next) => {
    try {
      const userInput = req.body
      // if two password different, establish a new error
      if (userInput.password !== userInput.passwordCheck) throw new Error('Password do not match!')
      // confirm whether email das exist, throw error if true
      const user = await userServices.getUserByEmail(userInput.email)
      if (user) throw new Error('Email already exist')
      const hash = await bcrypt.hash(userInput.password, 10) // hash password
      const newUser = await userServices.createNewUser(userInput.name, userInput.email, hash) // create user
      // delete password
      const userData = newUser.toJSON()
      delete userData.password
      // return data
      res.status(200).json({ status: 'success', data: userData })
    } catch (err) {
      next(err)
    }
  },
  login: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.status(200).json({
        status: 'success',
        data: { token, user: userData }
      })
    } catch (err) {
      next(err)
    }
  },
  getUser: async (req, res, next) => {
    try {
      const user = await userServices.getUserWithFollows(req.user.id)
      if (!user) throw new Error("User didn't exist!")
      // delete user.password
      const userData = user.toJSON()
      delete userData.password
      userData.Followers.forEach(follower => { delete follower.password })
      userData.Followings.forEach(following => { delete following.password })
      res.status(200).json({ status: 'success', data: { user: userData } })
    } catch (err) {
      next(err)
    }
  },
  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      const userId = req.user.id
      if (!name) throw new Error('User name is required!')
      const { file } = req
      const user = await userServices.getUserById(userId)
      const filePath = await localFileHandler(file)
      if (!user) throw new Error("User didn't exist!")
      const UpdatedUser = await userServices.putUserAvatar(userId, name, filePath)
      const userData = UpdatedUser.toJSON()
      delete userData.password
      res.status(200).json({ status: 'success', data: { user: userData } })
    } catch (err) {
      next(err)
    }
  },
  addFollowing: async (req, res, next) => {
    try {
      const { userId } = req.body
      const user = await userServices.getUserById(userId)
      const followship = await userServices.getFollowship(req.user.id, userId)
      if (!user) throw new Error("User didn't exist!")
      if (followship) throw new Error('You are already following this user!')
      const data = await userServices.addFollowingById(req.user.id, userId)
      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  },
  removeFollowing: async (req, res, next) => {
    try {
      const { userId } = req.body
      const followship = await userServices.getFollowship(req.user.id, userId)
      if (!followship) throw new Error("You haven't followed this user!")
      const data = await followship.destroy()
      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
