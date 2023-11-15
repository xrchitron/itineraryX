const { Server } = require('socket.io')
// const events = require('events')
// const eventEmitter = new events.EventEmitter()

async function connect (server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://itinerary-x-dev.ap-northeast-1.elasticbeanstalk.com/', 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  })
  io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`)

    socket.on('join_room', data => {
      socket.join(data)
    })

    socket.on('send_message', data => {
      socket.nsp.to(data.room).emit('receive_message', data)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

module.exports = connect
