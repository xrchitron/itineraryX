'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Routes', 'date')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Routes', 'date', {
      type: Sequelize.DATE
    })
  }
}
