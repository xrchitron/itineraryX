const request = require('supertest')
const { describe, it } = require('mocha')
const app = require('../app')
require('dotenv').config()
const url = `/api/${process.env.API_VERSION}/users/login`

describe(`POST ${url}`, function () {
  it('It should response with JWT token', function (done) {
    request(app)
      .post(url)
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
      .end(err => {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  }
  )

  it('It should return 400 if user type in incorrect email', function (done) {
    request(app)
      .post(url)
      .set('Accept', 'application/json')
      .send({
        email: 'usr@example.com',
        password: '12345678'
      })
      .expect(401)
      .expect('Content-Type', /json/)
      .expect(res => {
        if (!res.body.message) throw new Error("Haven't registered yet!")
      })
      .end(err => {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })

  it('It should return 400 if user type in incorrect password', function (done) {
    request(app)
      .post(url)
      .set('Accept', 'application/json')
      .send({
        email: 'user01@example.com',
        password: '123456789'
      })
      .expect(403)
      .expect('Content-Type', /json/)
      .expect(res => {
        if (!res.body.message) throw new Error('Password incorrect!')
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
