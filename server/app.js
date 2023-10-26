require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const port = process.env.SERVER_PORT || 3000
const { errorHandler } = require('./middleware/error-handler')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// initial route
app.get('/v1/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to itineraryX API' })
})

// api routes
const userRoute = require('./routes/user')
// const itineraryRoute = require('./routes/itineraryRoute')
app.use(`/${process.env.API_VERSION}/users`, userRoute)

// page not found
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Page not found' })
})

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

// Error handling
app.use('/', errorHandler)

module.exports = server
