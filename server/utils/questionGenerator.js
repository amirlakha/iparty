/**
 * Question Generator - Age-Adaptive Math Questions
 * Generates questions with relative difficulty parity across age groups
 */

/**
 * Age tier definitions
 */
const AGE_TIERS = {
  YOUNG: { min: 7, max: 9, label: 'young' },
  MIDDLE: { min: 10, max: 12, label: 'middle' },
  TEEN: { min: 13, max: 17, label: 'teen' }
};

/**
 * Get age tier for a player
 */
function getAgeTier(age) {
  if (age >= AGE_TIERS.YOUNG.min && age <= AGE_TIERS.YOUNG.max) {
    return AGE_TIERS.YOUNG.label;
  }
  if (age >= AGE_TIERS.MIDDLE.min && age <= AGE_TIERS.MIDDLE.max) {
    return AGE_TIERS.MIDDLE.label;
  }
  if (age >= AGE_TIERS.TEEN.min && age <= AGE_TIERS.TEEN.max) {
    return AGE_TIERS.TEEN.label;
  }
  // Default to middle for out-of-range ages
  return AGE_TIERS.MIDDLE.label;
}

/**
 * Group players by age tier
 * @param {Array} players - Array of {id, name, age}
 * @returns {Object} - { young: [...players], middle: [...players], teen: [...players] }
 */
function groupPlayersByAgeTier(players) {
  const grouped = {
    young: [],
    middle: [],
    teen: []
  };

  players.forEach(player => {
    const tier = getAgeTier(player.age);
    grouped[tier].push(player);
  });

  return grouped;
}

/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate addition question
 */
function generateAddition(ageTier, difficulty) {
  let num1, num2;

  switch (ageTier) {
    case 'young':
      if (difficulty === 'easy') {
        // 3 + 5 (single + single, no carry, sum < 10)
        num1 = randomInt(1, 4);
        num2 = randomInt(1, 9 - num1);
      } else if (difficulty === 'medium') {
        // 8 + 7 (single + single, with carry)
        num1 = randomInt(5, 9);
        num2 = randomInt(5, 9);
      } else {
        // 15 + 18 (double + double)
        num1 = randomInt(10, 20);
        num2 = randomInt(10, 20);
      }
      break;

    case 'middle':
      if (difficulty === 'easy') {
        // 12 + 7 (double + single)
        num1 = randomInt(10, 20);
        num2 = randomInt(1, 9);
      } else if (difficulty === 'medium') {
        // 27 + 35 (double + double, with carry)
        num1 = randomInt(20, 50);
        num2 = randomInt(20, 50);
      } else {
        // 78 + 94 (double + double, larger)
        num1 = randomInt(50, 99);
        num2 = randomInt(50, 99);
      }
      break;

    case 'teen':
      if (difficulty === 'easy') {
        // 23 + 45 (double + double)
        num1 = randomInt(20, 50);
        num2 = randomInt(20, 50);
      } else if (difficulty === 'medium') {
        // 147 + 258 (triple + triple)
        num1 = randomInt(100, 300);
        num2 = randomInt(100, 300);
      } else {
        // 347 + 586 (triple + triple, larger)
        num1 = randomInt(300, 600);
        num2 = randomInt(300, 600);
      }
      break;
  }

  return {
    question: `${num1} + ${num2}`,
    answer: num1 + num2,
    operation: 'addition'
  };
}

/**
 * Generate subtraction question
 */
function generateSubtraction(ageTier, difficulty) {
  let num1, num2;

  switch (ageTier) {
    case 'young':
      if (difficulty === 'easy') {
        // 9 - 4 (single - single, no borrow)
        num1 = randomInt(5, 9);
        num2 = randomInt(1, num1);
      } else if (difficulty === 'medium') {
        // 15 - 8 (double - single, with borrow)
        num1 = randomInt(10, 20);
        num2 = randomInt(5, 9);
      } else {
        // 32 - 18 (double - double, with borrow)
        num1 = randomInt(25, 40);
        num2 = randomInt(10, 20);
      }
      break;

    case 'middle':
      if (difficulty === 'easy') {
        // 18 - 5 (double - single)
        num1 = randomInt(10, 25);
        num2 = randomInt(1, 9);
      } else if (difficulty === 'medium') {
        // 52 - 27 (double - double, with borrow)
        num1 = randomInt(40, 70);
        num2 = randomInt(15, 35);
      } else {
        // 95 - 48 (double - double, harder)
        num1 = randomInt(70, 99);
        num2 = randomInt(30, 50);
      }
      break;

    case 'teen':
      if (difficulty === 'easy') {
        // 45 - 12 (double - double)
        num1 = randomInt(40, 70);
        num2 = randomInt(10, 30);
      } else if (difficulty === 'medium') {
        // 234 - 87 (triple - double)
        num1 = randomInt(150, 300);
        num2 = randomInt(50, 99);
      } else {
        // 432 - 115 (triple - triple)
        num1 = randomInt(300, 600);
        num2 = randomInt(100, 250);
      }
      break;
  }

  return {
    question: `${num1} - ${num2}`,
    answer: num1 - num2,
    operation: 'subtraction'
  };
}

/**
 * Generate multiplication question
 */
function generateMultiplication(ageTier, difficulty) {
  let num1, num2;

  switch (ageTier) {
    case 'young':
      if (difficulty === 'easy') {
        // 3 × 2 (small single digits)
        num1 = randomInt(2, 5);
        num2 = randomInt(2, 5);
      } else if (difficulty === 'medium') {
        // 6 × 8 (harder single digits)
        num1 = randomInt(5, 9);
        num2 = randomInt(5, 9);
      } else {
        // 7 × 12 (single × double)
        num1 = randomInt(5, 9);
        num2 = randomInt(10, 15);
      }
      break;

    case 'middle':
      if (difficulty === 'easy') {
        // 7 × 5 (medium single digits)
        num1 = randomInt(5, 9);
        num2 = randomInt(5, 9);
      } else if (difficulty === 'medium') {
        // 12 × 7 (double × single)
        num1 = randomInt(10, 15);
        num2 = randomInt(6, 9);
      } else {
        // 18 × 12 (double × double)
        num1 = randomInt(15, 25);
        num2 = randomInt(10, 15);
      }
      break;

    case 'teen':
      if (difficulty === 'easy') {
        // 12 × 8 (double × single)
        num1 = randomInt(10, 15);
        num2 = randomInt(6, 9);
      } else if (difficulty === 'medium') {
        // 23 × 15 (double × double)
        num1 = randomInt(20, 30);
        num2 = randomInt(12, 20);
      } else {
        // 45 × 28 (double × double, larger)
        num1 = randomInt(35, 50);
        num2 = randomInt(20, 35);
      }
      break;
  }

  return {
    question: `${num1} × ${num2}`,
    answer: num1 * num2,
    operation: 'multiplication'
  };
}

/**
 * Generate division question (always whole number results)
 */
function generateDivision(ageTier, difficulty) {
  let dividend, divisor;

  switch (ageTier) {
    case 'young':
      if (difficulty === 'easy') {
        // 8 ÷ 2 (single ÷ single, even)
        divisor = randomInt(2, 5);
        dividend = divisor * randomInt(2, 5);
      } else if (difficulty === 'medium') {
        // 15 ÷ 3 (double ÷ single)
        divisor = randomInt(3, 5);
        dividend = divisor * randomInt(3, 6);
      } else {
        // 24 ÷ 6 (double ÷ single, larger)
        divisor = randomInt(4, 8);
        dividend = divisor * randomInt(4, 8);
      }
      break;

    case 'middle':
      if (difficulty === 'easy') {
        // 24 ÷ 3 (double ÷ single, even)
        divisor = randomInt(3, 6);
        dividend = divisor * randomInt(5, 8);
      } else if (difficulty === 'medium') {
        // 72 ÷ 6 (double ÷ single, larger)
        divisor = randomInt(6, 9);
        dividend = divisor * randomInt(8, 12);
      } else {
        // 96 ÷ 12 (double ÷ double)
        divisor = randomInt(10, 12);
        dividend = divisor * randomInt(6, 10);
      }
      break;

    case 'teen':
      if (difficulty === 'easy') {
        // 96 ÷ 8 (double ÷ single, even)
        divisor = randomInt(6, 9);
        dividend = divisor * randomInt(10, 15);
      } else if (difficulty === 'medium') {
        // 144 ÷ 12 (triple ÷ double)
        divisor = randomInt(10, 12);
        dividend = divisor * randomInt(10, 15);
      } else {
        // 225 ÷ 15 (triple ÷ double, larger)
        divisor = randomInt(12, 20);
        dividend = divisor * randomInt(12, 20);
      }
      break;
  }

  return {
    question: `${dividend} ÷ ${divisor}`,
    answer: dividend / divisor,
    operation: 'division'
  };
}

/**
 * Generate a Speed Math question for a specific age tier
 * @param {string} ageTier - 'young', 'middle', or 'teen'
 * @param {string} operation - 'addition', 'subtraction', 'multiplication', 'division'
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {Object} - { question: "5 + 3", answer: 8, operation: "addition" }
 */
function generateSpeedMathQuestion(ageTier, operation, difficulty) {
  switch (operation) {
    case 'addition':
      return generateAddition(ageTier, difficulty);
    case 'subtraction':
      return generateSubtraction(ageTier, difficulty);
    case 'multiplication':
      return generateMultiplication(ageTier, difficulty);
    case 'division':
      return generateDivision(ageTier, difficulty);
    default:
      // Default to addition if unknown operation
      return generateAddition(ageTier, difficulty);
  }
}

/**
 * Generate Speed Math questions for all active age tiers
 * @param {Array} players - Array of {id, name, age}
 * @param {string} operation - Optional: 'addition', 'subtraction', 'multiplication', 'division' (random if not specified)
 * @param {string} difficulty - Optional: 'easy', 'medium', 'hard' (random if not specified)
 * @returns {Object} - Questions grouped by tier with player assignments
 */
function generateSpeedMathRound(players, operation = null, difficulty = null) {
  // Pick random operation and difficulty if not specified
  const operations = ['addition', 'subtraction', 'multiplication', 'division'];
  const difficulties = ['easy', 'medium', 'hard'];

  const selectedOperation = operation || operations[randomInt(0, operations.length - 1)];
  const selectedDifficulty = difficulty || difficulties[randomInt(0, difficulties.length - 1)];

  // Group players by age tier
  const groupedPlayers = groupPlayersByAgeTier(players);

  // Generate questions for each active tier
  const questions = [];

  Object.keys(groupedPlayers).forEach(tier => {
    if (groupedPlayers[tier].length > 0) {
      const questionData = generateSpeedMathQuestion(tier, selectedOperation, selectedDifficulty);

      questions.push({
        tier,
        operation: selectedOperation,
        difficulty: selectedDifficulty,
        question: questionData.question,
        answer: questionData.answer,
        players: groupedPlayers[tier].map(p => ({
          id: p.id,
          name: p.name,
          age: p.age
        }))
      });
    }
  });

  return {
    operation: selectedOperation,
    difficulty: selectedDifficulty,
    questions
  };
}

/**
 * =================================================================
 * TRUE/FALSE GAME
 * =================================================================
 */

const { trueFalseQuestions, triviaQuestions, spellingWords, getRandomQuestion } = require('../data/questionPools');

/**
 * Generate True/False round for all active age tiers
 */
function generateTrueFalseRound(players) {
  const groupedPlayers = groupPlayersByAgeTier(players);
  const questions = [];

  Object.keys(groupedPlayers).forEach(tier => {
    if (groupedPlayers[tier].length > 0) {
      const questionData = getRandomQuestion(trueFalseQuestions[tier]);

      questions.push({
        tier,
        question: questionData.question,
        answer: questionData.answer,
        answerType: 'boolean',
        players: groupedPlayers[tier].map(p => ({
          id: p.id,
          name: p.name,
          age: p.age
        }))
      });
    }
  });

  return {
    gameType: 'true-false',
    questions
  };
}

/**
 * =================================================================
 * MULTIPLE CHOICE TRIVIA GAME
 * =================================================================
 */

/**
 * Generate Multiple Choice Trivia round for all active age tiers
 */
function generateTriviaRound(players) {
  const groupedPlayers = groupPlayersByAgeTier(players);
  const questions = [];

  Object.keys(groupedPlayers).forEach(tier => {
    if (groupedPlayers[tier].length > 0) {
      const questionData = getRandomQuestion(triviaQuestions[tier]);

      questions.push({
        tier,
        question: questionData.question,
        options: questionData.options,
        answer: questionData.answer,
        answerType: 'multiple-choice',
        players: groupedPlayers[tier].map(p => ({
          id: p.id,
          name: p.name,
          age: p.age
        }))
      });
    }
  });

  return {
    gameType: 'trivia',
    questions
  };
}

/**
 * =================================================================
 * SPELLING BEE GAME (Audio-based)
 * =================================================================
 */

/**
 * Generate Spelling Bee round for all active age tiers
 *
 * Flow:
 * - Phase 1 (Listen): Each tier hears their word pronounced 2x (sequential)
 * - Phase 2 (Pause): 10 second thinking pause
 * - Phase 3 (Answer): 30 seconds to type and submit
 */
function generateSpellingRound(players) {
  const groupedPlayers = groupPlayersByAgeTier(players);
  const questions = [];

  // Define tier order for sequential pronunciation
  const tierOrder = ['young', 'middle', 'teen'];

  tierOrder.forEach(tier => {
    if (groupedPlayers[tier] && groupedPlayers[tier].length > 0) {
      const wordData = getRandomQuestion(spellingWords[tier]);

      questions.push({
        tier,
        word: wordData.word, // Actual word to spell (for pronunciation & validation)
        hint: wordData.hint, // Helpful context
        question: `Spell the word you heard`, // Display text
        answer: wordData.word.toLowerCase(),
        answerType: 'text',
        validationOptions: {
          caseSensitive: false,
          fuzzyMatch: false
        },
        // Speech synthesis settings per age tier
        speechRate: tier === 'young' ? 0.75 : tier === 'middle' ? 0.85 : 0.9,
        repeatCount: 2, // How many times to pronounce
        players: groupedPlayers[tier].map(p => ({
          id: p.id,
          name: p.name,
          age: p.age
        }))
      });
    }
  });

  return {
    gameType: 'spelling',
    questions,
    // Timing configuration
    phases: {
      listen: {
        duration: questions.length * 8000, // ~8 seconds per tier (2x pronunciation + gaps)
        tierOrder: tierOrder.filter(t => groupedPlayers[t] && groupedPlayers[t].length > 0)
      },
      pause: {
        duration: 10000 // 10 seconds
      },
      answer: {
        duration: 30000 // 30 seconds
      }
    }
  };
}

module.exports = {
  getAgeTier,
  groupPlayersByAgeTier,
  generateSpeedMathQuestion,
  generateSpeedMathRound,
  generateTrueFalseRound,
  generateTriviaRound,
  generateSpellingRound,
  AGE_TIERS
};
