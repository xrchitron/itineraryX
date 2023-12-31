require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const cors = require('cors')
const path = require('path')
const port = process.env.SERVER_PORT || 3001
const { errorHandler } = require('./middleware/error-handler')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// initial route
app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'public', 'welcome.html'))
})

// api routes
const userRoute = require('./routes/user')
const itineraryRoute = require('./routes/itinerary')
const destinationRoute = require('./routes/destination')
const mapRoute = require('./routes/map')
const routeRoute = require('./routes/route')
const chatRoute = require('./routes/chat')

app.use(`/api/${process.env.API_VERSION}/users`, userRoute)
app.use(`/api/${process.env.API_VERSION}/itineraries`, itineraryRoute)
app.use(`/api/${process.env.API_VERSION}/destinations`, destinationRoute)
app.use(`/api/${process.env.API_VERSION}/maps`, mapRoute)
app.use(`/api/${process.env.API_VERSION}/routes`, routeRoute)
app.use(`/api/${process.env.API_VERSION}/chats`, chatRoute)

// page not found
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' })
})

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

require('./utils/socket')(server)

// Error handling
app.use('/', errorHandler)

module.exports = server
