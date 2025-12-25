/**
 * Christmas Story Data (Server-side CommonJS version)
 */

const GameState = {
  LOBBY: 'LOBBY',
  INTRODUCTION: 'INTRODUCTION',
  SECTION_INTRO: 'SECTION_INTRO',
  CHALLENGE_ACTIVE: 'CHALLENGE_ACTIVE',
  CHALLENGE_RESULTS: 'CHALLENGE_RESULTS',
  SECTION_COMPLETE: 'SECTION_COMPLETE',
  MAP_TRANSITION: 'MAP_TRANSITION',
  VICTORY: 'VICTORY',
  GAME_COMPLETE: 'GAME_COMPLETE'
};

const timing = {
  introduction: 12000,      // Initial story intro
  sectionIntro: 8000,       // Before each section
  challengeDuration: 60000, // Max time for challenge
  resultsDisplay: 5000,     // Show results after challenge
  sectionSuccess: 5000,     // Celebration after section complete
  mapTransition: 5000,      // Village map between sections
  victoryScreen: 15000      // Final victory celebration
};

const sections = [
  {
    id: 1,
    name: "Toy Machine Workshop",
    rounds: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    name: "Reindeer Stable",
    rounds: [6, 7, 8, 9, 10]
  },
  {
    id: 3,
    name: "Gift Wrapping Station",
    rounds: [11, 12, 13, 14, 15]
  },
  {
    id: 4,
    name: "Cookie Kitchen",
    rounds: [16, 17, 18, 19, 20]
  },
  {
    id: 5,
    name: "Sleigh Launch Pad",
    rounds: [21, 22, 23, 24, 25]
  }
];

function getSectionByRound(roundNumber) {
  const sectionIndex = Math.floor((roundNumber - 1) / 5);
  return sections[sectionIndex];
}

function isFirstRoundInSection(roundNumber) {
  return (roundNumber - 1) % 5 === 0;
}

function isLastRoundInSection(roundNumber) {
  return roundNumber % 5 === 0;
}

module.exports = {
  GameState,
  timing,
  sections,
  getSectionByRound,
  isFirstRoundInSection,
  isLastRoundInSection
};
