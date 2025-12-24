/**
 * Difficulty Manager
 * Handles age-adaptive difficulty scaling
 */

/**
 * Age brackets
 */
export const AgeBracket = {
  YOUNG: 'young',    // 7-9 years
  MIDDLE: 'middle',  // 10-12 years
  TEEN: 'teen'       // 13-17 years
};

/**
 * Difficulty levels
 */
export const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

/**
 * Map age to bracket
 */
export function getAgeBracket(age) {
  if (age <= 9) return AgeBracket.YOUNG;
  if (age <= 12) return AgeBracket.MIDDLE;
  return AgeBracket.TEEN;
}

/**
 * Map age to difficulty
 */
export function getDifficultyForAge(age) {
  if (age <= 9) return Difficulty.EASY;
  if (age <= 12) return Difficulty.MEDIUM;
  return Difficulty.HARD;
}

/**
 * Calculate median age from array of ages
 */
export function calculateMedianAge(ages) {
  if (!ages || ages.length === 0) return 10; // Default

  const sorted = [...ages].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Even number: average of two middle values
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  } else {
    // Odd number: middle value
    return sorted[mid];
  }
}

/**
 * Get difficulty for a group of players (use median age)
 */
export function getDifficultyForPlayers(players) {
  if (!players || players.length === 0) return Difficulty.MEDIUM;

  const ages = players.map(p => p.age || 10);
  const medianAge = calculateMedianAge(ages);

  return getDifficultyForAge(medianAge);
}

/**
 * Get timer duration based on difficulty
 */
export function getTimerDuration(difficulty) {
  const durations = {
    [Difficulty.EASY]: 60000,    // 60 seconds
    [Difficulty.MEDIUM]: 45000,  // 45 seconds
    [Difficulty.HARD]: 30000     // 30 seconds
  };

  return durations[difficulty] || 45000;
}

/**
 * Get speed multiplier thresholds based on difficulty
 */
export function getSpeedMultipliers(difficulty) {
  const multipliers = {
    [Difficulty.EASY]: [
      { threshold: 5000, multiplier: 2.0 },   // < 5s: 2x
      { threshold: 10000, multiplier: 1.5 },  // < 10s: 1.5x
      { threshold: 20000, multiplier: 1.2 },  // < 20s: 1.2x
    ],
    [Difficulty.MEDIUM]: [
      { threshold: 3000, multiplier: 2.0 },   // < 3s: 2x
      { threshold: 7000, multiplier: 1.5 },   // < 7s: 1.5x
      { threshold: 15000, multiplier: 1.2 },  // < 15s: 1.2x
    ],
    [Difficulty.HARD]: [
      { threshold: 2000, multiplier: 2.0 },   // < 2s: 2x
      { threshold: 5000, multiplier: 1.5 },   // < 5s: 1.5x
      { threshold: 10000, multiplier: 1.2 },  // < 10s: 1.2x
    ]
  };

  return multipliers[difficulty] || multipliers[Difficulty.MEDIUM];
}

/**
 * Get base points for difficulty
 */
export function getBasePoints(difficulty) {
  const basePoints = {
    [Difficulty.EASY]: 40,
    [Difficulty.MEDIUM]: 50,
    [Difficulty.HARD]: 60
  };

  return basePoints[difficulty] || 50;
}

/**
 * Generate scoring config for a challenge based on difficulty
 */
export function getScoringConfig(difficulty) {
  return {
    correctBase: getBasePoints(difficulty),
    wrongBase: 5,
    speedMultipliers: getSpeedMultipliers(difficulty),
    placementBonuses: {
      1: 25,
      2: 15,
      3: 10
    }
  };
}

/**
 * Get encouragement message based on performance
 */
export function getEncouragementMessage(percentCorrect, difficulty) {
  if (percentCorrect >= 90) {
    return {
      message: "Outstanding! You're a superstar!",
      emoji: "🌟",
      color: "gold"
    };
  } else if (percentCorrect >= 70) {
    return {
      message: "Great job! Keep it up!",
      emoji: "🎉",
      color: "green"
    };
  } else if (percentCorrect >= 50) {
    return {
      message: "Good effort! You're getting there!",
      emoji: "👍",
      color: "blue"
    };
  } else {
    return {
      message: "Keep trying! You can do it!",
      emoji: "💪",
      color: "orange"
    };
  }
}

/**
 * Suggest next difficulty based on performance
 */
export function suggestDifficulty(currentDifficulty, percentCorrect, averageSpeed) {
  // If doing really well (>80% correct and fast), suggest harder
  if (percentCorrect > 80 && averageSpeed < 10000) {
    if (currentDifficulty === Difficulty.EASY) return Difficulty.MEDIUM;
    if (currentDifficulty === Difficulty.MEDIUM) return Difficulty.HARD;
  }

  // If struggling (<40% correct), suggest easier
  if (percentCorrect < 40) {
    if (currentDifficulty === Difficulty.HARD) return Difficulty.MEDIUM;
    if (currentDifficulty === Difficulty.MEDIUM) return Difficulty.EASY;
  }

  // Otherwise keep current
  return currentDifficulty;
}

export default {
  AgeBracket,
  Difficulty,
  getAgeBracket,
  getDifficultyForAge,
  calculateMedianAge,
  getDifficultyForPlayers,
  getTimerDuration,
  getSpeedMultipliers,
  getBasePoints,
  getScoringConfig,
  getEncouragementMessage,
  suggestDifficulty
};
