const chatServices = require('../services/chat-services')
const s3 = require('../utils/aws_s3')
const chatController = {
  getChat: async (req, res, next) => {
    try {
      const { itineraryId } = req.body
      const chats = await chatServices.getChat(itineraryId)
      chats.forEach(async chat => {
        if (chat.isImage) chat.message = await s3.getImage(chat.message)
      })
      res.status(200).json({ status: 'success', chats })
    } catch (error) {
      next(error)
    }
  },
  postChat: async (req, res, next) => {
    try {
      const { itineraryId, userId, message, isImage } = req.body
      const { file } = req

      let storedMessage
      if (message) storedMessage = message
      if (file && isImage) storedMessage = await s3.uploadChatImage(itineraryId, file)
      if (!storedMessage) throw new Error('Empty message')

      const chat = await chatServices.postChat(itineraryId, userId, message, isImage)
      res.status(200).json({ status: 'success', chat })
    } catch (error) {
      next(error)
    }
  }
}
module.exports = chatController
