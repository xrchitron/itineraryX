'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Chat.belongsTo(models.Itinerary, {
        foreignKey: 'itineraryId',
        as: 'itineraryChat'
      })
      Chat.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'userChat'
      })
    }
  }
  Chat.init({
    itineraryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    message: DataTypes.STRING,
    isImage: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Chat',
    tableName: 'Chats',
    underscored: true
  })
  return Chat
}
