'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Distance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  Distance.init({
    itineraryId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    originId: DataTypes.INTEGER,
    destinationId: DataTypes.INTEGER,
    distanceText: DataTypes.STRING,
    distanceValue: DataTypes.INTEGER,
    durationText: DataTypes.STRING,
    durationValue: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Distance',
    tableName: 'Distances',
    underscored: true
  })
  return Distance
}
