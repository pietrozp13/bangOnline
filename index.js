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

var allCards = require('./cards')

var allPlayers = []

var allCardsPlayers = {}

var cardsPlay

const allGamePlayers = {
    "players4": [1,7,7,9],
    "players5": [1,2,7,7,9],
    "players6": [1,2,7,7,7,9],
    "players7": [1,2,2,7,7,7,9]
}


const getCharacters = () => {
      let arr = allGamePlayers["players" + allPlayers.length]
      arr.sort(() => Math.random() - 0.5);
      return arr
}

io.on('connection', function(socket){

    socket.on('sendReadyStart', ({id, name}) => {
        const publicData = {
            name: name,
            id: id,
            alive: true,
            charatersType: null,
            tableCards: [],
            lifes: null,
        }

        allPlayers.push(publicData)
    });


    socket.on('sendReadyStartMaster', () => {
        const ramdomCharaters = getCharacters()
        let cards = allCards.sort(() => Math.random() - 0.5);

        console.log(allPlayers)
        allPlayers = allPlayers.map((element, index) => {
            io.sockets.sockets[element.id].emit("user charater", ramdomCharaters[index])
            return {
                ...element,
                id: element.id,
                lifes: ramdomCharaters[index] === 1 ? 5 : 4
            }
        });

        allPlayers.map((element, index) => {
            let myCards = []
            const cardsQuant = element.characterType === 1 ? 5 : 4

            for(let i = 0; i < cardsQuant; i++){
                myCards.push(cards[0])
                cards.shift()
            }

            allCardsPlayers = {
                ...allCardsPlayers,
                [element.name]: myCards
            }
            io.sockets.sockets[element.id].emit("user cards", myCards)
        });

        cardsPlay = cards


        // start Game
        io.emit('AllGameData', allPlayers);
    });


    socket.on('debug', () => {
        io.emit('debugC', {
            allPlayers,
            allCardsPlayers,
            cardsPlay
        });
    });

    socket.on('startGame', function(msg){
        console.log("msg recebida", msg)
        io.emit('message', msg);
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
        var allPlayers = []

        var allCardsPlayers = {}

        var cardsPlay
  });
});

http.listen(5099, function(){
  console.log('listening on *:5099');
});