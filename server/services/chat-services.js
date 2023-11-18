const { Chat, User } = require('../models')
// const Sequelize = require('sequelize')
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
  }
}
module.exports = chatServices
