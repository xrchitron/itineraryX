const { Server } = require('socket.io')
const events = require('events')
const eventEmitter = new events.EventEmitter()

async function connect (server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://itinerary-x-dev.ap-northeast-1.elasticbeanstalk.com/', 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })
  io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`)
    eventEmitter.on('newRoute', route => {
      socket.emit('newRoute', route)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
    socket.on('chat message', msg => {
      console.log('message: ' + msg)
      io.emit('chat message', msg)
    })
  })
}

module.exports = connect
