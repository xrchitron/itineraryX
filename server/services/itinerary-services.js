const { User, Itinerary, Participant } = require('../models')
const itineraryServices = {
  getItinerary: (req, cb) => {
    const itineraryId = req.params.itid
    const { holderId } = req.body
    return Itinerary.findOne({
      where: {
        id: itineraryId,
        holderId
      },
      include: [{
        model: User,
        as: 'ParticipantsUser',
        attributes: ['id', 'name', 'avatar']
      }]
    })
      .then(itinerary => {
        if (!itinerary) throw new Error('Itinerary not found')
        const itineraryData = itinerary.toJSON()
        itineraryData.ParticipantsUser.forEach(participant => { delete participant.Participant })
        cb(null, itineraryData)
      })
      .catch(err => cb(err))
  },
  getItineraries: (req, cb) => {
    return Itinerary.findAll({ where: { holderId: req.user.id } })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  postItinerary: (req, cb) => {
    const userInput = req.body
    return Itinerary.findOne({
      where: {
        holderId: req.user.id,
        title: userInput.title
      }
    })
      .then(itinerary => {
        if (itinerary) throw new Error('Itinerary already exist')
        return Itinerary.create({
          holderId: req.user.id,
          title: userInput.title,
          image: userInput.image
        })
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  putItinerary: (req, cb) => {
    const { itineraryId, title, image } = req.body
    return Itinerary.findOne({
      where: {
        id: itineraryId,
        holderId: req.user.id
      }
    })
      .then(itinerary => {
        if (!itinerary) throw new Error('Itinerary not found')
        return itinerary.update({
          title: title || itinerary.title,
          image: image || itinerary.image
        })
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  deleteItinerary: (req, cb) => {
    const itineraryId = req.body.itineraryId
    return Itinerary.findOne({
      where: {
        id: itineraryId,
        holderId: req.user.id
      }
    })
      .then(itinerary => {
        if (!itinerary) throw new Error('Itinerary not found')
        return itinerary.destroy()
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  postParticipant: (req, cb) => {
    const { itineraryId, participantId } = req.body
    return Promise.all([
      User.findByPk(participantId),
      Participant.findOne({
        where: {
          itineraryId,
          participantId
        }
      })
    ])
      .then(([user, participant]) => {
        if (!user) throw new Error("User didn't exist!")
        if (participant) throw new Error('You are already having this participant!')
        return Participant.create({
          itineraryId,
          participantId
        })
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  },
  deleteParticipant: (req, cb) => {
    const { itineraryId, participantId } = req.body
    return Participant.findOne({
      where: {
        itineraryId,
        participantId
      }
    })
      .then(participant => {
        if (!participant) throw new Error("You haven't added this user!")
        return participant.destroy()
      })
      .then(data => cb(null, data))
      .catch(err => cb(err))
  }
}
module.exports = itineraryServices
