const { Chat, User } = require('../models')
const Sequelize = require('sequelize')
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
  getUserChatId: async userId => {
    const userChatId = await Chat.findAll({
      where: { userId },
      attributes: [Sequelize.fn('DISTINCT', Sequelize.col('itinerary_id')), 'itinerary_id'],
      order: [['itineraryId', 'ASC']]
    })
    return userChatId
  },
  postChat: async (itineraryId, userId, message, isImage) => {
    const chat = await Chat.create({ itineraryId, userId, message, isImage })
    return chat
  }
}
module.exports = chatServices
