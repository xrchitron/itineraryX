const router = require('express').Router()
const passport = require('../config/passport')
const User = require('../controllers/user-controller')
const { auth } = require('../middleware/auth')
const upload = require('../middleware/multer')
router
  .route('/')
  .put(auth, upload.single('avatar'), User.putUser)

router
  .route('/forgetPassword')
  .post(User.forgetPassword)
  .patch(User.resetPassword)

router
  .route('/signup')
  .post(User.signUp)

router
  .route('/login')
  .post(passport.authenticate('local', { session: false }), User.login)

router
  .route('/itineraryId')
  .get(auth, User.getParticipatedItineraries) // get user participate itinerary id

router
  .route('/followings')
  .post(auth, User.addFollowing)
  .delete(auth, User.removeFollowing)

router
  .route('/:userId')
  .get(auth, User.getUserWithFollows) // get user info with followings and followers

module.exports = router
