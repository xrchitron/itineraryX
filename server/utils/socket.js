const { Server } = require('socket.io')
// const events = require('events')
// const eventEmitter = new events.EventEmitter()

async function connect (server) {
  const io = new Server(server, {
    cors: {
      origin: ['https://itinerary-x.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      upgrades: ['websocket'],
      pingInterval: 25000,
      pingTimeout: 20000,
      credentials: true
    }
  })
  io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`)

    socket.on('join_room', data => {
      socket.join(data)
      console.log(socket.id + ' join room ' + data)
    })

    socket.on('send_message', data => {
      socket.nsp.to(data.room).emit('receive_message', data)
      console.log(socket.id + ' send message to ' + data.room)
    })

    socket.on('send_destinations', data => {
      socket.to(data.room).emit('receive_destinations', data)
      console.log(socket.id + ' send destinations to ' + data.room)
    })

    socket.on('send_routes', data => {
      socket.to(data.room).emit('receive_routes', data)
      console.log(socket.id + ' send routes to ' + data.room)
    })

    socket.on('send_notification', data => {
      socket.to(data.room).emit('receive_notification', data)
      console.log(socket.id + ' send notification to ' + data.room)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })
}

module.exports = connect
