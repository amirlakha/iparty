// Challenge templates
const challenges = [
  // Trivia - Multiple Choice
  {
    type: 'multiple-choice',
    title: 'Quick Trivia',
    emoji: '🧠',
    description: 'Choose the correct answer!',
    questions: [
      {
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Jupiter', 'Saturn', 'Mars'],
        correct: 'Jupiter'
      },
      {
        question: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correct: '7'
      },
      {
        question: 'What color do you get when you mix blue and yellow?',
        options: ['Green', 'Purple', 'Orange', 'Red'],
        correct: 'Green'
      },
      {
        question: 'Which animal is the fastest on land?',
        options: ['Lion', 'Cheetah', 'Horse', 'Gazelle'],
        correct: 'Cheetah'
      },
      {
        question: 'How many sides does a hexagon have?',
        options: ['4', '5', '6', '7'],
        correct: '6'
      }
    ]
  },

  // Would You Rather
  {
    type: 'would-you-rather',
    title: 'Would You Rather?',
    emoji: '🤔',
    description: 'Choose your preference!',
    questions: [
      {
        question: 'Would you rather...',
        options: ['Have the ability to fly', 'Be invisible'],
      },
      {
        question: 'Would you rather...',
        options: ['Live in a castle', 'Live on a spaceship'],
      },
      {
        question: 'Would you rather...',
        options: ['Have a pet dragon', 'Have a pet unicorn'],
      },
      {
        question: 'Would you rather...',
        options: ['Time travel to the past', 'Time travel to the future'],
      },
      {
        question: 'Would you rather...',
        options: ['Be able to talk to animals', 'Speak all human languages'],
      }
    ]
  },

  // Creative Challenges
  {
    type: 'creative',
    title: 'Creative Challenge',
    emoji: '🎨',
    description: 'Use your imagination!',
    prompts: [
      'If you could invent a new holiday, what would it celebrate?',
      'Describe the most ridiculous superhero power you can think of!',
      'If animals could talk, which one would be the rudest?',
      'Create a name for a new ice cream flavor!',
      'What would you name a robot butler?',
      'If you opened a restaurant, what funny name would you give it?'
    ]
  },

  // Number Challenges
  {
    type: 'number-challenge',
    title: 'Number Challenge',
    emoji: '🔢',
    description: 'Quick math fun!',
    questions: [
      {
        question: 'What is 7 x 8?',
        options: ['54', '56', '58', '64'],
        correct: '56'
      },
      {
        question: 'What is 100 - 37?',
        options: ['63', '67', '73', '77'],
        correct: '63'
      },
      {
        question: 'If you have 3 apples and get 5 more, how many do you have?',
        options: ['6', '7', '8', '9'],
        correct: '8'
      },
      {
        question: 'What is half of 50?',
        options: ['20', '25', '30', '35'],
        correct: '25'
      }
    ]
  },

  // Rhyme Time
  {
    type: 'rhyme-time',
    title: 'Rhyme Time',
    emoji: '🎵',
    description: 'Find words that rhyme!',
    prompts: [
      'Name something that rhymes with "STAR"',
      'Name something that rhymes with "TREE"',
      'Name something that rhymes with "LIGHT"',
      'Name something that rhymes with "MOON"',
      'Name something that rhymes with "PLAY"',
      'Name something that rhymes with "BLUE"'
    ]
  },

  // This or That
  {
    type: 'this-or-that',
    title: 'This or That',
    emoji: '⚖️',
    description: 'Pick your favorite!',
    questions: [
      {
        question: 'Which is better?',
        options: ['Pizza', 'Ice Cream'],
      },
      {
        question: 'Which is better?',
        options: ['Summer', 'Winter'],
      },
      {
        question: 'Which is better?',
        options: ['Dogs', 'Cats'],
      },
      {
        question: 'Which is better?',
        options: ['Beach', 'Mountains'],
      },
      {
        question: 'Which is better?',
        options: ['Movies', 'Video Games'],
      }
    ]
  },

  // Quick Draw
  {
    type: 'quick-think',
    title: 'Quick Think',
    emoji: '⚡',
    description: 'First thing that comes to mind!',
    prompts: [
      'Name a country that starts with "C"',
      'Name a fruit that is red',
      'Name something you find in a kitchen',
      'Name an animal that lives in water',
      'Name a color in the rainbow',
      'Name something cold',
      'Name a sport played with a ball',
      'Name something you wear on your feet'
    ]
  },

  // Emoji Story
  {
    type: 'emoji-story',
    title: 'Emoji Story',
    emoji: '📖',
    description: 'Describe what this emoji story means!',
    prompts: [
      '🌞➡️🏖️➡️🍦➡️😊',
      '🏠➡️🚗➡️🏪➡️🎁',
      '😴➡️⏰➡️☕➡️💼',
      '🌧️➡️☔➡️🌈➡️😊'
    ]
  },

  // Finish the Sentence
  {
    type: 'finish-sentence',
    title: 'Finish the Sentence',
    emoji: '✏️',
    description: 'Complete the sentence!',
    prompts: [
      'My favorite thing about holidays is...',
      'If I could have any superpower it would be...',
      'The funniest thing that ever happened to me was...',
      'My dream vacation would be...',
      'If I won a million dollars I would...',
      'The best gift I ever received was...'
    ]
  }
];

// Helper to pick random items
function pickRandom(array, count = 1) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

// Generate rounds for the game
export function generateRounds(players, totalRounds = 15) {
  const rounds = [];

  // Ensure we have enough variety
  const challengeTypes = [...challenges];

  for (let i = 0; i < totalRounds; i++) {
    // Pick a random challenge type
    const challengeTemplate = pickRandom(challengeTypes);

    let round = {
      type: challengeTemplate.type,
      title: challengeTemplate.title,
      emoji: challengeTemplate.emoji,
      description: challengeTemplate.description,
      roundNumber: i
    };

    // Pick specific question/prompt based on type
    if (challengeTemplate.questions) {
      const question = pickRandom(challengeTemplate.questions);
      round = { ...round, ...question };
    } else if (challengeTemplate.prompts) {
      const prompt = pickRandom(challengeTemplate.prompts);
      round.prompt = prompt;
    }

    // Decide if it's 1v1, team, or all-play
    if (i % 3 === 0 && players.length >= 2) {
      // 1v1 round
      const participants = pickRandom(players, 2);
      round.mode = '1v1';
      round.participants = participants;
      round.description = `${participants[0].name} vs ${participants[1].name}!`;
    } else if (i % 5 === 0 && players.length >= 4) {
      // Team round
      round.mode = 'team';
      round.description = 'Team Challenge!';
    } else {
      // All-play
      round.mode = 'all-play';
      round.description = 'Everyone plays!';
    }

    rounds.push(round);
  }

  return rounds;
}
