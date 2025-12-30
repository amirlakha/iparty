const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const FlowCoordinator = require('./utils/flowCoordinator');
const { GameState } = require('./utils/storyData');
const { gradeSubmissions, calculateSectionStars } = require('./utils/answerValidator');
const { generateChallenge } = require('./utils/challengeGenerator');
const {
  placePiece,
  checkWin,
  isBoardFull,
  getNextPlayer,
  getRandomValidColumn
} = require('./utils/connect4Logic');

const {
  processDirection: processSnakeDirection,
  gameTick: snakeGameTick,
  calculatePlacements: calculateSnakePlacements,
  checkStarEarned: checkSnakeStarEarned,
  getGameStateForBroadcast: getSnakeGameStateForBroadcast,
  GAME_DURATION: SNAKE_GAME_DURATION,
  TICK_RATE: SNAKE_TICK_RATE,
} = require('./utils/snakeLogic');

// ============================================================
// DEVELOPMENT FLAG - Set game type for testing via environment variable
// ============================================================
// Usage: GAME_TYPE=true-false node server/index.js
// Options: 'speed-math', 'true-false', 'trivia', 'spelling' (or leave unset for random)
const DEV_GAME_TYPE = process.env.GAME_TYPE || null;
// ============================================================

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

// Connect 4 turn timers
const connect4Timers = new Map();

// Snake game state and tick timers
const snakeGameStates = new Map();
const snakeTickTimers = new Map();

// Schedule auto-move if player doesn't respond in time
function scheduleConnect4TurnTimeout(roomCode, io, turnTimeLimit) {
  // Clear existing timer
  if (connect4Timers.has(roomCode)) {
    clearTimeout(connect4Timers.get(roomCode));
  }

  const timer = setTimeout(() => {
    const game = games.get(roomCode);
    if (!game || !game.currentChallenge || game.currentChallenge.gameType !== 'connect4') return;

    const challenge = game.currentChallenge;
    if (challenge.winner || challenge.isDraw) return;

    console.log(`[${roomCode}] Turn timeout - auto-playing for ${challenge.currentPlayer.playerName}`);

    // Auto-select random valid column
    const col = getRandomValidColumn(challenge.board);
    handleConnect4Move(roomCode, io, challenge.currentPlayer.playerId, col, true);
  }, turnTimeLimit);

  connect4Timers.set(roomCode, timer);
}

// Handle Connect 4 move
function handleConnect4Move(roomCode, io, playerId, col, isAutoMove = false) {
  const game = games.get(roomCode);
  if (!game || !game.currentChallenge || game.currentChallenge.gameType !== 'connect4') return;

  const challenge = game.currentChallenge;

  // Check if game already ended
  if (challenge.winner || challenge.isDraw) return;

  // Validate it's this player's turn
  if (challenge.currentPlayer.playerId !== playerId) {
    console.warn(`[${roomCode}] Invalid turn - expected ${challenge.currentPlayer.playerName}, got ${playerId}`);
    return;
  }

  // Place piece
  const result = placePiece(challenge.board, col, challenge.currentPlayer.team);
  if (!result.success) {
    console.warn(`[${roomCode}] Invalid move - column ${col} is full`);
    return;
  }

  // Update board
  challenge.board = result.board;
  challenge.moveCount++;

  console.log(`[${roomCode}] ${challenge.currentPlayer.playerName} (${challenge.currentPlayer.team}) placed at column ${col} ${isAutoMove ? '(AUTO)' : ''}`);

  // Check for win
  const winResult = checkWin(challenge.board, result.row, col);
  if (winResult.winner) {
    challenge.winner = winResult.winner;
    challenge.winningCells = winResult.winningCells;
    console.log(`[${roomCode}] ${winResult.winner.toUpperCase()} TEAM WINS!`);

    // Award points to winning team
    const winningTeam = challenge.teams[winResult.winner];
    winningTeam.forEach(player => {
      if (!game.scores[player.id]) game.scores[player.id] = 0;
      game.scores[player.id] += 30;
      console.log(`  ${player.name}: +30 points (total: ${game.scores[player.id]})`);
    });

    // Broadcast game end
    io.to(roomCode).emit('connect4-update', {
      board: challenge.board,
      currentPlayer: null,
      winner: challenge.winner,
      winningCells: challenge.winningCells,
      teams: challenge.teams,
      scores: game.scores
    });

    // Clear turn timer
    if (connect4Timers.has(roomCode)) {
      clearTimeout(connect4Timers.get(roomCode));
      connect4Timers.delete(roomCode);
    }

    // End challenge after 3 seconds
    setTimeout(() => {
      endConnect4Challenge(roomCode, io);
    }, 3000);

    return;
  }

  // Check for draw
  if (isBoardFull(challenge.board)) {
    challenge.isDraw = true;
    console.log(`[${roomCode}] DRAW - Board full with no winner`);

    // Award draw points to all players
    game.players.forEach(player => {
      if (!game.scores[player.id]) game.scores[player.id] = 0;
      game.scores[player.id] += 10;
      console.log(`  ${player.name}: +10 points (draw) (total: ${game.scores[player.id]})`);
    });

    // Broadcast game end
    io.to(roomCode).emit('connect4-update', {
      board: challenge.board,
      currentPlayer: null,
      winner: null,
      isDraw: true,
      teams: challenge.teams,
      scores: game.scores
    });

    // Clear turn timer
    if (connect4Timers.has(roomCode)) {
      clearTimeout(connect4Timers.get(roomCode));
      connect4Timers.delete(roomCode);
    }

    // End challenge after 3 seconds
    setTimeout(() => {
      endConnect4Challenge(roomCode, io);
    }, 3000);

    return;
  }

  // Get next player
  challenge.currentPlayer = getNextPlayer(challenge.teams, challenge.moveCount);

  // Broadcast updated game state
  io.to(roomCode).emit('connect4-update', {
    board: challenge.board,
    currentPlayer: challenge.currentPlayer,
    winner: null,
    teams: challenge.teams,
    moveCount: challenge.moveCount
  });

  // Schedule timeout for next turn
  scheduleConnect4TurnTimeout(roomCode, io, challenge.turnTimeLimit);
}

// End Connect 4 challenge and advance to results
function endConnect4Challenge(roomCode, io) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);
  if (!game || !flowCoordinator) return;

  console.log(`[${roomCode}] Connect 4 challenge ended - advancing to results`);

  // Mark as completed (1 star - challenge finished)
  flowCoordinator.recordSubmission('connect4-complete', { completed: true });

  // Broadcast scores update
  io.to(roomCode).emit('scores-updated', {
    scores: game.scores,
    reason: 'connect4-complete'
  });

  // Advance to results
  gradeAndAdvance(roomCode, io);
}

// ============================================================
// SNAKE GAME HANDLERS
// ============================================================

// Start snake game and tick loop
function startSnakeGame(roomCode, io, challenge) {
  const game = games.get(roomCode);
  if (!game) return;

  // Store snake game state
  const snakeState = {
    board: challenge.board,
    snakes: challenge.snakes,
    food: challenge.food,
    config: challenge.config,
    startTime: Date.now(),
    gameOver: false,
  };
  snakeGameStates.set(roomCode, snakeState);

  console.log(`[${roomCode}] Snake game started with ${Object.keys(snakeState.snakes).length} players`);

  // Broadcast initial state
  io.to(roomCode).emit('snake-game-start', {
    gameState: getSnakeGameStateForBroadcast(snakeState),
  });

  // Send individual player data (their color)
  Object.values(snakeState.snakes).forEach(snake => {
    io.to(snake.id).emit('snake-player-init', {
      color: snake.color,
      colorName: snake.colorName,
    });
  });

  // Start game tick loop
  const tickInterval = setInterval(() => {
    handleSnakeGameTick(roomCode, io);
  }, SNAKE_TICK_RATE);

  snakeTickTimers.set(roomCode, tickInterval);

  // Schedule game end
  setTimeout(() => {
    endSnakeGame(roomCode, io);
  }, SNAKE_GAME_DURATION);
}

// Handle snake game tick
function handleSnakeGameTick(roomCode, io) {
  const snakeState = snakeGameStates.get(roomCode);
  if (!snakeState || snakeState.gameOver) return;

  // Process game tick
  const { events, gameOver } = snakeGameTick(snakeState);

  // Handle events
  events.forEach(event => {
    switch (event.type) {
      case 'death':
        io.to(roomCode).emit('snake-player-died', {
          playerId: event.playerId,
          cause: event.cause,
          killerId: event.killerId || null,
          respawnAt: event.respawnAt,
        });
        console.log(`[${roomCode}] ${snakeState.snakes[event.playerId]?.name} died (${event.cause})`);
        break;

      case 'respawn':
        io.to(roomCode).emit('snake-player-respawn', {
          playerId: event.playerId,
          position: event.position,
        });
        console.log(`[${roomCode}] ${snakeState.snakes[event.playerId]?.name} respawned`);
        break;

      case 'food-eaten':
        io.to(roomCode).emit('snake-food-eaten', {
          playerId: event.playerId,
          food: event.food,
          points: event.points,
          newScore: event.newScore,
        });
        break;

      case 'game-end':
        endSnakeGame(roomCode, io);
        return;
    }
  });

  // Broadcast game state update
  io.to(roomCode).emit('snake-game-tick', getSnakeGameStateForBroadcast(snakeState));
}

// End snake game and calculate scores
function endSnakeGame(roomCode, io) {
  const snakeState = snakeGameStates.get(roomCode);
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!snakeState || !game || !flowCoordinator) return;
  if (snakeState.gameOver) return; // Already ended

  snakeState.gameOver = true;

  // Clear tick timer
  if (snakeTickTimers.has(roomCode)) {
    clearInterval(snakeTickTimers.get(roomCode));
    snakeTickTimers.delete(roomCode);
  }

  console.log(`[${roomCode}] Snake game ended - calculating scores`);

  // Calculate placements and award points
  const placements = calculateSnakePlacements(snakeState);

  placements.forEach(result => {
    if (!game.scores[result.playerId]) game.scores[result.playerId] = 0;
    game.scores[result.playerId] += result.awardedPoints;
    console.log(`  ${result.name}: ${result.score} snake pts → +${result.awardedPoints} game pts (${getPlacementLabel(result.placement)})`);
  });

  // Check if star earned (any player >= 50 points in snake game)
  const starEarned = checkSnakeStarEarned(snakeState);

  // Broadcast game end
  io.to(roomCode).emit('snake-game-end', {
    placements,
    finalScores: game.scores,
    starEarned,
  });

  // Record as completed for section star calculation
  flowCoordinator.recordSubmission('snake-complete', { completed: true });

  // Add snake result to sectionResults
  game.sectionResults.push({
    roundNumber: flowCoordinator.currentRound,
    isCorrect: starEarned,
    playerId: 'snake-game',
    gameType: 'snake',
  });

  // Broadcast scores update
  io.to(roomCode).emit('scores-updated', {
    scores: game.scores,
    reason: 'snake-complete',
  });

  // Clean up snake state
  snakeGameStates.delete(roomCode);

  // Advance to results after delay
  setTimeout(() => {
    gradeAndAdvance(roomCode, io);
  }, 3000);
}

function getPlacementLabel(placement) {
  if (placement === 1) return '1st';
  if (placement === 2) return '2nd';
  if (placement === 3) return '3rd';
  return `${placement}th`;
}

// Generate and broadcast challenge when entering CHALLENGE_ACTIVE state
function handleChallengeActive(roomCode, io, forcedGameType = null) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!game || !flowCoordinator) return;

  // Determine game type: use forced type or dev override, otherwise let challengeGenerator decide
  // challengeGenerator uses: games 1-4 = quick games, game 5 = big game (connect4/snake)
  const gameType = forcedGameType || DEV_GAME_TYPE || null;

  const roundInSection = ((flowCoordinator.currentRound - 1) % 5) + 1; // 1-5
  console.log(`[${flowCoordinator.roomCode}] Round ${flowCoordinator.currentRound}, Section ${flowCoordinator.currentSection}, Round in section: ${roundInSection}/5`);

  // Generate age-adaptive challenge with determined game type
  const challenge = generateChallenge(
    flowCoordinator.currentRound,
    flowCoordinator.currentSection,
    game.players, // Pass players array for age-adaptive questions
    gameType
  );

  game.currentChallenge = challenge;

  // Handle Connect 4 differently (no individual questions, shared game state)
  if (challenge.gameType === 'connect4') {
    console.log(`[${roomCode}] Generated Connect 4 challenge for round ${flowCoordinator.currentRound}`);
    console.log(`  Red Team: ${challenge.teams.red.map(p => p.name).join(', ')}`);
    console.log(`  Blue Team: ${challenge.teams.blue.map(p => p.name).join(', ')}`);
    console.log(`  First player: ${challenge.currentPlayer.playerName} (${challenge.currentPlayer.team})`);

    // IMPORTANT: Cancel the flowCoordinator's 60s auto-advance timer for Connect 4
    // Connect 4 manages its own game ending logic (win/draw/turn timeouts)
    // Use setTimeout to ensure this runs AFTER flowCoordinator.handleStateEntry sets the timer
    setTimeout(() => {
      if (flowCoordinator.autoAdvanceTimer) {
        clearTimeout(flowCoordinator.autoAdvanceTimer);
        flowCoordinator.autoAdvanceTimer = null;
        console.log(`[${roomCode}] Cancelled auto-advance timer for Connect 4`);
      }
    }, 100); // Small delay to ensure timer exists before we cancel it

    // Broadcast full challenge to coordinator and all players
    io.to(roomCode).emit('challenge-started', {
      challenge,
      round: flowCoordinator.currentRound,
      section: flowCoordinator.currentSection
    });

    // Start turn timer for first player
    scheduleConnect4TurnTimeout(roomCode, io, challenge.turnTimeLimit);
    return;
  }

  // Handle Snake differently (real-time multiplayer game)
  if (challenge.gameType === 'snake') {
    console.log(`[${roomCode}] Generated Snake challenge for round ${flowCoordinator.currentRound}`);
    console.log(`  Players: ${Object.values(challenge.snakes).map(s => `${s.name} (${s.colorName})`).join(', ')}`);

    // Cancel the flowCoordinator's auto-advance timer - Snake manages its own timing
    setTimeout(() => {
      if (flowCoordinator.autoAdvanceTimer) {
        clearTimeout(flowCoordinator.autoAdvanceTimer);
        flowCoordinator.autoAdvanceTimer = null;
        console.log(`[${roomCode}] Cancelled auto-advance timer for Snake`);
      }
    }, 100);

    // Debug: Check who's in the room
    const room = io.sockets.adapter.rooms.get(roomCode);
    console.log(`[${roomCode}] Sockets in room:`, room ? Array.from(room) : 'none');

    // Broadcast game-state-update to all in room
    console.log(`[${roomCode}] Emitting game-state-update CHALLENGE_ACTIVE to room`);
    io.to(roomCode).emit('game-state-update', {
      state: GameState.CHALLENGE_ACTIVE,
      round: flowCoordinator.currentRound,
      section: flowCoordinator.currentSection
    });

    // Broadcast challenge to coordinator and players
    console.log(`[${roomCode}] Emitting challenge-started to room`);
    io.to(roomCode).emit('challenge-started', {
      challenge,
      round: flowCoordinator.currentRound,
      section: flowCoordinator.currentSection
    });

    // Start the snake game
    startSnakeGame(roomCode, io, challenge);
    return;
  }

  console.log(`[${roomCode}] Generated ${challenge.gameType} challenge for round ${flowCoordinator.currentRound} with ${challenge.questions.length} age tiers`);

  // Broadcast full challenge to coordinator (TV shows all questions grouped by tier)
  io.to(game.coordinator).emit('challenge-started', {
    challenge,
    round: flowCoordinator.currentRound,
    section: flowCoordinator.currentSection
  });

  // Send individual questions to each player (phone shows their specific question only)
  challenge.questions.forEach(tierData => {
    tierData.players.forEach(player => {
      const challengeDataForPlayer = {
        challengeId: challenge.id,
        round: flowCoordinator.currentRound,
        section: flowCoordinator.currentSection,
        question: tierData.question,
        answer: tierData.answer, // Include for client validation if needed (will validate on server too)
        gameType: challenge.gameType, // IMPORTANT: Needed for player to identify game type
        operation: challenge.operation, // For speed-math
        difficulty: challenge.difficulty, // For speed-math
        options: tierData.options, // For trivia
        hint: tierData.hint, // For spelling
        timeLimit: challenge.timeLimit
      };

      // For spelling bee: include phases and all questions (for audio pronunciation)
      if (challenge.gameType === 'spelling' && challenge.phases) {
        challengeDataForPlayer.phases = challenge.phases;
        challengeDataForPlayer.allQuestions = challenge.questions; // All tier words for sequential pronunciation
      }

      io.to(player.id).emit('challenge-data', challengeDataForPlayer);
    });
  });
}

// Handle section completion - calculate stars and determine if retry needed
function handleSectionComplete(roomCode, io) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!game || !flowCoordinator) return;

  const numPlayers = game.players.length;
  const sectionId = flowCoordinator.currentSection;

  // Calculate stars for this section
  const starResult = calculateSectionStars(game.sectionResults, numPlayers);

  // Store stars for this section
  game.sectionStars[sectionId] = starResult;

  console.log(`[${roomCode}] Section ${sectionId} complete: ${starResult.stars} stars - Questions: ${starResult.questionsCorrect.join(', ')}`);

  // Apply bonus or penalty based on stars
  if (starResult.passed) {
    // PASSED: +30 bonus to everyone
    console.log(`[${roomCode}] Section ${sectionId} PASSED - awarding +30 bonus to all players`);
    game.players.forEach(player => {
      const oldScore = game.scores[player.id] || 0;
      game.scores[player.id] = oldScore + 30;
      console.log(`[${roomCode}] ${player.name}: ${oldScore} → ${game.scores[player.id]} (+30 bonus)`);
    });
  } else {
    // FAILED: Remove all section points from all players
    console.log(`[${roomCode}] Section ${sectionId} FAILED - removing section points from all players`);
    game.players.forEach(player => {
      const sectionPointsEarned = game.sectionPoints[player.id]?.[sectionId] || 0;
      game.scores[player.id] = (game.scores[player.id] || 0) - sectionPointsEarned;
      console.log(`[${roomCode}] Removed ${sectionPointsEarned} points from ${player.name}`);
    });
  }

  // Broadcast section results with stars AND updated scores
  io.to(roomCode).emit('section-stars', {
    sectionId,
    stars: starResult.stars,
    passed: starResult.passed,
    questionsCorrect: starResult.questionsCorrect,
    scores: game.scores // Send updated scores with bonus/penalty applied
  });

  // Also broadcast score update separately to ensure UI updates
  io.to(roomCode).emit('scores-updated', {
    scores: game.scores,
    reason: starResult.passed ? 'section-bonus' : 'section-penalty'
  });

  // If section failed (< 5 stars), schedule retry
  if (!starResult.passed) {
    console.log(`[${roomCode}] Section ${sectionId} FAILED - scheduling retry`);

    // Wait for section complete screen to show, then retry
    setTimeout(() => {
      retrySection(roomCode, io, sectionId);
    }, 5000); // Match timing.sectionSuccess
  }
  // Otherwise, flow coordinator will auto-advance to MAP_TRANSITION or VICTORY
}

// Retry a section (reset to first challenge of that section)
function retrySection(roomCode, io) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!game || !flowCoordinator) return;

  const sectionId = flowCoordinator.currentSection;

  console.log(`[${roomCode}] Retrying section ${sectionId}`);

  // Clear section results and reset section points for retry
  game.sectionResults = [];

  // Reset section points to 0 for this section (they'll earn them again)
  game.players.forEach(player => {
    if (game.sectionPoints[player.id]) {
      game.sectionPoints[player.id][sectionId] = 0;
    }
  });

  // Calculate first round of this section
  const firstRound = (sectionId - 1) * 5 + 1;

  // Reset to first round of section
  flowCoordinator.currentRound = firstRound - 1; // Will be incremented by nextRound

  // Clear auto-advance timer (we're manually controlling flow here)
  flowCoordinator.clearAutoAdvance();

  // Broadcast retry notification
  io.to(roomCode).emit('section-retry', {
    sectionId,
    message: 'Let\'s try that section again!'
  });

  // Transition to section intro
  flowCoordinator.nextRound(io);
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
      scores: {},           // Total scores per player
      sectionPoints: {},    // Points earned per player per section: { playerId: { 1: 80, 2: 120, ... } }
      playerAges: {},
      currentChallenge: null,
      submissions: [],
      sectionResults: [],   // Track results for current section (up to 3 challenges)
      sectionStars: {}      // Track stars earned per section
    };

    games.set(roomCode, game);

    // Create flow coordinator for this game with state change callback
    const flowCoordinator = new FlowCoordinator(roomCode, (roomCode, newState, io) => {
      const game = games.get(roomCode);
      if (!game) return;

      // Generate challenge when entering CHALLENGE_ACTIVE state
      if (newState === GameState.CHALLENGE_ACTIVE) {
        handleChallengeActive(roomCode, io);
      }

      // Clear section results when starting a new section
      if (newState === GameState.SECTION_INTRO) {
        game.sectionResults = [];
        console.log(`[${roomCode}] Starting new section ${flowCoordinator.currentSection}, cleared results`);
      }

      // Calculate stars when section completes
      if (newState === GameState.SECTION_COMPLETE) {
        handleSectionComplete(roomCode, io);
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
    game.sectionPoints[socket.id] = {}; // Initialize section points tracking
    game.playerAges[socket.id] = player.age;

    socket.join(roomCode);
    socket.emit('joined-game', { player, game });

    // Notify all players in room
    io.to(roomCode).emit('player-joined', { player, players: game.players });
    console.log(`Player ${playerName} (age ${player.age}) joined game ${roomCode}`);
  });

  // ============================================================
  // PREVIEW/TEST MODE HANDLERS
  // ============================================================

  // Create a preview game room for testing specific game types
  socket.on('create-preview-game', ({ gameType }) => {
    const roomCode = 'TEST' + Math.random().toString(36).substr(2, 2).toUpperCase();

    const game = {
      roomCode,
      coordinator: socket.id,
      players: [],
      scores: {},
      sectionPoints: {},
      playerAges: {},
      gameState: 'LOBBY',
      sectionResults: [],
      currentChallenge: null,
      isPreviewMode: true,
      previewGameType: gameType
    };

    games.set(roomCode, game);

    // Create flow coordinator but we won't use its normal flow
    const flowCoordinator = new FlowCoordinator(roomCode, game);
    flowCoordinators.set(roomCode, flowCoordinator);

    socket.join(roomCode);
    socket.emit('preview-game-created', { roomCode, gameType });

    console.log(`[Preview] Created test room ${roomCode} for game type: ${gameType}`);
  });

  // Start preview game - immediately jumps to the specified game type
  socket.on('start-preview-game', ({ roomCode, gameType }) => {
    const game = games.get(roomCode);
    const flowCoordinator = flowCoordinators.get(roomCode);

    if (!game || !flowCoordinator) {
      socket.emit('error', { message: 'Preview game not found' });
      return;
    }

    if (!game.isPreviewMode) {
      socket.emit('error', { message: 'Not a preview game' });
      return;
    }

    if (game.players.length === 0) {
      socket.emit('error', { message: 'Need at least 1 player' });
      return;
    }

    console.log(`[Preview] Starting ${gameType} with ${game.players.length} players in room ${roomCode}`);

    // Calculate median age
    const ages = game.players.map(p => p.age).sort((a, b) => a - b);
    game.medianAge = ages[Math.floor(ages.length / 2)] || 12;

    // IMPORTANT: Emit game-started so players in Lobby navigate to /play
    io.to(roomCode).emit('game-started', {
      game,
      medianAge: game.medianAge,
      totalPlayers: game.players.length
    });

    // Small delay to let players navigate to /play before sending challenge
    setTimeout(() => {
      // Set state to challenge active
      game.gameState = GameState.CHALLENGE_ACTIVE;
      flowCoordinator.currentState = GameState.CHALLENGE_ACTIVE;
      flowCoordinator.currentRound = 1;
      flowCoordinator.currentSection = 1;

      // Broadcast state update
      io.to(roomCode).emit('game-state-update', {
        state: GameState.CHALLENGE_ACTIVE,
        round: 1,
        section: 1
      });

      // Generate and start the challenge directly
      handleChallengeActive(roomCode, io, gameType);
    }, 500);
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

  // Relay spelling bee phase changes from coordinator to all players
  socket.on('spelling-phase-change', ({ roomCode, phase, duration }) => {
    const game = games.get(roomCode);
    if (!game) return;

    console.log(`[${roomCode}] Relaying spelling phase: ${phase}${duration ? ` (${duration}s)` : ''}`);

    // Broadcast to all players in the room
    io.to(roomCode).emit('spelling-phase-change', { phase, duration });
  });

  // Handle Connect 4 move
  socket.on('connect4-move', ({ roomCode, column }) => {
    handleConnect4Move(roomCode, io, socket.id, column, false);
  });

  // Handle Snake direction input
  socket.on('snake-direction', ({ roomCode, direction }) => {
    const snakeState = snakeGameStates.get(roomCode);
    if (!snakeState || snakeState.gameOver) return;

    const accepted = processSnakeDirection(snakeState, socket.id, direction);
    if (accepted) {
      // Optionally log direction changes (can be noisy)
      // console.log(`[${roomCode}] Snake direction: ${socket.id} → ${direction}`);
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

      // If coordinator disconnects, delete game
      if (game.coordinator === socket.id) {
        io.to(roomCode).emit('coordinator-disconnected');

        // Clean up flow coordinator
        const flowCoordinator = flowCoordinators.get(roomCode);
        if (flowCoordinator) {
          flowCoordinator.destroy();
          flowCoordinators.delete(roomCode);
        }

        // Clean up snake game state
        if (snakeTickTimers.has(roomCode)) {
          clearInterval(snakeTickTimers.get(roomCode));
          snakeTickTimers.delete(roomCode);
        }
        snakeGameStates.delete(roomCode);

        // Clean up connect4 timers
        if (connect4Timers.has(roomCode)) {
          clearTimeout(connect4Timers.get(roomCode));
          connect4Timers.delete(roomCode);
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
  const challenge = game.currentChallenge;

  // Handle Connect 4 specially - no grading needed, scoring already done
  if (challenge.gameType === 'connect4') {
    console.log(`[${roomCode}] Connect 4 complete - skipping grading, advancing to results`);

    // Add Connect 4 result to sectionResults for star calculation
    // Connect 4 always awards 1 star (someone won or drew, challenge completed)
    // Push a result with isCorrect: true to match the expected format
    game.sectionResults.push({
      roundNumber: flowCoordinator.currentRound,
      isCorrect: true, // Always true for Connect 4 (challenge completed)
      playerId: 'connect4-game',
      gameType: 'connect4'
    });

    console.log(`[${roomCode}] Added Connect 4 to section results (round ${flowCoordinator.currentRound})`);

    // Broadcast results (empty results array since there are no individual question results)
    io.to(roomCode).emit('challenge-results', {
      results: [],
      scores: game.scores
    });

    // Transition to results display
    flowCoordinator.transitionTo(io, 'CHALLENGE_RESULTS');
    return;
  }

  // Handle Snake specially - scoring already done in endSnakeGame()
  if (challenge.gameType === 'snake') {
    console.log(`[${roomCode}] Snake complete - skipping grading, advancing to results`);

    // sectionResults already populated in endSnakeGame()

    // Broadcast results (empty results array since there are no individual question results)
    io.to(roomCode).emit('challenge-results', {
      results: [],
      scores: game.scores
    });

    // Transition to results display
    flowCoordinator.transitionTo(io, 'CHALLENGE_RESULTS');
    return;
  }

  // Create a map of playerId -> their correct answer
  const playerAnswers = new Map();
  challenge.questions.forEach(tierData => {
    tierData.players.forEach(player => {
      playerAnswers.set(player.id, {
        correctAnswer: tierData.answer,
        question: tierData.question
      });
    });
  });

  // Grade each submission against their specific question
  const { validateAnswer } = require('./utils/answerValidator');

  const results = submissions.map(sub => {
    const playerData = playerAnswers.get(sub.playerId);
    if (!playerData) {
      console.error(`[${roomCode}] No question found for player ${sub.playerId}`);
      return null;
    }

    // Validate answer using the proper validator based on answer type
    const isCorrect = validateAnswer(
      sub.answer,
      playerData.correctAnswer,
      challenge.answerType,
      challenge.validationOptions || {}
    );

    return {
      playerId: sub.playerId,
      playerName: sub.playerName,
      answer: sub.answer,
      correctAnswer: playerData.correctAnswer,
      question: playerData.question,
      isCorrect,
      timeSpent: sub.timeSpent,
      placement: null, // Will be calculated below
      points: 0 // Will be calculated below
    };
  }).filter(r => r !== null);

  // Calculate placements based on speed (fastest correct answers)
  const { calculatePlacements, calculatePoints } = require('./utils/answerValidator');
  const placements = calculatePlacements(results);

  // Assign placements and calculate points
  results.forEach(result => {
    result.placement = placements.get(result.playerId) || null;
    result.points = calculatePoints(result.isCorrect, result.placement);
  });

  // Store results for section star calculation
  game.sectionResults.push(...results);

  // Update scores and track section points
  const sectionId = flowCoordinator.currentSection;
  results.forEach(result => {
    const playerId = result.playerId;

    // Add to total score
    game.scores[playerId] = (game.scores[playerId] || 0) + result.points;

    // Track section points (for potential rollback)
    if (!game.sectionPoints[playerId]) {
      game.sectionPoints[playerId] = {};
    }
    game.sectionPoints[playerId][sectionId] = (game.sectionPoints[playerId][sectionId] || 0) + result.points;
  });

  console.log(`[${roomCode}] Graded ${results.length} submissions`);

  // Send results to all clients (including each player's specific question and answer)
  io.to(roomCode).emit('challenge-results', {
    results,
    scores: game.scores,
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
  console.log(`🎮 Game Type: ${DEV_GAME_TYPE || 'RANDOM (all 4 games)'}`);
  if (DEV_GAME_TYPE) {
    console.log(`⚠️  DEVELOPMENT MODE: Testing ${DEV_GAME_TYPE} only`);
  }
});
