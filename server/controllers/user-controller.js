const userServices = require('../services/user-services')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const s3 = require('../utils/aws_s3')
const HttpError = require('../utils/httpError')

const userController = {
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, passwordCheck } = req.body
      if (password !== passwordCheck) throw new HttpError(400, 'Password do not match!')

      const user = await userServices.getUserByEmail(email)
      if (user) throw new HttpError(409, 'Email already exist')

      const userName = await userServices.getUserByName(name)
      if (userName) throw new HttpError(409, 'User name already exist')

      const hash = await bcrypt.hash(password, 10)
      const newUser = await userServices.createNewUser(name, email, hash)
      if (!newUser) throw new HttpError(500, 'Create user failed!')

      // delete password
      const userData = newUser.toJSON()
      delete userData.password

      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })

      res.status(200).json({ status: 'success', data: { token, user: userData } })
    } catch (err) {
      next(err)
    }
  },
  login: async (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      if (userData.avatar) userData.avatar = await s3.getImage(userData.avatar)
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.status(200).json({
        status: 'success',
        data: { token, user: userData }
      })
    } catch (err) {
      next(err)
    }
  },
  getUserWithFollows: async (req, res, next) => {
    try {
      const { userId } = req.params
      const user = await userServices.getUserWithFollows(userId)
      if (!user) throw new HttpError(404, "User didn't exist!")
      // delete user.password
      const userData = user.toJSON()

      // get avatar url from s3
      if (userData.avatar) userData.avatar = await s3.getImage(userData.avatar)
      if (userData.Followers.length !== 0) {
        await userServices.processFollowshipAndS3Avatar(userData.Followers, s3)
      }
      if (userData.Followings.length !== 0) {
        await userServices.processFollowshipAndS3Avatar(userData.Followings, s3)
      }

      res.status(200).json({ status: 'success', data: { user: userData } })
    } catch (err) {
      next(err)
    }
  },
  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      const userId = req.user.id // from token

      // check if name is empty
      if (!name) throw new HttpError(400, 'User name is required!')
      const user = await userServices.getUserById(userId)
      if (!user) throw new HttpError(404, "User didn't exist!")

      // upload image to s3
      const { file } = req
      // delete previous avatar from s3 if user upload new avatar
      if (user.avatar || file) await s3.deleteImage(user.avatar)

      let imageName = null // if no file, imageName = null, image will not be updated
      if (file) imageName = await s3.uploadImage(user.email, file)

      const UpdatedUser = await userServices.putUserAvatar(userId, name, imageName)
      if (!UpdatedUser) throw new HttpError(500, 'Update user failed!')

      const userData = UpdatedUser.toJSON()
      delete userData.password

      if (userData.avatar) userData.avatar = await s3.getImage(userData.avatar)
      res.status(200).json({ status: 'success', data: { user: userData } })
    } catch (err) {
      next(err)
    }
  },
  getParticipatedItineraries: async (req, res, next) => {
    try {
      const userId = req.user.id
      if (!userId) throw new HttpError(400, 'Missing user id')

      const userItineraryId = await userServices.getParticipatedItineraries(userId)
      if (userItineraryId.itineraryId.length === 0) throw new HttpError(404, 'No result found')

      res.status(200).json({ status: 'success', data: userItineraryId })
    } catch (error) {
      next(error)
    }
  },
  addFollowing: async (req, res, next) => {
    try {
      const { userId } = req.body

      const user = await userServices.getUserById(userId)
      if (!user) throw new HttpError(404, "User didn't exist!")

      const followship = await userServices.getFollowship(req.user.id, userId)
      if (followship) throw new HttpError(409, 'You are already following this user!')

      const data = await userServices.addFollowingById(req.user.id, userId)
      if (!data) throw new HttpError(500, 'Add following failed!')

      res.status(200).json({ status: 'success', data })
    } catch (err) {
      next(err)
    }
  },
  removeFollowing: async (req, res, next) => {
    try {
      const { userId } = req.body

      const followship = await userServices.getFollowship(req.user.id, userId)
      if (!followship) throw new HttpError(409, "You haven't followed this user!")

      const deletedFollowship = await userServices.deleteFollowship(followship)
      if (!deletedFollowship) throw new HttpError(500, 'Delete followship failed!')

      res.status(200).json({ status: 'success', data: deletedFollowship })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
