const router = require('express').Router()
const Chat = require('../controllers/chat-controller')
const { auth } = require('../middleware/auth')

router
  .route('/')
  .get(auth, Chat.getChat) // get Chat info by token
  .post(auth, Chat.postChat) // create new Chat
  // .put(auth, Chat.putChat) // update Chat info
  // .delete(auth, Chat.deleteChat) // delete Chat info
module.exports = router
