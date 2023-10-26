'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Followships', [{
      follower_id: 1,
      following_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 1,
      following_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 1,
      following_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 1,
      following_id: 5,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 2,
      following_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 2,
      following_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 2,
      following_id: 4,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 2,
      following_id: 5,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      follower_id: 3,
      following_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
}
