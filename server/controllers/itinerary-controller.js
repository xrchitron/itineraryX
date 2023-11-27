const itineraryServices = require('../services/itinerary-services')
const userServices = require('../services/user-services')
const s3 = require('../utils/aws_s3')
const dateMethods = require('../utils/date-methods')
const HttpError = require('../utils/httpError')
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
    try {
      const { title, startTime, endTime } = req.body
      if (!title) throw new HttpError(400, 'Title is required')
      if (!startTime) throw new HttpError(400, 'Start time is required')
      if (!endTime) throw new HttpError(400, 'End time is required')

      const newItinerary = await itineraryServices.createItinerary(req.user.id, title, startTime, endTime)
      if (!newItinerary) throw new HttpError(500, 'Failed to create itinerary')

      const holderAsParticipant = await itineraryServices.createParticipant(newItinerary.id, req.user.id)
      if (!holderAsParticipant) throw new HttpError(500, 'Failed to create participant')

      newItinerary.startTime = dateMethods.toISOString(newItinerary.startTime)
      newItinerary.endTime = dateMethods.toISOString(newItinerary.endTime)

      res.status(200).json({ status: 'success', data: newItinerary })
    } catch (err) {
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
    try {
      const { itineraryId } = req.body
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new HttpError(404, 'Itinerary not found')

      const deletedItinerary = await itineraryServices.deleteItinerary(itinerary)
      if (!deletedItinerary) throw new HttpError(500, 'Failed to delete itinerary')

      // delete itinerary image from s3 to save storage
      if (deletedItinerary.image) await s3.deleteImage(deletedItinerary.image)

      res.status(200).json({ status: 'success', data: deletedItinerary })
    } catch (err) {
      next(err)
    }
  },
  postParticipant: async (req, res, next) => {
    try {
      const { itineraryId, email } = req.body
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      if (!email) throw new HttpError(400, 'Missing email')

      const user = await userServices.getUserByEmail(email)
      if (!user) throw new HttpError(404, 'User not found')

      const participant = await itineraryServices.getParticipant(itineraryId, user.id)
      if (participant) throw new HttpError(409, 'You are already having this participant!')

      const newParticipant = await itineraryServices.createParticipant(itineraryId, user.id)
      if (!newParticipant) throw new HttpError(500, 'Failed to add participant')

      res.status(200).json({ status: 'success', data: newParticipant })
    } catch (err) {
      next(err)
    }
  },
  deleteParticipant: async (req, res, next) => {
    try {
      const { itineraryId, participantId } = req.body
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      if (!participantId) throw new HttpError(400, 'Missing participant id')

      const participant = await itineraryServices.getParticipant(itineraryId, participantId)
      if (!participant) throw new HttpError(404, "You haven't added this user!")

      const deletedParticipant = await itineraryServices.deleteParticipant(participant)
      if (!deletedParticipant) throw new HttpError(500, 'Failed to delete participant')

      res.status(200).json({ status: 'success', data: deletedParticipant })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = itineraryController
