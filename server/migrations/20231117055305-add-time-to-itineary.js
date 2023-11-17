'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Itineraries', 'start_time', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('Itineraries', 'end_time', {
      type: Sequelize.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Itineraries', 'start_time')
    await queryInterface.removeColumn('Itineraries', 'end_time')
  }
}
