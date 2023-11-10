'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Route.belongsTo(models.Itinerary, { foreignKey: 'itineraryId' })
      Route.belongsTo(models.Place, { foreignKey: 'originId', as: 'Origin' })
      Route.belongsTo(models.Place, { foreignKey: 'destinationId', as: 'Destination' })
    }
  }
  Route.init({
    itineraryId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    originId: DataTypes.INTEGER,
    destinationId: DataTypes.INTEGER,
    distanceText: DataTypes.STRING,
    distanceValue: DataTypes.INTEGER,
    durationText: DataTypes.STRING,
    durationValue: DataTypes.INTEGER,
    color: DataTypes.STRING,
    transportationMode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Route',
    tableName: 'Routes',
    underscored: true
  })
  return Route
}
