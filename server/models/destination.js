'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Destination extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Destination.belongsTo(models.Itinerary, { foreignKey: 'itineraryId' })
      Destination.belongsTo(models.Place, { foreignKey: 'placeId' })
    }
  }
  Destination.init({
    itineraryId: DataTypes.INTEGER,
    placeId: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Destination',
    tableName: 'Destinations',
    underscored: true
  })
  return Destination
}
