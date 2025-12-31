# Memory Match Mini-Game Specification

## Overview

Memory Match is a team-based card-flipping game where players work together to find matching pairs of Christmas-themed images. Players take turns flipping two cards at a time, trying to remember where images are located.

**Game Type:** Long game (same category as connect4, snake)
**Duration:** 2-3 minutes or until all pairs are found

## Gameplay

1. A grid of face-down cards is displayed on the coordinator screen
2. Players take turns (round-robin) selecting two cards to flip
3. If cards match, they stay face-up and the player scores points
4. If cards don't match, they flip back face-down after a brief delay
5. Game ends when all pairs are found or time runs out
6. Team earns a star if they find at least 60% of pairs

## Grid Configuration

### By Number of Players

| Players | Grid Size | Total Cards | Pairs |
|---------|-----------|-------------|-------|
| 1-2     | 4x4       | 16          | 8     |
| 3-4     | 4x5       | 20          | 10    |
| 5+      | 5x6       | 30          | 15    |

### Age-Adaptive Timing

| Tier | Ages | Card Reveal Time | Turn Time Limit |
|------|------|------------------|-----------------|
| Young | ≤9 | 2.0 seconds | 15 seconds |
| Middle | 10-12 | 1.5 seconds | 12 seconds |
| Teen | ≥13 | 1.0 seconds | 10 seconds |

## Card Images

Christmas-themed images (emoji or simple graphics):

```javascript
const cardImages = [
  { id: 'santa', emoji: '🎅', name: 'Santa' },
  { id: 'tree', emoji: '🎄', name: 'Christmas Tree' },
  { id: 'gift', emoji: '🎁', name: 'Gift' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'snowman', emoji: '⛄', name: 'Snowman' },
  { id: 'reindeer', emoji: '🦌', name: 'Reindeer' },
  { id: 'bell', emoji: '🔔', name: 'Bell' },
  { id: 'candy', emoji: '🍬', name: 'Candy' },
  { id: 'snowflake', emoji: '❄️', name: 'Snowflake' },
  { id: 'angel', emoji: '👼', name: 'Angel' },
  { id: 'candle', emoji: '🕯️', name: 'Candle' },
  { id: 'stocking', emoji: '🧦', name: 'Stocking' },
  { id: 'sleigh', emoji: '🛷', name: 'Sleigh' },
  { id: 'gingerbread', emoji: '🍪', name: 'Gingerbread' },
  { id: 'wreath', emoji: '🎀', name: 'Wreath' }
];
```

## User Interface

### Coordinator Screen (TV)

```
┌─────────────────────────────────────────────────────────┐
│                    MEMORY MATCH                         │
│                                                         │
│   Current Turn: Player 1 (Alex)         Time: 1:45     │
│                                                         │
│   ┌────┬────┬────┬────┬────┐                           │
│   │ 🎄 │ ?? │ ?? │ ?? │ 🎄 │                           │
│   ├────┼────┼────┼────┼────┤                           │
│   │ ?? │ ?? │ 🎅 │ ?? │ ?? │                           │
│   ├────┼────┼────┼────┼────┤                           │
│   │ ?? │ ?? │ ?? │ ?? │ ?? │                           │
│   ├────┼────┼────┼────┼────┤                           │
│   │ ?? │ 🎅 │ ?? │ ?? │ ?? │                           │
│   └────┴────┴────┴────┴────┘                           │
│                                                         │
│   Pairs Found: 2/10          Select a card!            │
│                                                         │
│   Scores:  Alex: 40  |  Sam: 20  |  Jo: 30             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Player Screen (Phone) - Active Turn

```
┌─────────────────────────┐
│                         │
│      YOUR TURN!         │
│                         │
│   Select a card:        │
│                         │
│  ┌───┬───┬───┬───┬───┐  │
│  │ ✓ │ 1 │ 2 │ 3 │ ✓ │  │
│  ├───┼───┼───┼───┼───┤  │
│  │ 4 │ 5 │ 6 │ 7 │ 8 │  │
│  ├───┼───┼───┼───┼───┤  │
│  │ 9 │10 │11 │12 │13 │  │
│  ├───┼───┼───┼───┼───┤  │
│  │14 │ 6 │15 │16 │17 │  │
│  └───┴───┴───┴───┴───┘  │
│                         │
│      Time: 8 seconds    │
│                         │
└─────────────────────────┘
```

### Player Screen (Phone) - Waiting

```
┌─────────────────────────┐
│                         │
│   Alex's turn...        │
│                         │
│   Watch the TV screen   │
│                         │
│   Pairs found: 2/10     │
│                         │
│   Your score: 30 pts    │
│                         │
└─────────────────────────┘
```

## Turn Flow

1. **Turn Start**: Server assigns current player, starts turn timer
2. **First Card**: Player selects first card, it flips face-up on coordinator
3. **Second Card**: Player selects second card, it flips face-up
4. **Evaluation**:
   - Match: Cards stay up, player scores, same player continues (optional) or next player
   - No Match: Cards shown briefly, then flip back down
5. **Next Turn**: Server assigns next player in rotation

## Scoring

### Individual Points
- Finding a match: **20 points**
- Bonus for consecutive matches: **+10 points** per streak
- Turn timeout (no selection): **0 points**, turn passes

### Team Star
- Star awarded if team finds **≥60% of pairs** before time runs out
- Example: 10 pairs → need 6+ matches for star

## Technical Implementation

### New Files to Create

```
server/utils/memoryMatchLogic.js    # Board setup, match detection, turn management
```

### Files to Modify

```
server/utils/challengeGenerator.js  # Add memory-match generation
server/index.js                     # Handle memory-match events, game state
server/config/gameConfig.json       # Add memory-match to long games
client/src/pages/CoordinatorScreen.jsx  # Add memory-match board display
client/src/pages/PlayerStoryScreen.jsx  # Add card selection UI
client/src/pages/PreviewGame.jsx    # Add memory-match preview
```

### Game State Structure

```javascript
{
  gameType: 'memory-match',
  board: [
    { id: 0, imageId: 'santa', flipped: false, matched: false },
    { id: 1, imageId: 'tree', flipped: false, matched: false },
    // ... all cards
  ],
  gridSize: { rows: 4, cols: 5 },
  currentPlayer: 'player-socket-id',
  currentPlayerName: 'Alex',
  turnOrder: ['player1-id', 'player2-id', 'player3-id'],
  turnIndex: 0,
  selectedCards: [],           // 0, 1, or 2 cards currently selected
  pairsFound: 2,
  totalPairs: 10,
  revealTime: 1500,            // ms to show non-matching cards
  turnTimeLimit: 12000,        // ms per turn
  scores: { 'player1-id': 40, 'player2-id': 20 },
  streak: 0                    // consecutive matches by current player
}
```

### Socket Events

**New Events:**
- `memory-match-state` - Server sends full board state to coordinator
- `memory-match-player-state` - Server sends player-specific view
- `memory-match-select` - Player selects a card
- `memory-match-flip` - Server broadcasts card flip
- `memory-match-result` - Server broadcasts match/no-match result
- `memory-match-turn-change` - Server announces next player's turn
- `memory-match-complete` - Game finished

### Board Generation

```javascript
function generateMemoryBoard(numPairs) {
  // Select random images
  const selectedImages = shuffleArray(cardImages).slice(0, numPairs);

  // Create pairs
  const cards = [];
  selectedImages.forEach((img, index) => {
    cards.push({ id: index * 2, imageId: img.id, flipped: false, matched: false });
    cards.push({ id: index * 2 + 1, imageId: img.id, flipped: false, matched: false });
  });

  // Shuffle card positions
  return shuffleArray(cards);
}
```

### Match Detection

```javascript
function checkMatch(card1, card2) {
  return card1.imageId === card2.imageId;
}
```

## Game Flow Sequence

```
1. Server generates board, assigns turn order
2. Server emits 'memory-match-state' to coordinator
3. Server emits 'memory-match-player-state' to current player (with selectable cards)
4. Player selects card 1 → 'memory-match-select'
5. Server flips card 1 → 'memory-match-flip'
6. Player selects card 2 → 'memory-match-select'
7. Server flips card 2 → 'memory-match-flip'
8. Server evaluates match → 'memory-match-result'
   - Match: Update scores, cards stay flipped
   - No match: Wait revealTime, flip cards back
9. Server advances turn → 'memory-match-turn-change'
10. Repeat until all pairs found or time expires
11. Server emits 'memory-match-complete' with final scores
```

## Edge Cases

1. **Player disconnects during turn**: Skip to next player, rejoin gets their turn in rotation
2. **Turn timeout**: Flip back any revealed card, move to next player
3. **Last pair**: Game ends immediately, show celebration
4. **Time runs out**: Game ends, calculate star based on pairs found
5. **Single player**: No turn rotation, continuous play

## Testing Checklist

- [ ] Board generates with correct number of pairs
- [ ] Cards shuffle properly (pairs not adjacent)
- [ ] Turn rotation works correctly
- [ ] Card flipping displays on coordinator screen
- [ ] Match detection works
- [ ] Non-matching cards flip back after delay
- [ ] Scores update correctly
- [ ] Streak bonus applies
- [ ] Turn timer works
- [ ] Game ends when all pairs found
- [ ] Game ends when time expires
- [ ] Star awarded based on pairs found
- [ ] Works in preview mode
- [ ] Multiple players can play simultaneously

## Future Enhancements (Out of Scope)

- Flip animation effects
- Sound effects for match/no-match
- Power-ups (peek at a card, extra time)
- Difficulty modes (fewer/more pairs)
- Themed card sets (different holidays)
