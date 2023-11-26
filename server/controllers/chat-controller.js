const chatServices = require('../services/chat-services')
const itineraryServices = require('../services/itinerary-services')
const dateMethods = require('../utils/date-methods')
const s3 = require('../utils/aws_s3')
const HttpError = require('../utils/httpError')
const chatController = {
  getChats: async (req, res, next) => {
    try {
      const { itineraryId } = req.params
      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      const userId = req.user.id.toString()

      // if user is not participant, chat contents will not allow to show
      const participantValid = await chatServices.checkParticipantValidation(itineraryId, userId)
      if (!participantValid) throw new HttpError(403, 'Permission denied')

      const chats = await chatServices.getChats(itineraryId)

      // image in the database is file name, need to convert to url
      const chatWithImage = await chatServices.getChatWithImage(chats)

      const chatData = await chatServices.chatData(chatWithImage)
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
      // convert image to url
      let userAvatar = participant.ParticipantUser.avatar
      if (userAvatar) userAvatar = await s3.getImage(userAvatar)
      // output data
      const chatData = {
        id: chat.id,
        user: participant.ParticipantUser.name,
        avatar: userAvatar,
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
