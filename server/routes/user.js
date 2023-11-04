const router = require('express').Router()
const passport = require('../config/passport')
const User = require('../controllers/user-controller')
const { auth } = require('../middleware/auth')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
router
  .route('/')
  .get(auth, User.getUser) // get user info by token
  .put(auth, upload.single('avatar'), User.putUser) // update user info
//   .post(User.getUser) // get user info by other user id

router
  .route('/signup')
  .post(User.signUp) // create new user

router
  .route('/login')
  .post(passport.authenticate('local', { session: false }), User.login) // login user

router
  .route('/followings')
  .post(auth, User.addFollowing) // add following
  .delete(auth, User.removeFollowing) // remove following
// .get(auth, User.getFollowings) // get followings

module.exports = router
