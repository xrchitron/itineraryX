const chatServices = require('../services/chat-services')
const itineraryServices = require('../services/itinerary-services')
// const s3 = require('../utils/aws_s3')
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

      const chatData = chatServices.getChatData(chatWithImage)
      res.status(200).json({ status: 'success', data: chatData })
    } catch (error) {
      next(error)
    }
  },
  postChat: async (req, res, next) => {
    try {
      let { itineraryId, message, isImage } = req.body
      const userId = req.user.id
      const { file } = req

      if (!itineraryId) throw new HttpError(400, 'Missing itinerary id')
      if (!message && !isImage) throw new HttpError(400, 'Empty message')
      if (isImage && !file) throw new HttpError(400, 'Missing image file')

      // check isImage is boolean
      isImage = chatServices.processBoolean(isImage)
      // check participant exist in the itinerary, if not, permission denied
      const participant = await itineraryServices.getParticipant(itineraryId, userId)
      if (!participant) throw new HttpError(403, 'User not in itinerary, permission denied')

      const storedMessage = await chatServices.processMessage(message, file, itineraryId, isImage)
      if (!storedMessage) throw new HttpError(400, 'Message is image but file not uploaded successfully')

      const chat = await chatServices.postChat(itineraryId, userId, storedMessage, isImage)
      if (!chat) throw new HttpError(500, 'Chat not created successfully')

      const chatData = await chatServices.postChatData(chat, participant, storedMessage)

      res.status(200).json({ status: 'success', data: chatData })
    } catch (error) {
      next(error)
    }
  }
}
module.exports = chatController
