'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Itinerary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Itinerary.hasMany(models.Participant, { foreignKey: 'itineraryId' })
      Itinerary.belongsToMany(models.User, {
        through: models.Participant,
        foreignKey: 'itineraryId',
        as: 'ParticipantsUser'
      })
      Itinerary.hasMany(models.Chat, { foreignKey: 'itineraryId' })
    }
  }
  Itinerary.init({
    holderId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Itinerary',
    tableName: 'Itineraries',
    underscored: true
  })
  return Itinerary
}
