# Word Scramble Mini-Game Specification

## Overview

Word Scramble is a quick game where players unscramble letters to form Christmas-themed words. Players race against each other and the clock to submit the correct answer.

**Game Type:** Quick game (same category as speed-math, true-false, trivia, spelling)
**Duration:** 60 seconds per round (matches other quick games)

## Gameplay

1. Server generates a scrambled word and sends it to all players
2. Coordinator screen displays the scrambled letters prominently
3. Players type their answer on their phone
4. First correct answer gets 1st place points, second gets 2nd place, etc.
5. Round ends when timer expires or all players have answered correctly

## Age-Adaptive Difficulty

### Word Selection by Age Tier

| Tier | Ages | Word Length | Complexity | Examples |
|------|------|-------------|------------|----------|
| Young | ≤9 | 3-5 letters | Simple, common words | elf, star, snow, gift, tree |
| Middle | 10-12 | 5-7 letters | Moderate vocabulary | candle, tinsel, sleigh, wreath |
| Teen | ≥13 | 7-10 letters | Advanced vocabulary | mistletoe, snowflake, reindeer, ornament |

### Scrambling Rules
- Letters are randomly shuffled
- Ensure scrambled version is different from the answer
- For young tier: keep first letter in place as a hint (optional setting)

## Word Bank

Christmas-themed words organized by difficulty:

```javascript
const wordBank = {
  young: [
    'elf', 'star', 'snow', 'gift', 'tree', 'bell', 'joy', 'red',
    'cold', 'wrap', 'bow', 'hat', 'sled', 'sing', 'card'
  ],
  middle: [
    'candle', 'tinsel', 'sleigh', 'wreath', 'cookie', 'chimney',
    'winter', 'frosty', 'jingle', 'merry', 'bright', 'spirit',
    'giving', 'family', 'garland', 'icicle', 'mitten', 'scarf'
  ],
  teen: [
    'mistletoe', 'snowflake', 'reindeer', 'ornament', 'celebrate',
    'tradition', 'december', 'fireplace', 'gingerbread', 'poinsettia',
    'nutcracker', 'caroling', 'evergreen', 'festive', 'yuletide'
  ]
};
```

## User Interface

### Coordinator Screen (TV)

```
┌─────────────────────────────────────────────┐
│                                             │
│            UNSCRAMBLE THE WORD              │
│                                             │
│         ┌─────────────────────┐             │
│         │   R E T W I N       │             │
│         └─────────────────────┘             │
│                                             │
│              Hint: A season                 │
│                                             │
│         ┌─────┐                             │
│         │ 45  │  (circular timer)           │
│         └─────┘                             │
│                                             │
│   Players answered: 2/4                     │
│                                             │
└─────────────────────────────────────────────┘
```

### Player Screen (Phone)

```
┌─────────────────────────┐
│                         │
│    Unscramble:          │
│                         │
│    R E T W I N          │
│                         │
│    Hint: A season       │
│                         │
│  ┌───────────────────┐  │
│  │ Your answer...    │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │      SUBMIT       │  │
│  └───────────────────┘  │
│                         │
│       0:45 remaining    │
│                         │
└─────────────────────────┘
```

### After Submission

```
┌─────────────────────────┐
│                         │
│    ✓ Answer Submitted   │
│                         │
│    Waiting for others   │
│    or timer to end...   │
│                         │
└─────────────────────────┘
```

## Scoring

Uses the standard placement-based scoring:
- 1st correct answer: 30 points
- 2nd correct answer: 20 points
- 3rd+ correct answer: 10 points
- Wrong/no answer: 0 points

**Team Star:** Awarded if ANY player answers correctly.

## Technical Implementation

### New Files to Create

```
server/data/wordScrambleWords.js    # Word bank by age tier
```

### Files to Modify

```
server/utils/challengeGenerator.js  # Add word-scramble generation
server/utils/answerValidator.js     # Add word-scramble validation
server/index.js                     # Handle word-scramble submissions
server/config/gameConfig.json       # Add word-scramble to quick games
client/src/pages/CoordinatorScreen.jsx  # Add word-scramble display
client/src/pages/PlayerStoryScreen.jsx  # Add word-scramble input
client/src/pages/PreviewGame.jsx    # Add word-scramble preview
```

### Challenge Object Structure

```javascript
{
  gameType: 'word-scramble',
  scrambled: 'RETWIN',        // Scrambled letters (uppercase)
  answer: 'winter',           // Correct answer (lowercase)
  hint: 'A season',           // Optional hint
  difficulty: 'middle',       // Age tier used
  questionNumber: 3,
  totalQuestions: 5
}
```

### Socket Events

Uses existing events:
- `challenge` - Server sends scrambled word to coordinator
- `player-challenge` - Server sends to individual players
- `submit-answer` - Player submits their unscrambled word
- `answer-submitted` - Server acknowledges submission
- `challenge-results` - Server broadcasts results

### Answer Validation

```javascript
function validateWordScramble(submission, challenge) {
  const playerAnswer = submission.toLowerCase().trim();
  const correctAnswer = challenge.answer.toLowerCase();

  return {
    correct: playerAnswer === correctAnswer,
    answer: correctAnswer
  };
}
```

## Scrambling Algorithm

```javascript
function scrambleWord(word) {
  const letters = word.toUpperCase().split('');
  let scrambled;

  // Keep shuffling until we get a different arrangement
  do {
    scrambled = letters.sort(() => Math.random() - 0.5).join('');
  } while (scrambled === word.toUpperCase() && word.length > 1);

  return scrambled;
}
```

## Hints System

Each word can have an optional hint:

```javascript
const wordsWithHints = {
  young: [
    { word: 'elf', hint: 'Santa\'s little helper' },
    { word: 'star', hint: 'Shines on top of the tree' },
    // ...
  ],
  // ...
};
```

## Edge Cases

1. **Single letter words**: Not used (minimum 3 letters)
2. **Palindromes**: Avoided or handled specially
3. **Case sensitivity**: Answers are case-insensitive
4. **Whitespace**: Trimmed before comparison
5. **Duplicate words**: Track used words to avoid repeats in same game

## Testing Checklist

- [ ] Words scramble correctly (different from original)
- [ ] Age-adaptive difficulty works
- [ ] Timer counts down properly
- [ ] Correct answers are validated
- [ ] Scoring follows placement rules
- [ ] Stars awarded for team success
- [ ] Works in preview mode
- [ ] Coordinator display shows scrambled word clearly
- [ ] Player input accepts and submits answer
- [ ] Results screen shows correct answer and placements

## Future Enhancements (Out of Scope)

- Animated letter tiles that can be dragged to rearrange
- Progressive hints that reveal letters over time
- Bonus points for speed
- "Close enough" partial credit for long words
