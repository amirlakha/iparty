# Snake Mini-Game Specification

**Version:** 1.0
**Created:** Dec 26, 2024
**Status:** Draft

---

## Overview

Multiplayer snake game where all players compete on a single shared board displayed on the TV. Players control their snakes from their phones, collecting food for points while trying to survive. Colliding with another snake kills you and triggers a respawn. After 60 seconds, the player with the most points wins.

---

## Game Rules

### Core Mechanics

| Aspect | Rule |
|--------|------|
| **Duration** | 60 seconds |
| **Board** | Single shared board on TV (all snakes visible) |
| **Players** | 2-8 players, each with unique colored snake |
| **Objective** | Collect the most points by eating food |
| **Controls** | Swipe gestures OR D-pad buttons (player choice) |

### Movement
- Snakes move continuously in their current direction
- Players change direction (up/down/left/right) via mobile input
- **Cannot reverse** - can't turn 180° directly (e.g., going right → can't go left immediately)
- Speed is constant for all players (no age-based advantage)

### Collisions

| Collision Type | Result |
|----------------|--------|
| **Wall** | Snake dies, respawns after 3 seconds |
| **Own body** | Snake dies, respawns after 3 seconds |
| **Other snake's body** | Attacking snake dies, respawns after 3 seconds |
| **Head-to-head** | Both snakes die, both respawn after 3 seconds |

### Death Penalty
- Lose **25% of current length** on death (minimum length = 3)
- Lose **5 points** on death
- Respawn at random empty position after 3 seconds
- Brief invincibility (1.5 seconds) after respawn (flashing effect)

### Food & Scoring

| Item | Points | Effect |
|------|--------|--------|
| **Regular Food** | +10 points | Grow snake by 1 segment |
| **Bonus Food** | +25 points | Grow by 2 segments, appears less frequently |

- Food spawns at random empty positions
- 3-5 food items on board at any time (scales with player count)
- When food is eaten, new food spawns after 1-2 seconds

---

## Final Scoring (Placement-Based)

After 60 seconds, players are ranked by total points:

| Placement | Points Awarded |
|-----------|----------------|
| 1st Place | 30 points |
| 2nd Place | 20 points |
| 3rd+ Place | 10 points |

**Team Star:** Awarded if any player collects ≥50 points during the round.

---

## Visual Design

### Board Layout (TV Display)

```
┌──────────────────────────────────────────────────────────┐
│  🐍 SNAKE ARENA                           ⏱️ 0:45        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    🍎                              │  │
│  │      🟢🟢🟢🟢►                                     │  │
│  │                        🍎                          │  │
│  │                                                    │  │
│  │   ▼                                                │  │
│  │   🔵                          🍎    🟡🟡🟡🟡►      │  │
│  │   🔵                                               │  │
│  │   🔵🔵🔵                                           │  │
│  │                     ⭐                              │  │
│  │         🟣🟣🟣🟣🟣►                                 │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  🟢 Alex: 85    🔵 Sam: 60    🟡 Jordan: 45    🟣 Kim: 70 │
└──────────────────────────────────────────────────────────┘
```

### Visual Elements

| Element | Design |
|---------|--------|
| **Snake Head** | Rounded, distinct from body, shows direction |
| **Snake Body** | Rounded segments with slight gaps |
| **Regular Food** | 🍎 Red apple or Christmas cookie |
| **Bonus Food** | ⭐ Golden star (less frequent) |
| **Death Effect** | Explosion particles, fade out |
| **Respawn Effect** | Flashing/pulsing for 1.5 seconds |
| **Walls** | Festive border (candy cane pattern?) |

### Snake Colors (Unique per Player)
```javascript
const SNAKE_COLORS = [
  { primary: '#22c55e', name: 'Green' },   // Player 1
  { primary: '#3b82f6', name: 'Blue' },    // Player 2
  { primary: '#eab308', name: 'Yellow' },  // Player 3
  { primary: '#a855f7', name: 'Purple' },  // Player 4
  { primary: '#f97316', name: 'Orange' },  // Player 5
  { primary: '#ec4899', name: 'Pink' },    // Player 6
  { primary: '#14b8a6', name: 'Teal' },    // Player 7
  { primary: '#f43f5e', name: 'Rose' },    // Player 8
];
```

---

## Mobile Controller UI

### Layout Options

**Swipe Mode:**
```
┌─────────────────────────────────┐
│     🐍 Your Snake: 45 pts      │
│     [Green] ████████████       │
├─────────────────────────────────┤
│                                 │
│      ╔═══════════════════╗      │
│      ║                   ║      │
│      ║  SWIPE TO STEER   ║      │
│      ║      ↑↓←→         ║      │
│      ║                   ║      │
│      ╚═══════════════════╝      │
│                                 │
│   [Switch to D-Pad ⬇️]          │
└─────────────────────────────────┘
```

**D-Pad Mode:**
```
┌─────────────────────────────────┐
│     🐍 Your Snake: 45 pts      │
│     [Green] ████████████       │
├─────────────────────────────────┤
│                                 │
│            [  ⬆️  ]             │
│                                 │
│     [  ⬅️  ]      [  ➡️  ]      │
│                                 │
│            [  ⬇️  ]             │
│                                 │
│   [Switch to Swipe 👆]          │
└─────────────────────────────────┘
```

### Mobile Display Elements
- Current score (prominently displayed)
- Snake color indicator
- Length bar visualization
- Death notification ("💀 Respawning in 3...2...1...")
- Control mode toggle

---

## Technical Architecture

### Board Configuration

```javascript
const SNAKE_CONFIG = {
  // Board dimensions (cells, not pixels)
  BOARD_WIDTH: 30,
  BOARD_HEIGHT: 20,

  // Timing
  GAME_DURATION: 60000,        // 60 seconds
  TICK_RATE: 150,              // Movement every 150ms (6.67 moves/sec)
  RESPAWN_DELAY: 3000,         // 3 seconds
  INVINCIBILITY_DURATION: 1500, // 1.5 seconds post-respawn
  FOOD_RESPAWN_DELAY: 1500,    // 1-2 seconds random

  // Scoring
  REGULAR_FOOD_POINTS: 10,
  BONUS_FOOD_POINTS: 25,
  DEATH_PENALTY_POINTS: 5,
  DEATH_LENGTH_PENALTY: 0.25,  // 25% of current length
  STAR_THRESHOLD: 50,          // Points needed for star

  // Food
  MIN_FOOD_COUNT: 3,
  MAX_FOOD_COUNT: 5,
  BONUS_FOOD_CHANCE: 0.15,     // 15% chance for bonus food

  // Snake
  INITIAL_LENGTH: 3,
  MIN_LENGTH: 3,
};
```

### Server-Side Game State

```javascript
// Game state structure
const snakeGameState = {
  roomCode: 'ABC123',
  board: {
    width: 30,
    height: 20,
  },
  snakes: {
    'player-id-1': {
      id: 'player-id-1',
      name: 'Alex',
      color: '#22c55e',
      segments: [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}], // Head first
      direction: 'right',
      nextDirection: 'right',
      isAlive: true,
      isInvincible: false,
      respawnAt: null,
      score: 45,
    },
    // ... other players
  },
  food: [
    { x: 15, y: 8, type: 'regular' },
    { x: 22, y: 14, type: 'bonus' },
    // ...
  ],
  startTime: 1703587200000,
  gameOver: false,
};
```

### Socket Events

#### Server → Clients

| Event | Payload | Description |
|-------|---------|-------------|
| `snake-game-start` | `{ gameState, playerColor }` | Game initialized |
| `snake-game-tick` | `{ snakes, food, timeRemaining }` | State update (every tick) |
| `snake-player-died` | `{ playerId, killerPlayerId, respawnAt }` | Death notification |
| `snake-player-respawn` | `{ playerId, position }` | Player respawned |
| `snake-food-eaten` | `{ playerId, food, newScore }` | Food consumed |
| `snake-game-end` | `{ finalScores, placements }` | Game over |

#### Clients → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `snake-direction` | `{ roomCode, direction }` | Player input (up/down/left/right) |

### Server Game Loop

```javascript
// Pseudocode for game tick (runs every 150ms)
function gameTick(gameState) {
  for (const snake of Object.values(gameState.snakes)) {
    if (!snake.isAlive) {
      // Check if respawn time reached
      if (Date.now() >= snake.respawnAt) {
        respawnSnake(snake, gameState);
      }
      continue;
    }

    // Apply queued direction change
    snake.direction = snake.nextDirection;

    // Calculate new head position
    const newHead = getNextPosition(snake.segments[0], snake.direction);

    // Check wall collision
    if (isOutOfBounds(newHead, gameState.board)) {
      killSnake(snake, null, gameState);
      continue;
    }

    // Check self collision
    if (collidesWithSelf(newHead, snake)) {
      killSnake(snake, null, gameState);
      continue;
    }

    // Check collision with other snakes
    const hitSnake = checkOtherSnakeCollision(newHead, snake, gameState);
    if (hitSnake) {
      if (hitSnake.isHead) {
        // Head-to-head: both die
        killSnake(snake, hitSnake.snake.id, gameState);
        killSnake(hitSnake.snake, snake.id, gameState);
      } else {
        // Hit body: attacker dies
        killSnake(snake, hitSnake.snake.id, gameState);
      }
      continue;
    }

    // Move snake (add new head)
    snake.segments.unshift(newHead);

    // Check food collision
    const eatenFood = checkFoodCollision(newHead, gameState.food);
    if (eatenFood) {
      snake.score += eatenFood.type === 'bonus'
        ? SNAKE_CONFIG.BONUS_FOOD_POINTS
        : SNAKE_CONFIG.REGULAR_FOOD_POINTS;

      // Grow snake (don't remove tail)
      if (eatenFood.type === 'bonus') {
        // Bonus: grow by 2 (already added head, keep 2 tail segments)
        // Actually: add another segment
        snake.segments.push({...snake.segments[snake.segments.length - 1]});
      }

      // Remove food and schedule respawn
      removeFoodAndScheduleRespawn(eatenFood, gameState);
    } else {
      // Normal movement: remove tail
      snake.segments.pop();
    }
  }

  // Broadcast updated state
  broadcastGameTick(gameState);
}
```

---

## Integration Points

### Challenge Generator Addition

```javascript
// In server/utils/challengeGenerator.js

case 'snake': {
  return {
    ...baseChallenge,
    type: 'snake',
    gameType: 'snake',
    timeLimit: 60000,
    board: {
      width: SNAKE_CONFIG.BOARD_WIDTH,
      height: SNAKE_CONFIG.BOARD_HEIGHT,
    },
    answerType: 'interactive',
    validationOptions: {},
  };
}
```

### New File: snakeLogic.js

Create `server/utils/snakeLogic.js` with:
- `initializeGame(players)` - Set up initial state
- `processDirection(gameState, playerId, direction)` - Queue direction change
- `gameTick(gameState)` - Process one game tick
- `killSnake(snake, killerId, gameState)` - Handle death
- `respawnSnake(snake, gameState)` - Handle respawn
- `spawnFood(gameState)` - Add new food
- `calculatePlacements(gameState)` - Final scoring

### Coordinator Screen Display

```jsx
// In CoordinatorScreen.jsx - CHALLENGE_ACTIVE state

{currentChallenge.gameType === 'snake' && (
  <SnakeGameBoard
    snakes={snakeGameState.snakes}
    food={snakeGameState.food}
    boardWidth={30}
    boardHeight={20}
    timeRemaining={timeRemaining}
  />
)}
```

### Player Screen Controls

```jsx
// In PlayerStoryScreen.jsx - CHALLENGE_ACTIVE state

{challengeData.gameType === 'snake' && (
  <SnakeController
    controlMode={controlMode}
    onDirectionChange={handleSnakeDirection}
    playerScore={snakePlayerState.score}
    playerColor={snakePlayerState.color}
    isAlive={snakePlayerState.isAlive}
    respawnCountdown={respawnCountdown}
  />
)}
```

---

## Theming

**Game Title:** "Snake Arena" or "Christmas Snake Chase"

**TV Header:** 🐍 SNAKE ARENA

**Food Theming (Christmas/Winter):**
- Regular Food: 🍎 Apples, 🎁 Small presents, or ❄️ Snowflakes
- Bonus Food: ⭐ Golden stars

**Note:** This game can appear in any of the 5 workshop sections. Theming is generic Christmas/winter so it fits anywhere in the story.

---

## Implementation Checklist

### Server-Side
- [ ] Create `server/utils/snakeLogic.js` with game logic
- [ ] Add 'snake' case to `challengeGenerator.js`
- [ ] Add socket event handlers in `index.js`:
  - [ ] `snake-direction` input handler
  - [ ] Game tick interval management
  - [ ] Game end handling → scoring → gradeAndAdvance()
- [ ] Integration with FlowCoordinator (cancel auto-advance like Connect4)

### Client-Side (Coordinator)
- [ ] Create `SnakeGameBoard.jsx` component
- [ ] Snake rendering with colors and direction indicators
- [ ] Food rendering with animations
- [ ] Death/respawn visual effects
- [ ] Scoreboard display
- [ ] Timer integration

### Client-Side (Player)
- [ ] Create `SnakeController.jsx` component
- [ ] Swipe gesture detection
- [ ] D-pad button controls
- [ ] Control mode toggle
- [ ] Score display
- [ ] Death/respawn state handling
- [ ] Socket event handling

### Visual Polish
- [ ] Snake head directional sprites
- [ ] Smooth movement interpolation (optional)
- [ ] Food spawn animation
- [ ] Death explosion effect
- [ ] Respawn flash effect
- [ ] Victory celebration

---

## Testing Scenarios

1. **2 Players** - Basic collision and food competition
2. **4+ Players** - Crowded board chaos
3. **Head-to-head collision** - Both die correctly
4. **Respawn invincibility** - No immediate re-death
5. **Wall collision** - Proper death trigger
6. **Full game duration** - 60 seconds, scoring works
7. **Control modes** - Swipe and D-pad both work
8. **Rapid direction changes** - No 180° reversal allowed

---

## Open Questions / Future Enhancements

1. **Power-ups?** (Speed boost, invincibility, shrink others) - Decided: Not for v1
2. **Kill rewards?** - Consider: +5 points for killing another snake?
3. **Wraparound walls?** - Snake exits one side, enters opposite?
4. **Speed increase?** - Snake speeds up as it grows or over time?
5. **Obstacles?** - Static obstacles on board for added challenge?

---

**Ready for implementation approval.**
