const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { Place, Route, Destination } = require('../models')

const routeServices = {
  async getRoute (itineraryId, originId, destinationId) {
    const route = await Route.findOne({
      where: { itineraryId, originId, destinationId }
    })
    return route
  },
  async createRoute (itineraryId, date, originId, destinationId, transportationMode, elements) {
    const foundRoute = await Route.findOne({ where: { originId, destinationId, transportationMode } })
    if (foundRoute) {
      // check if date is the same or not
      if (foundRoute.date === date) return foundRoute
      // if date is different, update date
      const updatedRoute = await foundRoute.update({ date })
      return updatedRoute
    } else {
      const newRoute = await Route.create({
        itineraryId,
        date,
        originId,
        destinationId,
        transportationMode,
        distanceText: elements.distance.text,
        distanceValue: elements.distance.value,
        durationText: elements.duration.text,
        durationValue: elements.duration.value
      })
      return newRoute
    }
  },
  async getRouteById (routeId) {
    const route = await Route.findByPk(routeId)
    return route
  },
  async updateRoute (routeId, transportationMode, elements) {
    const route = await Route.findByPk(routeId)
    const updatedRoute = await route.update({
      transportationMode,
      distanceText: elements.distance.text,
      distanceValue: elements.distance.value,
      durationText: elements.duration.text,
      durationValue: elements.duration.value
    })
    return updatedRoute
  },
  async getRoutesLatLng (itineraryId, startDate, endDate) {
    const routeData = await Destination.findAll({
      where: {
        itineraryId,
        date: {
          [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
        }
      },
      attributes: ['placeId', 'date'],
      order: [['date', 'ASC']],
      include: [
        { model: Place, attributes: ['lat', 'lng'] }
      ],
      raw: true
    })

    const routeGroupByDate = this.routeGroupByDate(routeData)
    return routeGroupByDate
  },
  routeGroupByDate (routeData) {
    const routeDataGroupByDate = routeData.reduce((acc, cur) => {
      const date = cur.date.toISOString().split('T')[0]
      const curData = {}
      if (!acc[date]) acc[date] = []
      curData.lat = Number(cur['Place.lat'])
      curData.lng = Number(cur['Place.lng'])
      acc[date].push(curData)
      return acc
    }
    , {})
    return routeDataGroupByDate
  },
  async getRoutes (itineraryId, startDate, endDate) {
    const routes = await Route.findAll({
      where: {
        itineraryId,
        date: {
          [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
        }
      },
      attributes: ['id', 'date', 'transportationMode', 'distanceText', 'durationText', 'originId', 'destinationId'],
      order: [['date', 'ASC']],
      raw: true
    })
    const routesGroupByDate = this.routesGroupByDate(routes)
    return routesGroupByDate
  },
  routesGroupByDate (routes) {
    const routesGroupByDate = routes.reduce((acc, cur) => {
      const date = cur.date.toISOString().split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(cur)
      delete cur.date
      cur.routeId = cur.id
      delete cur.id
      return acc
    }
    , {})
    return routesGroupByDate
  }
}
module.exports = routeServices
