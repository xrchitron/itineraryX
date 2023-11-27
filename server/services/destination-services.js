const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Destination, Place } = require('../models')
const dateMethods = require('../utils/date-methods')
const destinationServices = {
  async createDestination (itineraryId, date, placeId) {
    const destination = await Destination.create({
      itineraryId,
      date,
      placeId
    })
    return destination
  },
  async getDestination (id) {
    const destination = await Destination.findByPk(id, {
      attributes: ['id', 'itineraryId', 'date'],
      include: {
        model: Place,
        attributes: ['id', 'name', 'address', 'rating', 'url', 'lat', 'lng', 'intro', 'image']
      }
    })
    return destination
  },
  async getDestinations (itineraryId, date, order) {
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC'
    const sortKey = 'date'
    const destinations = await Destination.findAll({
      where: {
        itineraryId,
        date: {
          [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`]
        }
      },
      attributes: ['id', 'itineraryId', 'date'],
      order: [[sortKey, sortOrder]],
      include: {
        model: Place,
        attributes: ['id', 'name', 'address', 'rating', 'url', 'lat', 'lng', 'intro', 'image']
      }
    })
    return destinations
  },
  processDestinationTimeFormat (data) {
    const destinationData = data.toJSON()
    destinationData.date = dateMethods.toISOString(destinationData.date)
    return destinationData
  },
  processDestinationsTimeFormat (data) {
    const destinationsData = data.map(destination => {
      const destinationData = destination.toJSON()
      destinationData.date = dateMethods.toISOString(destinationData.date)
      return destinationData
    })
    return destinationsData
  }
}
module.exports = destinationServices
