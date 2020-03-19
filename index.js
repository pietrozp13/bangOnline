var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var allPlayers = []

io.on('connection', function(socket){
    allPlayers.push(socket.id)

    console.log(allPlayers)

    io.sockets.sockets[allPlayers[0]].emit("message prev", "teste")

    socket.on('message', function(msg){
        console.log("msg recebida", msg)
        io.emit('message', msg);
    });

    socket.on('private message', function(msg){
        console.log("prev msg recebida", msg)
        io.emit('message', msg);
    });

    // ------------
    socket.on('disconnect', function(){
        console.log('Disconnected!!!');
  });
});

http.listen(5099, function(){
  console.log('listening on *:5099');
});