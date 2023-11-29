const { User, Followship, Participant } = require('../models')
const s3 = require('../utils/aws_s3')
const userServices = {
  async createNewUser (name, email, password) {
    const user = await User.create({ name, email, password })
    return user
  },
  async getUserByEmail (email) {
    const user = await User.findOne({ where: { email }, attributes: ['id', 'name', 'avatar'] })
    return user
  },
  async getUserByName (name) {
    const user = await User.findOne({ where: { name } })
    return user
  },
  async getUserWithFollows (id) {
    const user = await User.findByPk(id, {
      include: [
        { model: User, as: 'Followers', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'Followings', attributes: ['id', 'name', 'avatar'] }
      ],
      attributes: ['id', 'name', 'avatar']
    })
    return user
  },
  async getUserById (id) {
    const user = await User.findByPk(id, {
      attributes: ['name', 'email', 'avatar']
    })
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
  async getParticipatedItineraries (userId) {
    const itineraryIds = await Participant.findAll({
      where: { participantId: userId },
      attributes: ['itineraryId'],
      raw: true
    })
    const data = {}
    const itineraryIdData = itineraryIds.map(data => {
      return data.itineraryId
    })
    data.itineraryId = itineraryIdData
    return data
  },
  async addFollowingById (followerId, followingId) {
    const followship = await Followship.create({
      followerId,
      followingId
    })
    return followship
  },
  async deleteFollowship (followship) {
    const deletedFollowship = followship.destroy()
    return deletedFollowship
  },
  async processFollowshipAndS3Avatar (followship) {
    // delete Followship object and get avatar url from s3
    await Promise.all(followship.map(async follow => {
      delete follow.Followship
      if (follow.avatar) {
        follow.avatar = await s3.getImage(follow.avatar)
      }
    }))
  },
  deleteUserPassword (user) {
    user = user.toJSON()
    delete user.password
    return user
  },
  async processAvatarAndFollowship (userData) {
    // get avatar url from s3
    if (userData.avatar) userData.avatar = await s3.getImage(userData.avatar)
    if (userData.Followers.length !== 0) {
      await this.processFollowshipAndS3Avatar(userData.Followers)
    }
    if (userData.Followings.length !== 0) {
      await this.processFollowshipAndS3Avatar(userData.Followings)
    }
    return userData
  },
  async processUserAvatar (user, file) {
    // delete previous avatar from s3 if user upload new avatar
    if (user.avatar && file) await s3.deleteImage(user.avatar)

    let imageName = null // if no file, imageName = null, image will not be updated
    if (file) imageName = await s3.uploadUserAvatar(user.email, file)
    return imageName
  }
}
module.exports = userServices
