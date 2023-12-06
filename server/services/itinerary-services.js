require('dotenv').config()
const { User, Itinerary, Participant } = require('../models')
const s3 = require('../utils/aws_s3')
const dateMethods = require('../utils/date-methods')
const { sendEmail } = require('../utils/aws-ses-send-email')
const itineraryServices = {
  async getItinerary (id, holderId) {
    const itinerary = await Itinerary.findOne({
      where: {
        id,
        holderId
      }
    })
    return itinerary
  },
  async getItineraryByPk (id) {
    const itinerary = await Itinerary.findByPk(id)
    return itinerary
  },
  async getItineraryWithParticipants (id) {
    const itinerary = await Itinerary.findByPk(id, {
      include: [{
        model: User,
        as: 'ParticipantsUser',
        attributes: ['id', 'name', 'avatar']
      }]
    })
    return itinerary
  },
  async getItineraries (holderId) {
    const itineraries = await Itinerary.findAll({ where: { holderId } })
    return itineraries
  },
  async getItineraryByIdAndTitle (id, title) {
    const itinerary = await Itinerary.findOne({
      where: {
        id,
        title
      }
    })
    return itinerary
  },
  async createItinerary (holderId, title, startTime, endTime) {
    const itinerary = await Itinerary.create({
      holderId,
      title,
      startTime,
      endTime
    })
    return itinerary.toJSON()
  },
  async updateItinerary (itinerary, title, image, startTime, endTime) {
    console.log(typeof image)
    const updatedItinerary = await itinerary.update({
      title: title || itinerary.title,
      image: image || itinerary.image,
      startTime: startTime || itinerary.startTime,
      endTime: endTime || itinerary.endTime
    })
    return updatedItinerary.toJSON()
  },
  async deleteItinerary (itinerary) {
    const deletedItinerary = itinerary.destroy()
    return deletedItinerary
  },
  async getParticipant (itineraryId, participantId) {
    const participant = await Participant.findOne({
      where: {
        itineraryId,
        participantId
      },
      include: [{
        model: User,
        as: 'ParticipantUser',
        attributes: ['id', 'name', 'avatar']
      }]
    })
    return participant
  },
  async getParticipants (itineraryId) {
    const participants = await Participant.findAll({
      where: {
        itineraryId
      },
      include: [{
        model: User,
        as: 'ParticipantUser',
        attributes: ['id', 'name', 'avatar']
      }]
    })
    return participants
  },
  async getParticipantId (itineraryId) {
    const participants = await Participant.findAll({
      where: {
        itineraryId
      },
      attributes: ['participantId']
    })
    return participants
  },
  async createParticipant (itineraryId, participantId) {
    const participant = await Participant.create({
      itineraryId,
      participantId
    })
    return participant
  },
  async deleteParticipant (participant) {
    const deletedParticipant = await participant.destroy()
    const returnData = {
      itineraryId: deletedParticipant.itineraryId,
      participantId: deletedParticipant.participantId
    }
    return returnData
  },
  async processGetItineraryData (itinerary) {
    const itineraryData = itinerary.toJSON()
    // turn image name into url if image from s3 exist
    if (itineraryData.image) itineraryData.image = await s3.getImage(itineraryData.image)
    // turn avatar name into url if avatar from s3 exist
    itineraryData.ParticipantsUser = await Promise.all(itineraryData.ParticipantsUser.map(async participant => {
      delete participant.Participant
      if (participant.avatar) participant.avatar = await s3.getImage(participant.avatar)
      return participant
    }))
    return itineraryData
  },
  async processGetItinerariesData (itineraries) {
    const itinerariesData = await Promise.all(itineraries.map(async itinerary => {
      // turn image name into url if image from s3 exist
      if (itinerary.image)itinerary.image = await s3.getImage(itinerary.image)
      return itinerary
    }))
    return itinerariesData
  },
  async processPutItineraryImage (itinerary, file) {
    itinerary = itinerary.toJSON()
    let image = itinerary.image
    // upload image to s3, delete previous image and get new image url
    let imageFileName = null
    if (file) {
      imageFileName = await s3.uploadItineraryImage(itinerary.id, file)
      if (image) await s3.deleteImage(image)
    }
    image = imageFileName || image
    return image
  },
  async processUpdatedItineraryData (itinerary) {
    // turn image name into url if image from s3 exist
    if (itinerary.image) itinerary.image = await s3.getImage(itinerary.image)

    // turn time into iso string
    itinerary.startTime = dateMethods.toISOString(itinerary.startTime)
    itinerary.endTime = dateMethods.toISOString(itinerary.endTime)
    return itinerary
  },
  sendInviteEmail: async (email, itineraryId, name) => {
    const title = 'You have been invited to join a trip!'
    const link = `${process.env.CLIENT_URL}/map/edit/${itineraryId}`
    const emailContent = `<h1>Hi ${name},</h1><p>You have been invited to join a trip! Please click the link below to join the trip.</p><a href="${link}">Join the trip</a>`
    await sendEmail(email, title, emailContent)
    return link
  }
}
module.exports = itineraryServices
