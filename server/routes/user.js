const router = require('express').Router()
const passport = require('../config/passport')
const User = require('../controllers/user-controller')
const { auth } = require('../middleware/auth')
const upload = require('../middleware/multer')
router
  .route('/')
  .put(auth, upload.single('avatar'), User.putUser) // update user info

router
  .route('/signup')
  .post(User.signUp) // create new user

router
  .route('/login')
  .post(passport.authenticate('local', { session: false }), User.login) // login user

router
  .route('/itineraryId')
  .get(auth, User.getParticipatedItineraries) // get user participate itinerary id

router
  .route('/followings')
  .post(auth, User.addFollowing) // add following
  .delete(auth, User.removeFollowing) // remove following
  // .get(auth, User.getFollowings) // get followings

router
  .route('/:userId')
  .get(auth, User.getUser) // get user info by other user id

module.exports = router
