'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Routes', 'transportation_mode', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'driving'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Routes', 'transportation_mode')
  }
}
