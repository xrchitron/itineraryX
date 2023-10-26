'use strict'
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{ // add 5 users
      email: 'user01@example.com',
      password: await bcrypt.hash('12345678', 10),
      name: 'user01',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user02@example.com',
      password: await bcrypt.hash('12345678', 10),
      name: 'user02',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user03@example.com',
      password: await bcrypt.hash('12345678', 10),
      name: 'user03',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user04@example.com',
      password: await bcrypt.hash('12345678', 10),
      name: 'user04',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      email: 'user05@example.com',
      password: await bcrypt.hash('12345678', 10),
      name: 'user05',
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
}
