require('dotenv').config()
const userServices = require('../services/user-services')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const sharp = require('sharp')

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretKey = process.env.SECRET_KEY
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  },
  region: bucketRegion
}
)

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
      // get avatar url from s3
      const getObjectParams = {
        Bucket: bucketName,
        Key: userData.avatar
      }
      const command = new GetObjectCommand(getObjectParams)
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
      // turn avatar name into url
      userData.avatar = url
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
      if (!user) throw new Error("User didn't exist!")
      const buffer = await sharp(file.buffer).resize({ width: 200, height: 200 }).toBuffer()

      const imageName = randomImageName()
      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      }
      const command = new PutObjectCommand(params)
      await s3.send(command)

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
