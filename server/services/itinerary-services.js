const { User, Itinerary, Participant } = require('../models')
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
  async createItinerary (holderId, title) {
    const itinerary = await Itinerary.create({
      holderId,
      title
    })
    return itinerary
  },
  async updateItinerary (itinerary, title, image, startTime, endTime) {
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
  }
}
module.exports = itineraryServices
