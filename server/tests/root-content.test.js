const request = require('supertest')
const { describe, it } = require('mocha')
const app = require('../app')

describe('GET /', function () {
  it('It should response the GET method', function (done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end(err => {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })
})
