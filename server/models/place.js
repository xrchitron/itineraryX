'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Place extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Place.hasMany(models.Route, { foreignKey: 'originId', as: 'OriginPlace' })
      Place.hasMany(models.Route, { foreignKey: 'destinationId', as: 'DestinationPlace' })
      Place.hasMany(models.Destination, { foreignKey: 'placeId', as: 'Destination' })
    }
  }
  Place.init({
    placeId: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    image: DataTypes.STRING,
    url: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    intro: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Place',
    tableName: 'Places',
    underscored: true
  })
  return Place
}
