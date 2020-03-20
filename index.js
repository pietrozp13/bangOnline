var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

/*
    1 - cherife
    2 - vice
    7 - bandido
    9 - renegado

    4 players = [1,7,7,9]
    5 players = [1,2,7,7,9]
    6 players = [1,2,7,7,7,9]
    7 players = [1,2,2,7,7,7,9]
*/

var allPlayers = []

var allCards = require('./cards')

const allGamePlayers = {
    "players4": [1,7,7,9],
    "players5": [1,2,7,7,9],
    "players6": [1,2,7,7,7,9],
    "players7": [1,2,2,7,7,7,9]
}

const playerType = {
    id: "abc12345",
    characterType: "1",
    hand: [
        {
            type: "disposable", // disposable or usable
            descripiton: "pistola vulcanic",
            mira: 1 // 1,2,3,4,5, null,
        }
    ]
}


const getCharacters = () => {
      let arr = allGamePlayers["players" + allPlayers.length]
      arr.sort(() => Math.random() - 0.5);
      return arr
}

io.on('connection', function(socket){

    socket.on('sendReadyStart', (id)=>{
        console.log("id user", id)
        allPlayers.push(id)
    });


    socket.on('sendReadyStartMaster', () =>{
        const ramdomCharaters = getCharacters()
        let cards = allCards.sort(() => Math.random() - 0.5);

        console.log(allPlayers)
        allPlayers = allPlayers.map((element, index) => {
            io.sockets.sockets[element.id].emit("user charater", ramdomCharaters[index])
            return {
                id: element.id,
                characterType: ramdomCharaters[index]
            }
        });

        console.log(cards.length,cards.length)

        allPlayers.map((element, index) => {
            let myCards = []
            const cardsQuant = element.characterType === 1 ? 5 : 4

            for(let i = 0; i < cardsQuant; i++){
                myCards.push(cards[0])
                cards.shift()
            }

            console.log(myCards)
            io.sockets.sockets[element.id].emit("user cards", myCards)
        });


        console.log(cards.length,cards.length)
    });


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