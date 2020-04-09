'use strict';

const express = require('express');

const app = express();

app.use(express.static('public'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile('index.html')
});

var sockets = [];

io.on('connection', (socket) => {
  let msg = 'a user connected ' + socket.id;
  console.log(msg);

  const message = {
    text: 'a user connected',
    id: socket.id
  };

  io.emit('chat message', message);
  sockets.push(socket);

  socket.on('chat message', (msg) => {  // listen to the event
    console.log('msg', msg);
    io.emit('chat message', msg);  // emit an event to all connected sockets
  });

  socket.on('disconnect', function(){
    let msg = 'a user disconnected ' + socket.id;
    console.log(msg);
    const message = {
      text: 'a user disconnected',
      id: socket.id
    };
    io.emit('chat message', message);
  });
});

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
