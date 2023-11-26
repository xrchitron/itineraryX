const { Chat, User } = require('../models')
// const Sequelize = require('sequelize')
const itineraryServices = require('./itinerary-services')
const dateMethods = require('../utils/date-methods')
const s3 = require('../utils/aws_s3')
const chatServices = {
  getChats: async itineraryId => {
    const chats = await Chat.findAll({
      where: { itineraryId },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'message', 'isImage', 'createdAt'],
      include: [{
        model: User,
        as: 'userChat',
        attributes: ['id', 'name', 'avatar']
      }]
    })
    return chats
  },
  postChat: async (itineraryId, userId, message, isImage) => {
    const chat = await Chat.create({ itineraryId, userId, message, isImage })
    return chat
  },
  checkParticipantValidation: async (itineraryId, userId) => {
    const participants = await itineraryServices.getParticipantId(itineraryId)

    // check participant valid or not
    const participantArray = participants.map(participant => {
      return participant.participantId
    })
    const participantValid = participantArray.includes(userId)
    return participantValid
  },
  getChatWithImage: async chats => {
    const chatWithImage = await Promise.all(chats.map(async chat => {
      if (chat.isImage) chat.message = await s3.getImage(chat.message)
      if (chat.userChat.avatar !== null) chat.userChat.avatar = await s3.getImage(chat.userChat.avatar)
      return chat
    }))
    return chatWithImage
  },
  getChatData: chatWithImage => {
    const chatData = chatWithImage.map(chat => {
      const time = dateMethods.toISOString(chat.createdAt)
      return {
        chatId: chat.id,
        userId: chat.userChat.id,
        user: chat.userChat.name,
        avatar: chat.userChat.avatar,
        message: chat.message,
        time
      }
    })
    return chatData
  },
  postChatData: async (chat, participant, storedMessage) => {
    let userAvatar = participant.ParticipantUser.avatar
    const time = dateMethods.toISOString(chat.createdAt)
    // convert image to url
    if (userAvatar) userAvatar = await s3.getImage(userAvatar)
    if (chat.isImage) storedMessage = await s3.getImage(storedMessage)
    const chatData = {
      id: chat.id,
      user: participant.ParticipantUser.name,
      avatar: userAvatar,
      message: storedMessage,
      isImage: chat.isImage,
      time
    }
    return chatData
  },
  processMessage: async (message, file, itineraryId, isImage) => {
    if (!isImage) return message

    const fileName = await s3.uploadChatImage(itineraryId, file)
    return fileName
  },
  processBoolean: boolean => {
    if (boolean === 'true' || boolean === '1' || boolean === 1 || boolean === true) return true
    return false
  }
}
module.exports = chatServices
