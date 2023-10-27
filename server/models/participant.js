'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  Participant.init({
    itineraryId: DataTypes.INTEGER,
    participantId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Participant',
    tableName: 'Participants',
    underscored: true
  })
  return Participant
}
