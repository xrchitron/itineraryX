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

      const userData = userServices.deleteUserPassword(newUser)

      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })

      res.status(200).json({ status: 'success', data: { token, user: userData } })
    } catch (err) {
      next(err)
    }
  },
  login: async (req, res, next) => {
    try {
      const userData = userServices.deleteUserPassword(req.user)
      if (userData.avatar) userData.avatar = await s3.getImage(userData.avatar)
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.status(200).json({ status: 'success', data: { token, user: userData } })
    } catch (err) {
      next(err)
    }
  },
  getUserWithFollows: async (req, res, next) => {
    try {
      const { userId } = req.params
      const user = await userServices.getUserWithFollows(userId)
      if (!user) throw new HttpError(404, "User didn't exist!")

      const userData = await userServices.processAvatarAndFollowship(user.toJSON())

      res.status(200).json({ status: 'success', data: { user: userData } })
    } catch (err) {
      next(err)
    }
  },
  putUser: async (req, res, next) => {
    try {
      const { name } = req.body
      const userId = req.user.id
      const { file } = req
      if (!name) throw new HttpError(400, 'User name is required!')

      const userName = await userServices.getUserByName(name)
      if (userName) throw new HttpError(409, 'User name already exist')

      const user = await userServices.getUserById(userId)
      if (!user) throw new HttpError(404, "User didn't exist!")

      const imageName = await userServices.processUserAvatar(user, file)

      const UpdatedUser = await userServices.putUserAvatar(userId, name, imageName)
      if (!UpdatedUser) throw new HttpError(500, 'Update user failed!')

      const userData = userServices.deleteUserPassword(UpdatedUser)
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
  },
  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body
      if (!email) throw new HttpError(400, 'Missing email')

      const user = await userServices.getUserByEmail(email)
      if (!user) throw new HttpError(404, 'User not found')

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

      // send email to reset password
      const link = userServices.sendResetPasswordEmail(email, token)

      res.status(200).json({ status: 'success', data: { link } })
    } catch (err) {
      next(err)
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      const { token, password, passwordCheck } = req.body
      if (!token) throw new HttpError(400, 'Missing token')
      if (password !== passwordCheck) throw new HttpError(400, 'Password do not match!')

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded) throw new HttpError(400, 'Token is invalid or expired')

      const user = await userServices.getUserById(decoded.id)
      if (!user) throw new HttpError(404, 'User not found')

      const hash = await bcrypt.hash(password, 10)
      const updatedUser = await userServices.resetPassword(decoded.id, hash)
      if (!updatedUser) throw new HttpError(500, 'Reset password failed!')

      res.status(200).json({ status: 'success', data: updatedUser })
    } catch (err) {
      next(err)
    }
  },
  checkTokenValid: async (req, res, next) => {
    try {
      const { token } = req.body
      if (!token) throw new HttpError(400, 'Missing token')

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded) throw new HttpError(400, 'Token is invalid or expired')

      const user = await userServices.getUserById(decoded.id)
      if (!user) throw new HttpError(404, 'User not found')

      res.status(200).json({ status: 'success', data: user })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = userController
