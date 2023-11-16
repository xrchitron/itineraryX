const router = require('express').Router()
const Chat = require('../controllers/chat-controller')
const { auth } = require('../middleware/auth')

router
  .route('/')
  .post(auth, Chat.postChat) // create new Chat
  // .put(auth, Chat.putChat) // update Chat info
  // .delete(auth, Chat.deleteChat) // delete Chat info
router
  .route('/:itineraryId')
  .get(auth, Chat.getChats) // get Chats info by token

router
  .route('/user/:userId')
  .get(auth, Chat.getUserChatId) // get Chat image by userId
module.exports = router
