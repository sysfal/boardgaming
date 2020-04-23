'use strict';

const express = require('express');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

var cookie = require("cookie");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookieAgeMinutes = 5;
const cookieAge = 1000*60*cookieAgeMinutes;

// set a cookie
app.use(function (req, res, next) {
  // check if client sent cookie
  var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {
    // no: set a new cookie
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('cookieName',randomNumber, { maxAge: 1000*60*5, httpOnly: true });
    console.log('cookie created successfully');
  }
  else
  {
    // yes, cookie was already present
    console.log('cookie exists', cookie);
  }
  next(); // <-- important!
});

// let static middleware do its job
//app.use(express.static('public'));
app.use(express.static('app/dist/boardgaming'));

app.get('/', (req, res) => {
  res.sendFile('index.html')
});

app.get('/admin', (req, res) => {
  res.send(JSON.stringify(users, null, 2))
});

var sockets = [];
var users = {};
var activeUsers = [];

// "cookie":"_ga=GA1.1.65395368.1549033143; Webstorm-c69dafab=ad1271fe-88a9-48d2-9b8a-21c78c13251d; io=cucagJywlOOyq0gVAAAB"
// "cookie":"_ga=GA1.1.65395368.1549033143; Webstorm-c69dafab=ad1271fe-88a9-48d2-9b8a-21c78c13251d; io=zrV2iQ9K8MYqIM7oAAAA"

/*io.use(function (socket, next) {
  var cookies = cookie.parse(socket.request.headers.cookie);
  //console.log('check handshake %s', JSON.stringify(socket.handshake, null, 2));
  //console.log('check headers %s', JSON.stringify(socket.request.headers));
  //console.log('check socket.id %s', JSON.stringify(socket.id));
  console.log('cookies', cookies);
  next();
});*/

io.on('connection', (socket) => {
  var userid = null;
  var cookies = cookie.parse(socket.request.headers.cookie);
  if (cookies.cookieName) {
    console.log('cookie found', cookies.cookieName);
    userid = cookies.cookieName;
    if (users[userid]) {
      console.log('hello %s!', users[userid]);
      //io.to(socket.id).emit('state', { state: 1, info: { name: users[userid] }});
      //io.to(socket.id).emit('chat message', 'Hello ' + users[userid]);
      //io.to(socket.id).emit('chat message', 'You are logged in for ' + cookieAgeMinutes + ' minutes');
      //io.emit('chat message', users[userid] + ' is ' + socket.id);
      activeUsers.push({name: users[userid], socketId: socket.id});
      io.emit('state', { state: 1, info: { users: activeUsers }});
    } else {
      //io.emit('chat message', 'I don\'t know you, pls enter name');
      io.to(socket.id).emit('state', { state: 0, info: {}});
      activeUsers.push({name: 'unknown', socketId: socket.id});
    }
  } else {
    console.log('no cookie!', cookies);
  }

  let msg = 'a user connected ' + socket.id;
  console.log(msg);
  io.emit('chat message', msg);

  sockets.push(socket);

  socket.on('chat message', (msg) => {  // listen to the event
    console.log('chat message', msg);
  });

  socket.on('join', (msg) => {  // listen to the event
    console.log('join', msg);
    //io.emit('chat message', msg);  // emit an event to all connected sockets
    users[userid] = msg;

    const index = activeUsers.findIndex((e => e.socketId == socket.id));
    activeUsers[index].name = msg;

    io.to(socket.id).emit('chat message', 'Hello ' + users[userid]);
    io.emit('state', { state: 1, info: { users: activeUsers }});
  });

  socket.on('disconnect', function(){
    var user = 'unknown';
    if (users[userid]) {
      user = users[userid];
    }
    let msg = user + ' disconnected';
    console.log(msg);
    io.emit('chat message', msg);

    activeUsers = activeUsers.filter(e => e.socketId !== socket.id);
    io.emit('state', { state: 1, info: { users: activeUsers }});
  });
});

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
