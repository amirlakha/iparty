/**
 * Answer Validation System
 * Validates player answers and calculates points automatically
 */

/**
 * Validate an answer based on type
 * @param {*} playerAnswer - The answer submitted by player
 * @param {*} correctAnswer - The correct answer
 * @param {string} answerType - Type: 'number', 'text', 'multiple-choice', 'true-false', 'array'
 * @param {object} options - Validation options (fuzzyMatch, caseSensitive, etc.)
 * @returns {boolean} - Whether answer is correct
 */
function validateAnswer(playerAnswer, correctAnswer, answerType = 'text', options = {}) {
  const {
    fuzzyMatch = false,
    caseSensitive = false,
    acceptableVariations = [],
    tolerance = 0 // For number answers
  } = options;

  // Handle null/undefined
  if (playerAnswer === null || playerAnswer === undefined) {
    return false;
  }

  switch (answerType) {
    case 'number':
      return validateNumber(playerAnswer, correctAnswer, tolerance);

    case 'text':
      return validateText(playerAnswer, correctAnswer, {
        fuzzyMatch,
        caseSensitive,
        acceptableVariations
      });

    case 'multiple-choice':
      return validateMultipleChoice(playerAnswer, correctAnswer);

    case 'true-false':
    case 'boolean':
      return validateBoolean(playerAnswer, correctAnswer);

    case 'array':
      return validateArray(playerAnswer, correctAnswer, options);

    default:
      console.warn(`Unknown answer type: ${answerType}`);
      return false;
  }
}

/**
 * Validate number answer
 */
function validateNumber(playerAnswer, correctAnswer, tolerance = 0) {
  const playerNum = parseFloat(playerAnswer);
  const correctNum = parseFloat(correctAnswer);

  if (isNaN(playerNum) || isNaN(correctNum)) {
    return false;
  }

  if (tolerance === 0) {
    return playerNum === correctNum;
  }

  return Math.abs(playerNum - correctNum) <= tolerance;
}

/**
 * Validate text answer
 */
function validateText(playerAnswer, correctAnswer, options = {}) {
  const { fuzzyMatch, caseSensitive, acceptableVariations } = options;

  let playerText = String(playerAnswer).trim();
  let correctText = String(correctAnswer).trim();

  // Check acceptable variations first
  if (acceptableVariations && acceptableVariations.length > 0) {
    const allAcceptable = [correctText, ...acceptableVariations];
    if (!caseSensitive) {
      playerText = playerText.toLowerCase();
      return allAcceptable.some(variant =>
        variant.toLowerCase() === playerText
      );
    }
    return allAcceptable.includes(playerText);
  }

  // Case sensitivity
  if (!caseSensitive) {
    playerText = playerText.toLowerCase();
    correctText = correctText.toLowerCase();
  }

  // Exact match
  if (playerText === correctText) {
    return true;
  }

  // Fuzzy matching for spelling challenges
  if (fuzzyMatch) {
    return fuzzyTextMatch(playerText, correctText);
  }

  return false;
}

/**
 * Fuzzy text matching (Levenshtein distance)
 * Allows for minor typos
 */
function fuzzyTextMatch(str1, str2, maxDistance = 2) {
  if (str1 === str2) return true;
  if (str1.length === 0) return str2.length <= maxDistance;
  if (str2.length === 0) return str1.length <= maxDistance;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  // Allow up to maxDistance errors OR 15% of word length
  const threshold = Math.max(maxDistance, Math.floor(maxLength * 0.15));
  return distance <= threshold;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Validate multiple choice answer
 */
function validateMultipleChoice(playerAnswer, correctAnswer) {
  // Handle both index and value comparisons
  return playerAnswer === correctAnswer ||
         String(playerAnswer) === String(correctAnswer);
}

/**
 * Validate boolean answer
 */
function validateBoolean(playerAnswer, correctAnswer) {
  const normalizedPlayer = normalizeBoolean(playerAnswer);
  const normalizedCorrect = normalizeBoolean(correctAnswer);
  return normalizedPlayer === normalizedCorrect;
}

/**
 * Normalize boolean values
 */
function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;

  const str = String(value).toLowerCase().trim();
  if (['true', 't', 'yes', 'y', '1'].includes(str)) return true;
  if (['false', 'f', 'no', 'n', '0'].includes(str)) return false;

  return null;
}

/**
 * Validate array answer (for multi-select or ordered lists)
 */
function validateArray(playerAnswer, correctAnswer, options = {}) {
  const { orderMatters = true } = options;

  if (!Array.isArray(playerAnswer) || !Array.isArray(correctAnswer)) {
    return false;
  }

  if (playerAnswer.length !== correctAnswer.length) {
    return false;
  }

  if (orderMatters) {
    return playerAnswer.every((item, index) => item === correctAnswer[index]);
  } else {
    // Order doesn't matter - check if all items present
    const sortedPlayer = [...playerAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return sortedPlayer.every((item, index) => item === sortedCorrect[index]);
  }
}

/**
 * Calculate points for an answer - PLACEMENT-BASED SCORING
 * - 1st correct: 30 points
 * - 2nd correct: 20 points
 * - 3rd+ correct: 10 points each
 * - Wrong/timeout: 0 points
 *
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {number} placement - Player's placement (1, 2, 3, 4+) among correct answers
 * @returns {number} - Points earned
 */
function calculatePoints(isCorrect, placement = null) {
  // Wrong answers get 0 points
  if (!isCorrect) {
    return 0;
  }

  // No placement = not ranked yet, return 0
  if (!placement) {
    return 0;
  }

  // Placement-based points
  if (placement === 1) return 30;  // 1st place
  if (placement === 2) return 20;  // 2nd place
  return 10;                       // 3rd+ place
}

/**
 * Determine player placements based on submission times
 * @param {Array} submissions - Array of {playerId, timeSpent, isCorrect}
 * @returns {Map} - Map of playerId to placement (1, 2, 3, etc.)
 */
function calculatePlacements(submissions) {
  const placements = new Map();

  // Filter only correct answers
  const correctSubmissions = submissions.filter(s => s.isCorrect);

  // Sort by time spent (fastest first)
  correctSubmissions.sort((a, b) => a.timeSpent - b.timeSpent);

  // Assign placements
  correctSubmissions.forEach((submission, index) => {
    placements.set(submission.playerId, index + 1);
  });

  return placements;
}

/**
 * Grade all submissions for a round
 * @param {Array} submissions - Array of {playerId, answer, timeSpent}
 * @param {object} roundConfig - Round configuration with correctAnswer, answerType, etc.
 * @returns {Array} - Array of {playerId, isCorrect, points, placement}
 */
function gradeSubmissions(submissions, roundConfig) {
  const { correctAnswer, answerType, validationOptions } = roundConfig;

  // Validate all answers
  const validatedSubmissions = submissions.map(sub => ({
    playerId: sub.playerId,
    playerName: sub.playerName,
    answer: sub.answer,
    timeSpent: sub.timeSpent,
    isCorrect: validateAnswer(
      sub.answer,
      correctAnswer,
      answerType,
      validationOptions
    )
  }));

  // Calculate placements (by speed)
  const placements = calculatePlacements(validatedSubmissions);

  // Calculate points based on placement
  const results = validatedSubmissions.map(sub => ({
    playerId: sub.playerId,
    playerName: sub.playerName,
    answer: sub.answer,
    isCorrect: sub.isCorrect,
    timeSpent: sub.timeSpent,
    placement: placements.get(sub.playerId) || null,
    points: calculatePoints(
      sub.isCorrect,
      placements.get(sub.playerId)
    )
  }));

  return results;
}

/**
 * Calculate stars for a section based on team performance
 * NEW STAR SYSTEM:
 * - Each question awards 1 star if ANY player answers correctly
 * - 3 questions per section = 3 stars possible
 * - Need 3 stars to pass section
 *
 * @param {Array} sectionResults - Array of results for all challenges in section
 *   Each result should have: { questionNumber, isCorrect, playerId, ... }
 * @param {number} numPlayers - Total number of players
 * @returns {Object} - { stars: 0-3, passed: boolean, questionsCorrect: [bool, bool, bool] }
 */
function calculateSectionStars(sectionResults, numPlayers) {
  // Group results by question (assume 3 questions: round 1, 2, 3 of section)
  // Since we get all results for the section, we need to group by question
  // Each section has 3 challenges, so split results into 3 groups

  const questionsCorrect = [false, false, false];
  const resultsPerQuestion = Math.ceil(sectionResults.length / 3);

  // Check each question - if ANY player got it right, award star
  for (let q = 0; q < 3; q++) {
    const questionResults = sectionResults.slice(
      q * resultsPerQuestion,
      (q + 1) * resultsPerQuestion
    );

    // If any player got this question correct, award star
    const anyoneCorrect = questionResults.some(r => r.isCorrect);
    questionsCorrect[q] = anyoneCorrect;
  }

  // Count stars (1 per question that someone got right)
  const stars = questionsCorrect.filter(Boolean).length;
  const passed = stars === 3; // Need all 3 stars to pass

  return {
    stars,
    passed,
    questionsCorrect,
    totalQuestions: 3
  };
}

module.exports = {
  validateAnswer,
  calculatePoints,
  calculatePlacements,
  gradeSubmissions,
  calculateSectionStars,
  // Export individual validators for testing
  validateNumber,
  validateText,
  validateMultipleChoice,
  validateBoolean,
  validateArray,
  fuzzyTextMatch,
  levenshteinDistance
};
