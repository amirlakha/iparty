const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game state
const games = new Map();

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create new game
  socket.on('create-game', ({ hostName }) => {
    const roomCode = generateRoomCode();
    const game = {
      roomCode,
      host: socket.id,
      hostName,
      players: [],
      gameState: 'lobby', // lobby, playing, finished
      currentRound: 0,
      rounds: [],
      scores: {},
    };

    games.set(roomCode, game);
    socket.join(roomCode);

    socket.emit('game-created', { roomCode, game });
    console.log(`Game created: ${roomCode}`);
  });

  // Join game
  socket.on('join-game', ({ roomCode, playerName, playerAge }) => {
    const game = games.get(roomCode);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.gameState !== 'lobby') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      age: playerAge,
      team: null,
    };

    game.players.push(player);
    game.scores[socket.id] = 0;

    socket.join(roomCode);
    socket.emit('joined-game', { player, game });

    // Notify all players in room
    io.to(roomCode).emit('player-joined', { player, players: game.players });
    console.log(`Player ${playerName} joined game ${roomCode}`);
  });

  // Assign teams
  socket.on('assign-teams', ({ roomCode, teams }) => {
    const game = games.get(roomCode);
    if (!game || game.host !== socket.id) return;

    // Update player teams
    teams.forEach((team, teamIndex) => {
      team.forEach(playerId => {
        const player = game.players.find(p => p.id === playerId);
        if (player) player.team = teamIndex;
      });
    });

    io.to(roomCode).emit('teams-assigned', { teams, players: game.players });
  });

  // Start game
  socket.on('start-game', ({ roomCode, rounds }) => {
    const game = games.get(roomCode);
    if (!game || game.host !== socket.id) return;

    game.gameState = 'playing';
    game.rounds = rounds;
    game.currentRound = 0;

    io.to(roomCode).emit('game-started', { game });

    // Start first round
    setTimeout(() => {
      io.to(roomCode).emit('round-started', {
        round: rounds[0],
        roundNumber: 0
      });
    }, 3000);
  });

  // Submit answer
  socket.on('submit-answer', ({ roomCode, answer, timeSpent }) => {
    const game = games.get(roomCode);
    if (!game) return;

    const currentRound = game.rounds[game.currentRound];
    if (!currentRound.submissions) currentRound.submissions = [];

    currentRound.submissions.push({
      playerId: socket.id,
      answer,
      timeSpent,
      timestamp: Date.now()
    });

    // Notify host and other players
    io.to(roomCode).emit('answer-submitted', {
      playerId: socket.id,
      totalSubmissions: currentRound.submissions.length
    });
  });

  // Award points
  socket.on('award-points', ({ roomCode, points }) => {
    const game = games.get(roomCode);
    if (!game || game.host !== socket.id) return;

    points.forEach(({ playerId, amount, reason }) => {
      game.scores[playerId] = (game.scores[playerId] || 0) + amount;
    });

    io.to(roomCode).emit('points-awarded', {
      points,
      scores: game.scores
    });
  });

  // Next round
  socket.on('next-round', ({ roomCode }) => {
    const game = games.get(roomCode);
    if (!game || game.host !== socket.id) return;

    game.currentRound++;

    if (game.currentRound >= game.rounds.length) {
      // Game over
      game.gameState = 'finished';
      io.to(roomCode).emit('game-finished', {
        scores: game.scores,
        players: game.players
      });
    } else {
      // Start next round
      setTimeout(() => {
        io.to(roomCode).emit('round-started', {
          round: game.rounds[game.currentRound],
          roundNumber: game.currentRound
        });
      }, 2000);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove player from games
    games.forEach((game, roomCode) => {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        io.to(roomCode).emit('player-left', {
          playerId: socket.id,
          players: game.players
        });
      }

      // If host disconnects, delete game
      if (game.host === socket.id) {
        io.to(roomCode).emit('host-disconnected');
        games.delete(roomCode);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 iParty server running on port ${PORT}`);
  console.log(`📱 Access from phones: http://192.168.68.72:${PORT}`);
});
