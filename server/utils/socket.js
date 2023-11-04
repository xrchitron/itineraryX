const { Server } = require('socket.io')

async function connect (server) {
  const io = new Server(server)
  io.on('connection', socket => {
    console.log('User connected')
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
