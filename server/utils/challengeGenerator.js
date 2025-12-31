/**
 * Challenge Generator
 * Generates age-adaptive challenges for all mini-games
 */

const {
  generateSpeedMathRound,
  generateTrueFalseRound,
  generateTriviaRound,
  generateSpellingRound
} = require('./questionGenerator');

const {
  createBoard,
  assignTeams,
  getNextPlayer
} = require('./connect4Logic');

const {
  initializeGame: initializeSnakeGame,
  GAME_DURATION: SNAKE_GAME_DURATION,
  TICK_RATE: SNAKE_TICK_RATE,
} = require('./snakeLogic');

const {
  initializeGame: initializeMemoryMatchGame,
} = require('./memoryMatchLogic');

const { wordScrambleWords, getRandomQuestion } = require('../data/questionPools');

const gameConfig = require('../config/gameConfig.json');

/**
 * Scramble a word ensuring it's different from the original
 * Uses Fisher-Yates shuffle for better randomization
 */
function scrambleWord(word) {
  const letters = word.toUpperCase().split('');
  let scrambled;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join('');
    attempts++;
  } while (scrambled === word.toUpperCase() && word.length > 1 && attempts < maxAttempts);

  return scrambled;
}

/**
 * Generate word scramble round with per-tier questions
 */
function generateWordScrambleRound(players) {
  // Group players by age tier
  const tiers = {
    young: players.filter(p => (p.age || 10) <= 9),
    middle: players.filter(p => (p.age || 10) >= 10 && (p.age || 10) <= 12),
    teen: players.filter(p => (p.age || 10) >= 13)
  };

  const questions = [];
  const usedWords = [];

  // Generate question for each tier that has players
  Object.entries(tiers).forEach(([tier, tierPlayers]) => {
    if (tierPlayers.length === 0) return;

    const wordData = getRandomQuestion(wordScrambleWords[tier], usedWords);
    usedWords.push(wordData);

    questions.push({
      tier,
      players: tierPlayers.map(p => ({ id: p.id, name: p.name })),
      question: scrambleWord(wordData.word), // The scrambled word is the "question"
      answer: wordData.word.toLowerCase(),
      hint: wordData.hint
    });
  });

  return { questions };
}

/**
 * Get enabled games from config
 */
function getEnabledQuickGames() {
  return Object.entries(gameConfig.quickGames)
    .filter(([_, enabled]) => enabled)
    .map(([id]) => id);
}

function getEnabledLongGames() {
  return Object.entries(gameConfig.longGames)
    .filter(([_, enabled]) => enabled)
    .map(([id]) => id);
}

function getAllEnabledGames() {
  return [...getEnabledQuickGames(), ...getEnabledLongGames()];
}

// Validate config on startup
const enabledGames = getAllEnabledGames();
if (enabledGames.length === 0) {
  throw new Error('At least one game must be enabled in gameConfig.json');
}
console.log(`[Config] Enabled games: ${enabledGames.join(', ')}`);

/**
 * Available game types (all games, regardless of enabled status)
 * - Quick games (1-4 in each section): speed-math, true-false, trivia, spelling
 * - Long games (5th in each section): connect4, snake
 */
const QUICK_GAMES = ['speed-math', 'true-false', 'trivia', 'spelling', 'word-scramble'];
const BIG_GAMES = ['connect4', 'snake', 'memory-match'];
const GAME_TYPES = [...QUICK_GAMES, ...BIG_GAMES];

/**
 * Generate a challenge for all players
 * Creates age-appropriate questions for each age tier
 *
 * @param {number} round - Round number (1-15)
 * @param {number} section - Section number (1-5)
 * @param {Array} players - Array of player objects with {id, name, age}
 * @param {string} gameType - Type of game (if not specified, random)
 * @returns {Object} Challenge object with questions for each age tier
 */
function generateChallenge(round, section, players, gameType = null) {
  // Pick game type based on round position in section if not specified
  // Rounds 1-4: cycle through quick games (from enabled pool)
  // Round 5: cycle through long games (from enabled pool)
  // If a pool is empty, use games from the other pool
  if (!gameType) {
    const enabledQuick = getEnabledQuickGames();
    const enabledLong = getEnabledLongGames();
    const allEnabled = getAllEnabledGames();

    const roundInSection = ((round - 1) % 5) + 1; // 1-5

    if (roundInSection === 5) {
      // 5th game: use long games pool, or fall back to all enabled
      if (enabledLong.length > 0) {
        // Cycle through enabled long games based on section number
        const longIndex = (section - 1) % enabledLong.length;
        gameType = enabledLong[longIndex];
      } else {
        // No long games enabled, use from all enabled games
        const index = (section - 1) % allEnabled.length;
        gameType = allEnabled[index];
      }
    } else {
      // Games 1-4: use quick games pool, or fall back to all enabled
      if (enabledQuick.length > 0) {
        // Cycle through enabled quick games
        const quickIndex = (roundInSection - 1) % enabledQuick.length;
        gameType = enabledQuick[quickIndex];
      } else {
        // No quick games enabled, use from all enabled games
        const index = (roundInSection - 1) % allEnabled.length;
        gameType = allEnabled[index];
      }
    }
  }

  const baseChallenge = {
    id: `challenge-${round}`,
    round,
    section,
    timeLimit: 60000 // 60 seconds
  };

  // Generate challenge based on game type
  switch (gameType) {
    case 'speed-math': {
      const speedMathRound = generateSpeedMathRound(players);
      return {
        ...baseChallenge,
        type: 'speed-math',
        gameType: 'speed-math',
        operation: speedMathRound.operation,
        difficulty: speedMathRound.difficulty,
        questions: speedMathRound.questions,
        answerType: 'number',
        validationOptions: { tolerance: 0 }
      };
    }

    case 'true-false': {
      const trueFalseRound = generateTrueFalseRound(players);
      return {
        ...baseChallenge,
        type: 'true-false',
        gameType: 'true-false',
        questions: trueFalseRound.questions,
        answerType: 'boolean',
        validationOptions: {}
      };
    }

    case 'trivia': {
      const triviaRound = generateTriviaRound(players);
      return {
        ...baseChallenge,
        type: 'trivia',
        gameType: 'trivia',
        questions: triviaRound.questions,
        answerType: 'multiple-choice',
        validationOptions: {}
      };
    }

    case 'spelling': {
      const spellingRound = generateSpellingRound(players);
      return {
        ...baseChallenge,
        type: 'spelling',
        gameType: 'spelling',
        questions: spellingRound.questions,
        phases: spellingRound.phases, // IMPORTANT: Include phases for audio timing
        answerType: 'text',
        validationOptions: {
          caseSensitive: false,
          fuzzyMatch: false
        }
      };
    }

    case 'word-scramble': {
      const wordScrambleRound = generateWordScrambleRound(players);
      return {
        ...baseChallenge,
        type: 'word-scramble',
        gameType: 'word-scramble',
        questions: wordScrambleRound.questions,
        answerType: 'text',
        validationOptions: {
          caseSensitive: false,
          fuzzyMatch: false
        }
      };
    }

    case 'connect4': {
      const teams = assignTeams(players);
      const board = createBoard();
      const firstPlayer = getNextPlayer(teams, 0);

      return {
        ...baseChallenge,
        type: 'connect4',
        gameType: 'connect4',
        timeLimit: 300000, // 5 minutes for full game
        turnTimeLimit: 30000, // 30 seconds per turn
        teams,
        board,
        moveCount: 0,
        currentPlayer: firstPlayer,
        winner: null,
        isDraw: false,
        answerType: 'interactive',
        validationOptions: {}
      };
    }

    case 'snake': {
      const snakeGameState = initializeSnakeGame(players);

      return {
        ...baseChallenge,
        type: 'snake',
        gameType: 'snake',
        timeLimit: SNAKE_GAME_DURATION,
        tickRate: SNAKE_TICK_RATE,
        board: snakeGameState.board,
        snakes: snakeGameState.snakes,
        food: snakeGameState.food,
        config: snakeGameState.config,
        answerType: 'interactive',
        validationOptions: {}
      };
    }

    case 'memory-match': {
      const memoryMatchState = initializeMemoryMatchGame(players);

      return {
        ...baseChallenge,
        type: 'memory-match',
        gameType: 'memory-match',
        timeLimit: 0, // No time limit - game ends when all pairs found
        ...memoryMatchState,
        answerType: 'interactive',
        validationOptions: {}
      };
    }

    default:
      // Fallback to speed math
      const fallbackRound = generateSpeedMathRound(players);
      return {
        ...baseChallenge,
        type: 'speed-math',
        gameType: 'speed-math',
        operation: fallbackRound.operation,
        difficulty: fallbackRound.difficulty,
        questions: fallbackRound.questions,
        answerType: 'number',
        validationOptions: { tolerance: 0 }
      };
  }
}

module.exports = { generateChallenge, GAME_TYPES, QUICK_GAMES, BIG_GAMES };
