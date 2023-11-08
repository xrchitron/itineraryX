'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Itineraries', [
      {
        holder_id: 1,
        title: 'My first itinerary',
        image: 'https://images.unsplash.com/photo-1699116245651-45d3cd9b7de3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        holder_id: 1,
        title: 'My second itinerary',
        image: 'https://images.unsplash.com/photo-1697382803114-0be920c5e160?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Itineraries', {})
  }
}
