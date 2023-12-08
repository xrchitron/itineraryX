require('dotenv').config()
const itineraryServices = require('../services/itinerary-services')
const userServices = require('../services/user-services')
const s3 = require('../utils/aws_s3')
const dateMethods = require('../utils/date-methods')
const HttpError = require('../utils/httpError')
const sequelize = require('../models').sequelize

const itineraryController = {
  getItinerary: async (req, res, next) => {
    try {
      const { itineraryId } = req.params
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')

      const itinerary = await itineraryServices.getItineraryWithParticipants(itineraryId)
      if (!itinerary) throw new HttpError(404, 'Itinerary not found')

      const itineraryData = await itineraryServices.processGetItineraryData(itinerary)

      res.status(200).json({ status: 'success', data: itineraryData })
    } catch (err) {
      next(err)
    }
  },
  getItineraries: async (req, res, next) => {
    try {
      const itineraries = await itineraryServices.getItineraries(req.user.id)
      if (!itineraries) throw new HttpError(404, 'Itineraries not found')

      const itinerariesData = await itineraryServices.processGetItinerariesData(itineraries)

      res.status(200).json({ status: 'success', data: itinerariesData })
    } catch (err) {
      next(err)
    }
  },
  postItinerary: async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
      const { title, startTime, endTime } = req.body
      if (!title) throw new HttpError(400, 'Title is required')
      if (!startTime) throw new HttpError(400, 'Start time is required')
      if (!endTime) throw new HttpError(400, 'End time is required')

      const newItinerary = await itineraryServices.createItinerary(req.user.id, title, startTime, endTime, t)
      if (!newItinerary) throw new HttpError(500, 'Failed to create itinerary')

      const holderAsParticipant = await itineraryServices.createParticipant(newItinerary.id, req.user.id, t)
      if (!holderAsParticipant) throw new HttpError(500, 'Failed to create holder as participant')

      // commit the transaction
      await t.commit()

      newItinerary.startTime = dateMethods.toISOString(newItinerary.startTime)
      newItinerary.endTime = dateMethods.toISOString(newItinerary.endTime)

      res.status(200).json({ status: 'success', data: newItinerary })
    } catch (err) {
      await t.rollback()
      next(err)
    }
  },
  putItinerary: async (req, res, next) => {
    try {
      const { itineraryId, title, startTime, endTime } = req.body
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      if (!title) throw new HttpError(400, 'Title is required')
      if (!startTime) throw new HttpError(400, 'Start time is required')
      if (!endTime) throw new HttpError(400, 'End time is required')

      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new HttpError(404, 'Itinerary not found')

      const image = await itineraryServices.processPutItineraryImage(itinerary, req.file)

      const updatedItinerary = await itineraryServices.updateItinerary(itinerary, title, image, startTime, endTime)
      if (!updatedItinerary) throw new HttpError(500, 'Failed to update itinerary')

      const itineraryData = await itineraryServices.processUpdatedItineraryData(updatedItinerary)

      res.status(200).json({ status: 'success', data: itineraryData })
    } catch (err) {
      next(err)
    }
  },
  deleteItinerary: async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
      const { itineraryId } = req.body
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new HttpError(404, 'Itinerary not found')

      const deletedItinerary = await itineraryServices.deleteItinerary(itinerary, t)
      if (!deletedItinerary) throw new HttpError(500, 'Failed to delete itinerary')

      const deletedParticipants = await itineraryServices.deleteParticipants(itineraryId, t)
      if (!deletedParticipants) throw new HttpError(500, 'Failed to delete participants')

      // delete destinations but content could be null
      await itineraryServices.deleteDestinations(itineraryId, t)

      // commit the transaction
      await t.commit()

      // delete itinerary image from s3 to save storage
      if (deletedItinerary.image) await s3.deleteImage(deletedItinerary.image)

      res.status(200).json({ status: 'success', data: deletedItinerary })
    } catch (err) {
      await t.rollback()
      next(err)
    }
  },
  postParticipant: async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
      const { itineraryId, email } = req.body
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      if (!email) throw new HttpError(400, 'Missing email')

      const user = await userServices.getUserByEmail(email)
      if (!user) throw new HttpError(404, 'User not found')

      const participant = await itineraryServices.getParticipant(itineraryId, user.id)
      if (participant) throw new HttpError(409, 'You are already having this participant!')

      const newParticipant = await itineraryServices.createParticipant(itineraryId, user.id, t)
      if (!newParticipant) throw new HttpError(500, 'Failed to add participant')

      // commit the transaction
      await t.commit()

      // send email to invite user
      const link = `${process.env.CLIENT_URL}/edit/${itineraryId}`
      // itineraryServices.sendInviteEmail(email, itineraryId, user.name)  //temp cancel

      const notification = userServices.postNotification(user.id, req.user.id, `${req.user.name} invited you to join a trip! Click to join!`, link)
      if (!notification) throw new HttpError(500, 'Failed to send notification')

      res.status(200).json({ status: 'success', data: newParticipant })
    } catch (err) {
      await t.rollback()
      next(err)
    }
  },
  deleteParticipant: async (req, res, next) => {
    try {
      const { itineraryId, participantId } = req.query
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      if (!participantId) throw new HttpError(400, 'Missing participant id')

      const participant = await itineraryServices.getParticipant(itineraryId, participantId)
      if (!participant) throw new HttpError(409, "You haven't added this user!")

      const deletedParticipant = await itineraryServices.deleteParticipant(participant)
      if (!deletedParticipant) throw new HttpError(500, 'Failed to delete participant')

      res.status(200).json({ status: 'success', data: deletedParticipant })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = itineraryController
