require('dotenv').config()
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const crypto = require('crypto')
// const sharp = require('sharp')
// const buffer = await sharp(file.buffer).resize({ width: 200, height: 200 }).toBuffer()

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

async function uploadImage (userEmail, file) {
  const imageName = randomImageName()
  const key = `users/${userEmail}/${imageName}`
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }
  const command = new PutObjectCommand(params)
  await s3.send(command)
  return key
}

async function getImage (imageName) {
  const getObjectParams = {
    Bucket: bucketName,
    Key: imageName
  }
  const command = new GetObjectCommand(getObjectParams)
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
  return url
}

async function deleteImage (imageName) {
  const deleteObjectParams = {
    Bucket: bucketName,
    Key: imageName
  }
  const command = new DeleteObjectCommand(deleteObjectParams)
  await s3.send(command)
  return true
}

module.exports = { uploadImage, getImage, deleteImage }
