const { Chat, User } = require('../models')
const chatServices = {
  getChat: async itineraryId => {
    const chats = await Chat.findAll({
      where: { itineraryId },
      order: [['createdAt', 'DESC']],
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
