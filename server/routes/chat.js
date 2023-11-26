const router = require('express').Router()
const Chat = require('../controllers/chat-controller')
const { auth } = require('../middleware/auth')

router
  .route('/')
  .post(auth, Chat.postChat)

router
  .route('/:itineraryId')
  .get(auth, Chat.getChats)

module.exports = router
