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
  async getItineraryWithParticipants (id, holderId) {
    const itinerary = await Itinerary.findOne({
      where: {
        id,
        holderId
      },
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
  async createItinerary (holderId, title, image) {
    const itinerary = await Itinerary.create({
      holderId,
      title,
      image
    })
    return itinerary
  },
  async updateItinerary (itinerary, title, image) {
    const updatedItinerary = await itinerary.update({
      title: title || itinerary.title,
      image: image || itinerary.image
    })
    return updatedItinerary
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
      }
    })
    return participant
  },
  async createParticipant (itineraryId, participantId) {
    const participant = await Participant.create({
      itineraryId,
      participantId
    })
    return participant
  },
  async deleteParticipant (participant) {
    const deletedParticipant = participant.destroy()
    return deletedParticipant
  }
}
module.exports = itineraryServices
