# Memory Match Mini-Game Specification

## Overview

Memory Match is a team-based card-flipping game where players work together to find matching pairs of Christmas-themed images. Players take turns flipping two cards at a time, trying to remember where images are located.

**Game Type:** Long game (same category as connect4, snake)
**Duration:** No time limit - game ends when all pairs are found (like Connect 4)

## Gameplay

1. A grid of face-down cards is displayed on the coordinator screen
2. Players take turns (round-robin) selecting two cards to flip
3. If cards match, they stay face-up and the player scores points
4. If cards don't match, they flip back face-down after 2 seconds
5. Game ends when all pairs are found
6. Team always earns a star (game always completes)

## Grid Configuration

**Fixed grid:** 6 columns × 5 rows = 30 cards = 15 pairs

## Timing

**Fixed timing for all games:**
- **Card reveal time:** 2 seconds (how long non-matching cards stay visible)
- **Turn time limit:** 15 seconds (to select both cards)

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
┌───────────────────────────────────────────────────────────────┐
│                       MEMORY MATCH                            │
│                                                               │
│   Current Turn: Player 1 (Alex)         Turn Time: 12s       │
│                                                               │
│   ┌────┬────┬────┬────┬────┬────┐                            │
│   │ 🎄 │[??]│ ?? │ ?? │ 🎄 │ ?? │  ← [??] = cursor position  │
│   ├────┼────┼────┼────┼────┼────┤                            │
│   │ ?? │ ?? │ 🎅 │ ?? │ ?? │ ?? │                            │
│   ├────┼────┼────┼────┼────┼────┤                            │
│   │ ?? │ ?? │ ?? │ ?? │ ?? │ ?? │                            │
│   ├────┼────┼────┼────┼────┼────┤                            │
│   │ ?? │ 🎅 │ ?? │ ?? │ ?? │ ?? │                            │
│   ├────┼────┼────┼────┼────┼────┤                            │
│   │ ?? │ ?? │ ?? │ ?? │ ?? │ ?? │                            │
│   └────┴────┴────┴────┴────┴────┘                            │
│                                                               │
│   Pairs Found: 2/15               Use arrows to move cursor  │
│                                                               │
│   Scores:  Alex: 40  |  Sam: 20  |  Jo: 30                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Player Screen (Phone) - Active Turn

```
┌─────────────────────────┐
│                         │
│       YOUR TURN!        │
│                         │
│  Use arrows to move     │
│  cursor on TV screen    │
│                         │
│         ┌───┐           │
│         │ ↑ │           │
│     ┌───┼───┼───┐       │
│     │ ← │   │ → │       │
│     └───┼───┼───┘       │
│         │ ↓ │           │
│         └───┘           │
│                         │
│    ┌─────────────┐      │
│    │   SELECT    │      │
│    └─────────────┘      │
│                         │
│    Turn Time: 12s       │
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
│   Pairs found: 2/15     │
│                         │
│   Your score: 30 pts    │
│                         │
└─────────────────────────┘
```

## Turn Flow

1. **Turn Start**: Server assigns current player, starts 15s turn timer, cursor appears at top-left
2. **Navigation**: Player uses arrow buttons on phone to move cursor on TV
3. **First Card**: Player presses SELECT, card flips face-up, cursor moves to next unflipped card
4. **Second Card**: Player navigates and presses SELECT again, second card flips face-up
5. **Evaluation**:
   - Match: Cards stay up, player scores, next player's turn
   - No Match: Cards shown for 2 seconds, then flip back down
6. **Next Turn**: Server assigns next player in rotation, cursor resets

## Scoring

### Mini-Game Points (used to determine placement)
- Finding a match: **10 points**
- Turn timeout (no selection): **0 points**, turn passes

### Game Points (awarded at end based on placement)
| Placement | Points |
|-----------|--------|
| 1st | 30 |
| 2nd | 20 |
| 3rd+ | 10 |

**Ties:** Players with equal mini-game points share placement (Olympic-style). Both get the same game points, next placement is skipped.

Example: A=50, B=50, C=30, D=20 → A & B tie 1st (30 pts each), C=3rd (10 pts), D=4th (10 pts)

### Team Star
- Star **always awarded** (game always completes, same as Connect 4)

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
  gridSize: { rows: 5, cols: 6 },  // Fixed: 6x5 grid
  cursorPosition: { row: 0, col: 0 },  // Current cursor location
  currentPlayer: 'player-socket-id',
  currentPlayerName: 'Alex',
  turnOrder: ['player1-id', 'player2-id', 'player3-id'],
  turnIndex: 0,
  selectedCards: [],           // 0, 1, or 2 cards currently flipped this turn
  pairsFound: 2,
  totalPairs: 15,              // Fixed: 15 pairs
  revealTime: 2000,            // Fixed: 2 seconds
  turnTimeLimit: 15000,        // Fixed: 15 seconds
  scores: { 'player1-id': 40, 'player2-id': 20 }  // Mini-game points (10 per match)
}
```

### Socket Events

**New Events:**
- `memory-match-state` - Server sends full board state to coordinator (includes cursor position)
- `memory-match-player-state` - Server sends player-specific view (is it your turn?)
- `memory-match-move` - Player sends arrow direction (up/down/left/right)
- `memory-match-select` - Player presses SELECT to flip card at cursor
- `memory-match-cursor-update` - Server broadcasts new cursor position to coordinator
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
1. Server generates board, assigns turn order, cursor starts at (0,0)
2. Server emits 'memory-match-state' to coordinator (board + cursor)
3. Server emits 'memory-match-player-state' to current player (your turn!)
4. Player moves cursor → 'memory-match-move' (direction)
5. Server updates cursor → 'memory-match-cursor-update'
6. Player presses SELECT → 'memory-match-select'
7. Server flips card 1 → 'memory-match-flip'
8. Player moves cursor and presses SELECT again
9. Server flips card 2 → 'memory-match-flip'
10. Server evaluates match → 'memory-match-result'
    - Match: Update scores, cards stay flipped
    - No match: Wait 2 seconds, flip cards back
11. Server advances turn → 'memory-match-turn-change', cursor resets
12. Repeat until all pairs found
13. Server emits 'memory-match-complete' with final scores, star awarded
```

## Edge Cases

1. **Player disconnects during turn**: Skip to next player, rejoin gets their turn in rotation
2. **Turn timeout (15s)**: Flip back any revealed card, move to next player
3. **Last pair found**: Game ends immediately, team earns star, show celebration
4. **Single player**: No turn rotation, continuous play

## Testing Checklist

- [ ] Board generates with 15 pairs (6x5 grid)
- [ ] Cards shuffle properly (pairs not adjacent)
- [ ] Turn rotation works correctly
- [ ] Arrow keys move cursor on TV screen
- [ ] SELECT button flips card at cursor position
- [ ] Card flip animation works (0.5s 3D rotate)
- [ ] Match detection works
- [ ] Non-matching cards flip back after 2 seconds + 0.5s animation
- [ ] Player earns 10 mini-game points when finding a pair
- [ ] Placement-based game points awarded at end (30/20/10)
- [ ] Ties handled correctly (Olympic-style, shared placement)
- [ ] Turn timer (15 seconds) works - skips to next player on timeout
- [ ] Game ends when all 15 pairs found (star always awarded)
- [ ] Works in preview mode
- [ ] Multiple players can play simultaneously

## Card Flip Animation

Cards use CSS 3D transforms for a realistic flip effect:

```css
.card {
  transform-style: preserve-3d;
  transition: transform 0.5s ease-in-out;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-front {
  /* Back of card - showing ?? or decorative pattern */
}

.card-back {
  transform: rotateY(180deg);
  /* Front of card - showing emoji */
}
```

**Animation timing:**
- Flip duration: 0.5 seconds
- Server waits for flip animation before evaluating match
- Non-matching cards wait 2 seconds (visible) + 0.5 seconds (flip back)

## Future Enhancements (Out of Scope)

- Sound effects for match/no-match
- Power-ups (peek at a card, extra time)
- Difficulty modes (fewer/more pairs)
- Themed card sets (different holidays)
