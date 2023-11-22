const itineraryServices = require('../services/itinerary-services')
const userServices = require('../services/user-services')
const s3 = require('../utils/aws_s3')
const dateMethods = require('../utils/date-methods')
const itineraryController = {
  getItinerary: async (req, res, next) => {
    try {
      const { itineraryId } = req.params
      const itinerary = await itineraryServices.getItineraryWithParticipants(itineraryId)

      if (!itinerary) throw new Error('Itinerary not found')

      const itineraryData = itinerary.toJSON()
      // turn image name into url if image from s3 exist
      if (itineraryData.image) itineraryData.image = await s3.getImage(itineraryData.image)
      // turn avatar name into url if avatar from s3 exist
      itineraryData.ParticipantsUser = await Promise.all(itineraryData.ParticipantsUser.map(async participant => {
        delete participant.Participant
        if (participant.avatar) participant.avatar = await s3.getImage(participant.avatar)
        return participant
      }))

      res.status(200).json({ status: 'success', data: itineraryData })
    } catch (err) {
      next(err)
    }
  },
  getItineraries: async (req, res, next) => {
    try {
      const itineraries = await itineraryServices.getItineraries(req.user.id)

      // turn image name into url if image from s3 exist
      const itinerariesData = await Promise.all(itineraries.map(async itinerary => {
        if (itinerary.image)itinerary.image = await s3.getImage(itinerary.image)
        return itinerary
      }))
      res.status(200).json({ status: 'success', data: itinerariesData })
    } catch (err) {
      next(err)
    }
  },
  postItinerary: async (req, res, next) => {
    try {
      const { title, startTime, endTime } = req.body
      if (!title) throw new Error('Missing title')

      const newItinerary = await itineraryServices.createItinerary(req.user.id, title, startTime, endTime)
      await itineraryServices.createParticipant(newItinerary.id, req.user.id)
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
      if (!itineraryId) throw new Error('Missing itinerary id')
      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new Error('Itinerary not found')
      let image = itinerary.image

      // upload image to s3, delete previous image and get new image url
      const { file } = req
      let imageFileName = null
      if (file) {
        imageFileName = await s3.uploadItineraryImage(itineraryId, file)
        if (image) await s3.deleteImage(image)
      }
      image = imageFileName || image
      const updatedItinerary = await itineraryServices.updateItinerary(itinerary, title, image, startTime, endTime)
      // turn image name into url if image from s3 exist
      if (updatedItinerary.image) {
        updatedItinerary.image = await s3.getImage(updatedItinerary.image)
      }
      // turn time into iso string
      updatedItinerary.startTime = dateMethods.toISOString(updatedItinerary.startTime)
      updatedItinerary.endTime = dateMethods.toISOString(updatedItinerary.endTime)
      res.status(200).json({ status: 'success', data: updatedItinerary })
    } catch (err) {
      next(err)
    }
  },
  deleteItinerary: async (req, res, next) => {
    try {
      const { itineraryId } = req.body
      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new Error('Itinerary not found')

      // delete itinerary from db
      const deletedItinerary = await itineraryServices.deleteItinerary(itinerary)
      // delete image from s3
      if (deletedItinerary.image) await s3.deleteImage(deletedItinerary.image)

      res.status(200).json({ status: 'success', data: deletedItinerary })
    } catch (err) {
      next(err)
    }
  },
  postParticipant: async (req, res, next) => {
    try {
      const { itineraryId, participantId } = req.body
      const user = await userServices.getUserById(participantId)
      const participant = await itineraryServices.getParticipant(itineraryId, participantId)

      if (!user) throw new Error("User didn't exist!")
      if (participant) throw new Error('You are already having this participant!')

      const newParticipant = await itineraryServices.createParticipant(itineraryId, participantId)
      res.status(200).json({ status: 'success', data: newParticipant })
    } catch (err) {
      next(err)
    }
  },
  deleteParticipant: async (req, res, next) => {
    try {
      const { itineraryId, participantId } = req.body
      const participant = await itineraryServices.getParticipant(itineraryId, participantId)
      if (!participant) throw new Error("You haven't added this user!")
      const deletedParticipant = await itineraryServices.deleteParticipant(participant)
      res.status(200).json({ status: 'success', data: deletedParticipant })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = itineraryController
