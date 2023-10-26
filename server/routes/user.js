const router = require('express').Router()
const passport = require('../config/passport')
const User = require('../controllers/user-controller')
const { auth } = require('../middleware/auth')
router
  .route('/')
  .get(auth, User.getUser) // get user info by token
//   .post(User.getUser) // get user info by other user id
//   .post(auth, User.updateUser) // update user info

router
  .route('/signup')
  .post(User.signUp) // create new user

router
  .route('/login')
  .post(passport.authenticate('local', { session: false }), User.login) // login user

// router
//   .route('/followings')
//   .get(User.getFollowings) // get followings
//   .post(auth, User.addFollowing) // add following
//   .delete(auth, User.removeFollowing) // remove following
// router
//   .route('/followers')
//   .get(User.getFollowers) // get followers

module.exports = router
