const router = require('express').Router()
const Chat = require('../controllers/chat-controller')
const { auth } = require('../middleware/auth')
const upload = require('../middleware/multer')

router
  .route('/')
  .post(auth, upload.single('message'), Chat.postChat)

router
  .route('/:itineraryId')
  .get(auth, Chat.getChats)

module.exports = router
