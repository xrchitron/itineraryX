'use strict'
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    let transaction
    try {
      transaction = await queryInterface.sequelize.transaction()
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash('password', salt)
      await queryInterface.bulkInsert('Users',
        Array.from({ length: 5 }).map((_, i) =>
          ({
            email: `user0${i + 1}@example.com`,
            password: hash,
            name: `user0${i + 1}`,
            created_at: new Date(),
            updated_at: new Date()
          })
        ),
        { transaction }
      )

      await transaction.commit()
    } catch (err) {
      if (transaction) await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
}
