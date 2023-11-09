const itineraryServices = require('../services/itinerary-services')
const userServices = require('../services/user-services')
const s3 = require('../utils/aws_s3')
const itineraryController = {
  getItinerary: async (req, res, next) => {
    try {
      const itineraryId = req.params.itid
      const { holderId } = req.body
      const itinerary = await itineraryServices.getItineraryWithParticipants(itineraryId, holderId)

      if (!itinerary) throw new Error('Itinerary not found')

      const itineraryData = itinerary.toJSON()
      itineraryData.ParticipantsUser.forEach(participant => { delete participant.Participant })

      res.status(200).json({ status: 'success', data: itineraryData })
    } catch (err) {
      next(err)
    }
  },
  getItineraries: async (req, res, next) => {
    try {
      const itineraries = await itineraryServices.getItineraries(req.user.id)
      res.status(200).json({ status: 'success', data: itineraries })
    } catch (err) {
      next(err)
    }
  },
  postItinerary: async (req, res, next) => {
    try {
      const userInput = req.body

      const itinerary = await itineraryServices.getItineraryByIdAndTitle(req.user.id, userInput.title)
      if (itinerary) throw new Error('Itinerary already exist')

      const newItinerary = await itineraryServices.createItinerary(req.user.id, userInput.title)
      await itineraryServices.createParticipant(newItinerary.id, req.user.id)
      res.status(200).json({ status: 'success', data: newItinerary })
    } catch (err) {
      next(err)
    }
  },
  putItinerary: async (req, res, next) => {
    try {
      const { itineraryId, title } = req.body
      if (!itineraryId) throw new Error('Missing itinerary id')
      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new Error('Itinerary not found')
      let image = itinerary.image

      // upload image to s3, delete previous image and get new image url
      const { file } = req
      let imageUrl = null
      let imageFileName = null
      if (file) {
        imageFileName = await s3.uploadItineraryImage(itineraryId, file)
        if (image) await s3.deleteImage(image)
        imageUrl = await s3.getImage(imageFileName)
      }
      image = imageFileName || image
      const updatedItinerary = await itineraryServices.updateItinerary(itinerary, title, image)
      // turn image name into url if image from s3 exist
      updatedItinerary.image = imageUrl || await s3.getImage(updatedItinerary.image)

      res.status(200).json({ status: 'success', data: updatedItinerary })
    } catch (err) {
      next(err)
    }
  },
  deleteItinerary: async (req, res, next) => {
    try {
      const itineraryId = req.body.itineraryId
      const itinerary = await itineraryServices.getItinerary(itineraryId, req.user.id)
      if (!itinerary) throw new Error('Itinerary not found')

      // delete itinerary from db
      const deletedItinerary = await itineraryServices.deleteItinerary(itinerary)
      // delete image from s3
      await s3.deleteImage(deletedItinerary.image)

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
