'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Notification.belongsTo(models.User, { foreignKey: 'receiverId', as: 'Receiver' })
      Notification.belongsTo(models.User, { foreignKey: 'senderId', as: 'Sender' })
    }
  }
  Notification.init({
    receiverId: DataTypes.INTEGER,
    senderId: DataTypes.INTEGER,
    message: DataTypes.STRING,
    isRead: DataTypes.BOOLEAN,
    redirectUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    underscored: true
  })
  return Notification
}
