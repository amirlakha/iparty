/**
 * Challenge Generator
 * Generates simple test challenges until mini-games are implemented
 */

function generateChallenge(round, section, medianAge) {
  // For now, generate simple math challenges for testing
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;

  return {
    id: `challenge-${round}`,
    round,
    section,
    type: 'number', // Can be: number, text, multiple-choice, true-false, pattern, memory
    question: `What is ${num1} + ${num2}?`,
    correctAnswer: num1 + num2,
    options: null, // For multiple choice
    timeLimit: 60000, // 60 seconds
    points: {
      correct: 100,
      speedMultiplier: 2.0,
      placementBonus: [50, 30, 10] // 1st, 2nd, 3rd place
    }
  };
}

module.exports = { generateChallenge };
