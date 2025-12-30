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

/**
 * Available game types
 * - Quick games (1-4 in each section): speed-math, true-false, trivia, spelling
 * - Big games (5th in each section): connect4, snake
 */
const QUICK_GAMES = ['speed-math', 'true-false', 'trivia', 'spelling'];
const BIG_GAMES = ['connect4', 'snake'];
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
  // Rounds 1-4: cycle through quick games in order (speed-math, true-false, trivia, spelling)
  // Round 5: alternate between big games (odd sections=connect4, even sections=snake)
  if (!gameType) {
    const roundInSection = ((round - 1) % 5) + 1; // 1-5
    if (roundInSection === 5) {
      // 5th game: alternate between big games based on section number
      // Odd sections (1,3,5) = connect4, Even sections (2,4) = snake
      gameType = section % 2 === 1 ? 'connect4' : 'snake';
    } else {
      // Games 1-4: cycle through quick games in order
      gameType = QUICK_GAMES[roundInSection - 1];
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
