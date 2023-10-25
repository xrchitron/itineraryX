const request = require('supertest')
const app = require('../app')
describe('Test the root path', function () {
  it('It should response the GET method', function (done) {
    request(app)
      .get('/api')
      .end(function (err, res) {
        // Here you can add assertions
        done()
      })
  })
})
