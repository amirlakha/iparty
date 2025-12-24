/**
 * Christmas Story Data Structure
 * "Save Christmas Village" - 5 Act Adventure
 *
 * Each section has:
 * - Story narrative
 * - Character guide
 * - Background artwork
 * - 3 challenge rounds
 */

export const christmasStory = {
  title: "Save Christmas Village",
  subtitle: "A Magical Adventure to Save Christmas",

  // Story introduction (shown once at game start)
  introduction: {
    title: "Christmas Needs Your Help!",
    narrative: [
      "Oh no! Santa's magical workshop has broken down!",
      "The toy machines, reindeer stable, gift wrapper, cookie kitchen, and sleigh all need repairs.",
      "You must complete challenges to collect Magic Stars ⭐ that will power each machine.",
      "Work together to save Christmas!"
    ],
    character: "santa",
    characterPose: "worried",
    duration: 12000 // 12 seconds
  },

  // 5 workshop sections
  sections: [
    {
      id: 1,
      name: "Toy Machine Workshop",
      emoji: "🎁",
      background: "bg-toy-machine.png",
      character: "santa",

      storyIntro: {
        title: "The Toy Machine is Broken!",
        narrative: [
          "The magical toy-making machine has stopped working!",
          "Without it, no presents will be ready for Christmas.",
          "Complete 3 challenges to collect the Magic Stars needed to repair it!"
        ],
        duration: 8000 // 8 seconds
      },

      challenges: [
        { roundNumber: 1, type: "speed-math", difficulty: "easy" },
        { roundNumber: 2, type: "trivia", difficulty: "easy" },
        { roundNumber: 3, type: "true-false", difficulty: "easy" }
      ],

      successMessage: {
        title: "Toy Machine Repaired!",
        narrative: [
          "Amazing! The toy machine is working again!",
          "Toys are flowing down the conveyor belt!"
        ],
        duration: 5000 // 5 seconds
      }
    },

    {
      id: 2,
      name: "Reindeer Stable",
      emoji: "🦌",
      background: "bg-reindeer-stable.png",
      character: "reindeer",

      storyIntro: {
        title: "The Reindeer Need Help!",
        narrative: [
          "Santa's reindeer are too weak to fly!",
          "They need special magical care to regain their strength.",
          "Complete 3 challenges to help the reindeer prepare for the big flight!"
        ],
        duration: 8000
      },

      challenges: [
        { roundNumber: 4, type: "spelling", difficulty: "easy" },
        { roundNumber: 5, type: "color-pattern", difficulty: "medium" },
        { roundNumber: 6, type: "trivia", difficulty: "medium" }
      ],

      successMessage: {
        title: "Reindeer Ready to Fly!",
        narrative: [
          "Wonderful! The reindeer are glowing with magical energy!",
          "Their antlers are shining bright!"
        ],
        duration: 5000
      }
    },

    {
      id: 3,
      name: "Gift Wrapping Station",
      emoji: "🎀",
      background: "bg-gift-wrap.png",
      character: "elf",

      storyIntro: {
        title: "Millions of Gifts to Wrap!",
        narrative: [
          "The gift wrapping machines have run out of magic!",
          "Mountains of unwrapped presents are piling up!",
          "Complete 3 challenges to get the wrapping station working again!"
        ],
        duration: 8000
      },

      challenges: [
        { roundNumber: 7, type: "memory-match", difficulty: "medium" },
        { roundNumber: 8, type: "speed-math", difficulty: "medium" },
        { roundNumber: 9, type: "true-false", difficulty: "medium" }
      ],

      successMessage: {
        title: "Wrapping Station Fixed!",
        narrative: [
          "Perfect! Ribbons and bows are flying everywhere!",
          "All the presents are beautifully wrapped!"
        ],
        duration: 5000
      }
    },

    {
      id: 4,
      name: "Cookie Kitchen",
      emoji: "🍪",
      background: "bg-cookie-kitchen.png",
      character: "elf",

      storyIntro: {
        title: "Santa Needs Energy!",
        narrative: [
          "The cookie ovens have gone cold!",
          "Santa needs his special Christmas cookies for the long journey.",
          "Complete 3 challenges to bake the perfect batch!"
        ],
        duration: 8000
      },

      challenges: [
        { roundNumber: 10, type: "trivia", difficulty: "hard" },
        { roundNumber: 11, type: "spelling", difficulty: "medium" },
        { roundNumber: 12, type: "color-pattern", difficulty: "hard" }
      ],

      successMessage: {
        title: "Cookies Ready!",
        narrative: [
          "Delicious! The smell of fresh cookies fills the air!",
          "Santa has all the energy he needs!"
        ],
        duration: 5000
      }
    },

    {
      id: 5,
      name: "Sleigh Launch Pad",
      emoji: "🛷",
      background: "bg-sleigh-launch.png",
      character: "santa",

      storyIntro: {
        title: "Time to Launch the Sleigh!",
        narrative: [
          "This is it! Everything is ready except the sleigh!",
          "The launch pad needs your final burst of magic!",
          "Complete these last 3 challenges to save Christmas!"
        ],
        duration: 8000
      },

      challenges: [
        { roundNumber: 13, type: "speed-math", difficulty: "hard" },
        { roundNumber: 14, type: "memory-match", difficulty: "hard" },
        { roundNumber: 15, type: "trivia", difficulty: "hard" }
      ],

      successMessage: {
        title: "Sleigh Launching!",
        narrative: [
          "INCREDIBLE! The sleigh is glowing with magic!",
          "The reindeer are lifting off!",
          "You saved Christmas! 🎄✨"
        ],
        duration: 5000
      }
    }
  ],

  // Final victory screen
  victory: {
    title: "Christmas is Saved!",
    narrative: [
      "You did it! Santa's sleigh is soaring through the sky!",
      "Christmas will be delivered to children everywhere!",
      "You are true Christmas heroes!"
    ],
    background: "victory-scene.png",
    characters: ["santa", "elf", "reindeer"], // All three celebrating
    celebrationEffect: "celebration-burst.png",
    duration: 15000 // Stay on victory screen longer
  },

  // Character definitions
  characters: {
    santa: {
      name: "Santa Claus",
      image: "santa-character.png",
      color: "#DC2626", // Red
      greeting: "Ho ho ho! Let's fix the workshop!",
      encouragement: [
        "Wonderful work!",
        "You're doing great!",
        "Keep it up!",
        "Fantastic!"
      ]
    },
    elf: {
      name: "Jingle the Elf",
      image: "elf-character.png",
      color: "#16A34A", // Green
      greeting: "Hi there! I'm here to help!",
      encouragement: [
        "You're amazing!",
        "Great job!",
        "Keep going!",
        "Brilliant!"
      ]
    },
    reindeer: {
      name: "Dasher",
      image: "reindeer-character.png",
      color: "#B45309", // Brown
      greeting: "*Snort* Let's get to work!",
      encouragement: [
        "Excellent!",
        "Well done!",
        "Superb!",
        "Outstanding!"
      ]
    }
  },

  // UI assets mapping
  assets: {
    logo: "game-logo.png",
    starIcon: "star-icon.png",
    villageMap: "village-map.png",
    celebrationBurst: "celebration-burst.png"
  },

  // Game flow timing (in milliseconds)
  timing: {
    introduction: 12000,      // Initial story intro
    sectionIntro: 8000,       // Before each section
    challengeDuration: 60000, // Max time for challenge
    resultsDisplay: 5000,     // Show results after challenge
    sectionSuccess: 5000,     // Celebration after section complete
    mapTransition: 5000,      // Village map between sections
    victoryScreen: 15000      // Final victory celebration
  },

  // Progression tracking
  progressMilestones: {
    sections: 5,
    challengesPerSection: 3,
    totalChallenges: 15,
    starsPerSection: 3,
    totalStars: 15
  }
};

/**
 * Get section by ID
 */
export const getSection = (sectionId) => {
  return christmasStory.sections.find(s => s.id === sectionId);
};

/**
 * Get section by round number (1-15)
 */
export const getSectionByRound = (roundNumber) => {
  const sectionIndex = Math.floor((roundNumber - 1) / 3);
  return christmasStory.sections[sectionIndex];
};

/**
 * Get challenge index within section (0-2)
 */
export const getChallengeIndexInSection = (roundNumber) => {
  return (roundNumber - 1) % 3;
};

/**
 * Get character for a round
 */
export const getCharacterForRound = (roundNumber) => {
  const section = getSectionByRound(roundNumber);
  return section ? christmasStory.characters[section.character] : null;
};

/**
 * Get background for a round
 */
export const getBackgroundForRound = (roundNumber) => {
  const section = getSectionByRound(roundNumber);
  return section ? section.background : null;
};

/**
 * Check if round is the last in a section
 */
export const isLastRoundInSection = (roundNumber) => {
  return roundNumber % 3 === 0;
};

/**
 * Check if round is the first in a section
 */
export const isFirstRoundInSection = (roundNumber) => {
  return roundNumber % 3 === 1;
};

/**
 * Get total stars earned so far
 */
export const getStarsEarned = (completedSections) => {
  return completedSections * 3;
};

/**
 * Get progress percentage
 */
export const getProgressPercentage = (currentRound) => {
  return Math.round((currentRound / 15) * 100);
};

export default christmasStory;
