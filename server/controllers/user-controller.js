const userServices = require('../services/user-services')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const s3 = require('../utils/aws_s3')

const userController = {
  signUp: async (req, res, next) => {
    try {
      const userInput = req.body
      // if two password different, establish a new error
      if (userInput.password !== userInput.passwordCheck) throw new Error('Password do not match!')
      // confirm whether email das exist, throw error if true
      const user = await userServices.getUserByEmail(userInput.email)
      if (user) throw new Error('Email already exist')
      const userName = await userServices.getUserByName(userInput.name)
      if (userName) throw new Error('User name already exist')
      const hash = await bcrypt.hash(userInput.password, 10) // hash password
      const newUser = await userServices.createNewUser(userInput.name, userInput.email, hash) // create user
      // delete password
      const userData = newUser.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      // return data
      res.status(200).json({ status: 'success', data: { token, user: userData } })
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
      const { userId } = req.params
      const user = await userServices.getUserWithFollows(userId)
      if (!user) throw new Error("User didn't exist!")
      // delete user.password
      const userData = user.toJSON()

      // get avatar url from s3
      if (userData.avatar) userData.avatar = await s3.getImage(userData.avatar)

      if (userData.Followers.length !== 0) {
        userData.Followers.forEach(async follower => {
          delete follower.Followship
          if (follower.avatar) follower.avatar = await s3.getImage(follower.avatar)
        })
      }
      if (userData.Followings.length !== 0) {
        userData.Followings.forEach(async following => {
          delete following.Followship
          if (following.avatar) following.avatar = await s3.getImage(following.avatar)
        })
      }

      res.status(200).json({ status: 'success', data: { user: userData } })
    } catch (err) {
      next(err)
    }
  },
  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      const userId = req.user.id

      // check if name is empty
      if (!name) throw new Error('User name is required!')
      const user = await userServices.getUserById(userId)
      if (!user) throw new Error("User didn't exist!")

      // delete previous avatar from s3
      if (user.avatar) await s3.deleteImage(user.avatar)

      // upload image to s3
      const { file } = req
      let imageName = null
      if (file) imageName = await s3.uploadImage(user.email, file)

      // update user info
      const UpdatedUser = await userServices.putUserAvatar(userId, name, imageName)
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
      const deletedFollowship = await userServices.deleteFollowship(followship)
      res.status(200).json({ status: 'success', data: deletedFollowship })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
