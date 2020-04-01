var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

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

var allCardsAll = require("./cards");

var allCards = allCardsAll.map((card, index) => {
  return {
    ...card,
    id: index
  };
});

var allPlayers = [];

var allCardsPlayers = {};

var cardsPlay;

const allGamePlayers = {
  players4: [1, 7, 7, 9],
  players5: [1, 2, 7, 7, 9],
  players6: [1, 2, 7, 7, 7, 9],
  players7: [1, 2, 2, 7, 7, 7, 9]
};

const getCharacters = () => {
  let arr = allGamePlayers["players" + allPlayers.length];
  arr.sort(() => Math.random() - 0.5);
  return arr;
};

io.on("connection", function(socket) {
  socket.on("sendReadyStart", ({ id, name }) => {
    const publicData = {
      name: name,
      id: id,
      alive: true,
      charatersType: null,
      tableCards: [],
      lifes: null
    };

    allPlayers.push(publicData);
  });

  socket.on("sendReadyStartMaster", () => {
    const ramdomCharaters = getCharacters();
    let firstPlayer;
    let cards = allCards.sort(() => Math.random() - 0.5);

    allPlayers = allPlayers.map((element, index) => {
      io.sockets.sockets[element.id].emit(
        "user charater",
        ramdomCharaters[index]
      );
      if (ramdomCharaters[index] === 1) {
        firstPlayer = element.id;
      }
      return {
        ...element,
        id: element.id,
        lifes: ramdomCharaters[index] === 1 ? 5 : 4
      };
    });

    allPlayers.map((element, index) => {
      let myCards = [];
      const cardsQuant = element.characterType === 1 ? 5 : 4;

      for (let i = 0; i < cardsQuant; i++) {
        myCards.push(cards[0]);
        cards.shift();
      }

      allCardsPlayers = {
        ...allCardsPlayers,
        [element.name]: myCards
      };
      io.sockets.sockets[element.id].emit("user cards", myCards);
    });

    cardsPlay = cards;

    // start Game
    io.emit("AllGameData", allPlayers);

    io.emit("playerTurn", {
      playerID: firstPlayer
    });
  });

  socket.on("debug", () => {
    io.emit("debugC", {
      allPlayers,
      allCardsPlayers,
      cardsPlay
    });
  });

  socket.on("handlePassTurn", ({ playerID }) => {
    let currentIndexPlayer = allPlayers.findIndex(item => item.id === playerID);

    if (currentIndexPlayer === allPlayers.length - 1) {
      currentIndexPlayer = 0;
    } else {
      currentIndexPlayer++;
    }

    io.emit("playerTurn", {
      playerID: allPlayers[currentIndexPlayer].id
    });
  });

  socket.on("Use Cart", data => {
    let fromPlayer;
    let toPlayer;
    allPlayers.forEach(player => {
      if (player.id === data.fromPlayer) {
        fromPlayer = player;
      }
      if (player.id === data.toPlayer) {
        toPlayer = player;
      }
    });

    const oldFromUserCards = allCardsPlayers[fromPlayer.name];

    const newFromUserCards = oldFromUserCards.filter(
      card => card.id !== data.card.id
    );

    allCardsPlayers[fromPlayer.name] = newFromUserCards;

    io.sockets.sockets[fromPlayer.id].emit("user cards", newFromUserCards);

    console.log("card name", data.card);

    io.emit("playerTurnUseCardInfos", {
      type: "useAttack",
      card: data.card,
      fromPlayer: fromPlayer.name,
      toPlayer: toPlayer.name
    });

    io.sockets.sockets[toPlayer.id].emit("reciveAttack", {
      card: data.card,
      fromPlayer: fromPlayer.name,
      toPlayer: toPlayer.name
    });

    // emit
  });

  socket.on("Descart Cart", data => {
    let fromPlayer;
    allPlayers.forEach(player => {
      if (player.id === data.fromPlayer) {
        fromPlayer = player;
      }
    });

    const oldFromUserCards = allCardsPlayers[fromPlayer.name];

    const newFromUserCards = oldFromUserCards.filter(
      card => card.id !== data.card.id
    );

    allCardsPlayers[fromPlayer.name] = newFromUserCards;

    io.sockets.sockets[fromPlayer.id].emit("user cards", newFromUserCards);

    io.emit("playerTurnUseCardInfos", {
      type: "descart",
      card: data.card,
      fromPlayer: fromPlayer.name
    });

    // emit
  });

  /*
-
-
-
--
-
-
-
-
-
--
*/

  socket.on("message", function(msg) {
    console.log("msg recebida", msg);
    io.emit("message", msg);
  });

  socket.on("private message", function(msg) {
    console.log("prev msg recebida", msg);
    io.emit("message", msg);
  });

  // ------------
  socket.on("disconnect", function() {
    console.log("Disconnected!!!");
    var allPlayers = [];

    var allCardsPlayers = {};

    var cardsPlay;
  });
});

http.listen(5099, function() {
  console.log("listening on *:5099");
});
