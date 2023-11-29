const request = require('supertest')
const { describe, it, before } = require('mocha')
const app = require('../app')
require('dotenv').config()
const url = `/api/${process.env.API_VERSION}/itineraries/1`
let token = null

before(function (done) {
  request(app)
    .post(`/api/${process.env.API_VERSION}/users/login`)
    .set('Accept', 'application/json')
    .send({
      email: 'user01@example.com',
      password: '12345678'
    })
    .expect(200)
    .expect('Content-Type', /json/)
    .expect(res => {
      if (!res.body.data.token) throw new Error('No token')
    })
    .end((err, res) => {
      if (err) {
        done(err)
      } else {
        token = `Bearer ${res.body.data.token}`
        done()
      }
    })
})

describe(`GET ${url}`, function () {
  it("It shouldn't response without auth", function (done) {
    request(app)
      .get(url)
      .set('authorization', token + 1)
      .expect(401)
      .expect('Content-Type', /json/)
      .expect(res => {
        if (!res.body.message) throw new Error('unauthorized')
      })
      .end(err => {
        if (err) {
          done(err)
        } else {
          console.log('token', token)
          done()
        }
      })
  })

  it('It should response with itinerary data', function (done) {
    request(app)
      .get(url)
      .set('authorization', token)
      .expect(200)
      .expect(res => {
        if (!res.body.data) throw new Error('No data')
      })
      .end(err => {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })
})
