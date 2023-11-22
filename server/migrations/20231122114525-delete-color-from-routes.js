'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Routes', 'color')
  },

  async down (queryInterface, Sequelize) {

  }
}
