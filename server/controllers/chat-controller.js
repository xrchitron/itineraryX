const chatServices = require('../services/chat-services')
const itineraryServices = require('../services/itinerary-services')
const dateMethods = require('../utils/date-methods')
const s3 = require('../utils/aws_s3')
const chatController = {
  getChats: async (req, res, next) => {
    try {
      const { itineraryId } = req.params
      if (!itineraryId) throw new Error('Missing itinerary id')
      const userId = req.user.id.toString()
      const participants = await itineraryServices.getParticipantId(itineraryId)

      // check participant valid or not
      const participantArray = participants.map(participant => {
        return participant.participantId
      })
      const participantValid = participantArray.includes(userId)
      if (!participantValid) throw new Error('User not in itinerary')

      // get chats
      const chats = await chatServices.getChats(itineraryId)

      // convert image to url
      chats.forEach(async chat => {
        if (chat.isImage) chat.message = await s3.getImage(chat.message)
      })

      const chatData = chats.map(chat => {
        const time = dateMethods.toISOString(chat.createdAt)
        return {
          id: chat.id,
          user: chat.userChat.name,
          avatar: chat.userChat.avatar,
          message: chat.message,
          time
        }
      })
      res.status(200).json({ status: 'success', data: chatData })
    } catch (error) {
      next(error)
    }
  },
  postChat: async (req, res, next) => {
    try {
      const { itineraryId, userId, message, isImage } = req.body
      const { file } = req

      if (!itineraryId || !userId) throw new Error('Missing itinerary id or user id')
      if (!isImage && !message) throw new Error('Empty message')

      // check participant exist
      const participant = await itineraryServices.getParticipant(itineraryId, userId)
      if (!participant) throw new Error('User not in itinerary')

      // message management
      let storedMessage
      if (message) storedMessage = message
      if (file && isImage) storedMessage = await s3.uploadChatImage(itineraryId, file)
      if (!storedMessage) throw new Error('Empty message')

      // create chat
      const chat = await chatServices.postChat(itineraryId, userId, message, isImage)
      // convert date format
      const time = dateMethods.toISOString(chat.createdAt)
      // output data
      const chatData = {
        id: chat.id,
        user: participant.ParticipantUser.name,
        avatar: participant.ParticipantUser.avatar,
        message: storedMessage,
        time
      }
      res.status(200).json({ status: 'success', data: chatData })
    } catch (error) {
      next(error)
    }
  }
}
module.exports = chatController
