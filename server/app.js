require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const { SERVER_PORT, API_VERSION } = process.env

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// api routes
// app.use(`/api/${API_VERSION}`, require('./routes'))
app.get('/api', (req, res) => {
  res.send('Hi')
})
// page not found
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404.html'))
})

const server = app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on port ${SERVER_PORT}`)
})
// try to deploy again
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Server error')
})
module.exports = server
