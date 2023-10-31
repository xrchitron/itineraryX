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
    }
  }
  Place.init({
    placeId: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    url: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Place',
    tableName: 'Places',
    underscored: true
  })
  return Place
}
