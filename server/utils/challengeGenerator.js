/**
 * Challenge Generator
 * Generates age-adaptive challenges for Speed Math and other mini-games
 */

const { generateSpeedMathRound } = require('./questionGenerator');

/**
 * Generate a challenge for all players
 * Creates age-appropriate questions for each age tier
 *
 * @param {number} round - Round number (1-15)
 * @param {number} section - Section number (1-5)
 * @param {Array} players - Array of player objects with {id, name, age}
 * @param {string} gameType - Type of game ('speed-math', 'trivia', etc.)
 * @returns {Object} Challenge object with questions for each age tier
 */
function generateChallenge(round, section, players, gameType = 'speed-math') {
  // For now, only Speed Math is implemented
  if (gameType === 'speed-math') {
    const speedMathRound = generateSpeedMathRound(players);

    return {
      id: `challenge-${round}`,
      round,
      section,
      type: 'speed-math',
      gameType: 'speed-math',
      operation: speedMathRound.operation,
      difficulty: speedMathRound.difficulty,
      questions: speedMathRound.questions, // Array of {tier, question, answer, players: [...]}
      answerType: 'number',
      validationOptions: {
        tolerance: 0 // Must be exact
      },
      timeLimit: 60000 // 60 seconds
    };
  }

  // Default fallback (shouldn't reach here)
  return {
    id: `challenge-${round}`,
    round,
    section,
    type: 'unknown',
    gameType: 'unknown',
    questions: [],
    timeLimit: 60000
  };
}

module.exports = { generateChallenge };
