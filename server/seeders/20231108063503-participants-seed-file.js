'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Participants', [
      {
        itinerary_id: 1,
        participant_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 1,
        participant_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 1,
        participant_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 1,
        participant_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 1,
        participant_id: 5,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 2,
        participant_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 2,
        participant_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 2,
        participant_id: 3,
        created_at: new Date(),
        updated_at: new Date()
      }, {
        itinerary_id: 2,
        participant_id: 5,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Participants', {})
  }
}
