const { User, Followship } = require('../models')
const userServices = {
  async createNewUser (name, email, password) {
    const user = await User.create({ name, email, password })
    return user
  },
  async getUserByEmail (email) {
    const user = await User.findOne({ where: { email } })
    return user
  },
  async getUserWithFollows (id) {
    const user = await User.findByPk(id, {
      include: [
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
    return user
  },
  async getUserById (id) {
    const user = await User.findByPk(id)
    return user
  },
  async putUserAvatar (id, name, filePath) {
    const user = await User.findByPk(id)
    if (!user) throw new Error("User didn't exist!")
    return user.update({ name, avatar: filePath || user.avatar })
  },
  async getFollowship (followerId, followingId) {
    const followship = await Followship.findOne({
      where: {
        followerId,
        followingId
      }
    })
    return followship
  },
  async addFollowingById (followerId, followingId) {
    const followship = await Followship.create({
      followerId,
      followingId
    })
    return followship
  }
}
module.exports = userServices