const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const FlowCoordinator = require('./utils/flowCoordinator');
const { GameState } = require('./utils/storyData');
const { gradeSubmissions, calculateSectionStars } = require('./utils/answerValidator');
const { generateChallenge } = require('./utils/challengeGenerator');

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

// Generate and broadcast challenge when entering CHALLENGE_ACTIVE state
function handleChallengeActive(roomCode, io) {
  const game = games.get(roomCode);
  const flowCoordinator = flowCoordinators.get(roomCode);

  if (!game || !flowCoordinator) return;

  // Generate age-adaptive challenge with questions for each tier
  // DEV_GAME_TYPE: Set at top of file for testing, or null for random
  const challenge = generateChallenge(
    flowCoordinator.currentRound,
    flowCoordinator.currentSection,
    game.players, // Pass players array for age-adaptive questions
    DEV_GAME_TYPE  // null = random, or specify: 'speed-math', 'true-false', 'trivia', 'spelling'
  );

  game.currentChallenge = challenge;

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
  const challenge = game.currentChallenge;

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
