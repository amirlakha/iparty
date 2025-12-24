const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const FlowCoordinator = require('./utils/flowCoordinator');
const { GameState } = require('./utils/storyData');
const { gradeSubmissions } = require('./utils/answerValidator');
const { generateChallenge } = require('./utils/challengeGenerator');

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
const flowCoordinators = new Map();

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate and broadcast challenge when entering CHALLENGE_ACTIVE state
function handleChallengeActive(roomCode, io) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!game || !flowCoordinator) return;

  // Generate new challenge
  const challenge = generateChallenge(
    flowCoordinator.currentRound,
    flowCoordinator.currentSection,
    game.medianAge || 10
  );

  game.currentChallenge = challenge;

  console.log(`[${roomCode}] Generated challenge for round ${flowCoordinator.currentRound}: ${challenge.question}`);

  // Broadcast challenge to all players
  io.to(roomCode).emit('challenge-data', {
    challenge,
    round: flowCoordinator.currentRound,
    section: flowCoordinator.currentSection
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create new game
  socket.on('create-game', ({ coordinatorName }) => {
    const roomCode = generateRoomCode();
    const game = {
      roomCode,
      coordinator: socket.id, // Changed from 'host' to 'coordinator'
      coordinatorName,
      players: [],
      gameState: GameState.LOBBY,
      currentRound: 0,
      currentSection: 0,
      scores: {},
      playerAges: {},
      currentChallenge: null,
      submissions: []
    };

    games.set(roomCode, game);

    // Create flow coordinator for this game with state change callback
    const flowCoordinator = new FlowCoordinator(roomCode, (roomCode, newState, io) => {
      // Generate challenge when entering CHALLENGE_ACTIVE state
      if (newState === GameState.CHALLENGE_ACTIVE) {
        handleChallengeActive(roomCode, io);
      }
    });
    flowCoordinators.set(roomCode, flowCoordinator);

    socket.join(roomCode);

    socket.emit('game-created', { roomCode, game });
    console.log(`Game created: ${roomCode} by ${coordinatorName}`);
  });

  // Join game
  socket.on('join-game', ({ roomCode, playerName, playerAge }) => {
    const game = games.get(roomCode);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.gameState !== GameState.LOBBY) {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      age: playerAge || 10, // Default age if not provided
    };

    game.players.push(player);
    game.scores[socket.id] = 0;
    game.playerAges[socket.id] = player.age;

    socket.join(roomCode);
    socket.emit('joined-game', { player, game });

    // Notify all players in room
    io.to(roomCode).emit('player-joined', { player, players: game.players });
    console.log(`Player ${playerName} (age ${player.age}) joined game ${roomCode}`);
  });

  // Start game (autonomous flow)
  socket.on('start-game', ({ roomCode }) => {
    const game = games.get(roomCode);
    const flowCoordinator = flowCoordinators.get(roomCode);

    if (!game || !flowCoordinator) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.coordinator !== socket.id) {
      socket.emit('error', { message: 'Only coordinator can start game' });
      return;
    }

    if (game.players.length === 0) {
      socket.emit('error', { message: 'No players in game' });
      return;
    }

    console.log(`Starting game ${roomCode} with ${game.players.length} players`);

    // Calculate median player age for difficulty adaptation
    const ages = game.players.map(p => p.age).sort((a, b) => a - b);
    const medianAge = ages[Math.floor(ages.length / 2)];
    game.medianAge = medianAge;

    // Update game state
    game.gameState = GameState.INTRODUCTION;

    // Notify all clients
    io.to(roomCode).emit('game-started', {
      game,
      medianAge,
      totalPlayers: game.players.length
    });

    // Start autonomous flow
    flowCoordinator.startGame(io, game.players.length);
  });

  // Request current game state (for players who join late or reload)
  socket.on('request-game-state', ({ roomCode }) => {
    const game = games.get(roomCode);
    const flowCoordinator = flowCoordinators.get(roomCode);

    if (!game || !flowCoordinator) return;

    console.log(`[${roomCode}] Player ${socket.id} requested game state: ${flowCoordinator.currentState}`);

    // Send current state to requesting player
    socket.emit('game-state-update', {
      state: flowCoordinator.currentState,
      round: flowCoordinator.currentRound,
      section: flowCoordinator.currentSection,
      completedSections: flowCoordinator.completedSections,
      totalRounds: 15,
      totalSections: 5
    });

    // If in challenge, also send current challenge info
    if (flowCoordinator.currentState === GameState.CHALLENGE_ACTIVE && game.currentChallenge) {
      // Player can now participate in current challenge
      console.log(`[${roomCode}] Sent current challenge to late-joining player`);
    }
  });

  // Submit answer (with automatic validation and scoring)
  socket.on('submit-answer', ({ roomCode, answer, timeSpent }) => {
    const game = games.get(roomCode);
    const flowCoordinator = flowCoordinators.get(roomCode);

    if (!game || !flowCoordinator) return;

    if (flowCoordinator.currentState !== GameState.CHALLENGE_ACTIVE) {
      console.warn(`[${roomCode}] Answer submitted in wrong state: ${flowCoordinator.currentState}`);
      return;
    }

    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    // Record submission
    const submission = {
      playerId: socket.id,
      playerName: player.name,
      answer,
      timeSpent: timeSpent || 0,
      timestamp: Date.now()
    };

    const allSubmitted = flowCoordinator.recordSubmission(socket.id, submission);

    console.log(`[${roomCode}] ${player.name} submitted answer (${flowCoordinator.playerSubmissions.size}/${flowCoordinator.totalPlayers})`);

    // Notify all players of submission
    io.to(roomCode).emit('answer-submitted', {
      playerId: socket.id,
      playerName: player.name,
      totalSubmissions: flowCoordinator.playerSubmissions.size,
      totalPlayers: flowCoordinator.totalPlayers
    });

    // If all players submitted, grade answers and advance early
    if (allSubmitted) {
      console.log(`[${roomCode}] All players submitted, grading...`);
      gradeAndAdvance(roomCode, io);
    }
  });

  // Request current challenge (for late joiners or reconnects)
  socket.on('request-current-challenge', ({ roomCode }) => {
    const game = games.get(roomCode);
    if (!game || !game.currentChallenge) return;

    socket.emit('challenge-data', {
      challenge: game.currentChallenge,
      round: game.currentRound
    });
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

      // If coordinator disconnects, delete game
      if (game.coordinator === socket.id) {
        io.to(roomCode).emit('coordinator-disconnected');

        // Clean up flow coordinator
        const flowCoordinator = flowCoordinators.get(roomCode);
        if (flowCoordinator) {
          flowCoordinator.destroy();
          flowCoordinators.delete(roomCode);
        }

        games.delete(roomCode);
        console.log(`Game ${roomCode} deleted - coordinator disconnected`);
      }
    });
  });
});

/**
 * Grade answers and advance to results
 */
function gradeAndAdvance(roomCode, io) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!game || !flowCoordinator || !game.currentChallenge) {
    console.error(`[${roomCode}] Cannot grade - missing game data`);
    return;
  }

  const submissions = flowCoordinator.getSubmissions();

  // Grade all submissions
  const results = gradeSubmissions(submissions, game.currentChallenge);

  // Update scores
  results.forEach(result => {
    game.scores[result.playerId] = (game.scores[result.playerId] || 0) + result.points;
  });

  console.log(`[${roomCode}] Graded ${results.length} submissions`);

  // Send results to all clients
  io.to(roomCode).emit('challenge-results', {
    results,
    scores: game.scores,
    correctAnswer: game.currentChallenge.correctAnswer,
    submissions: submissions.map(s => ({
      playerId: s.playerId,
      playerName: s.playerName,
      answer: s.answer
    }))
  });

  // Transition to results state (this will auto-advance after timing.resultsDisplay)
  flowCoordinator.transitionTo(io, GameState.CHALLENGE_RESULTS);
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 iParty server running on port ${PORT}`);
  console.log(`📱 Access from phones: http://192.168.68.72:${PORT}`);
});
