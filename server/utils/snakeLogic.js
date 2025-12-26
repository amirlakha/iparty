/**
 * Snake Game Logic
 * Multiplayer snake arena with shared board
 */

// Board dimensions (cells)
const BOARD_WIDTH = 30;
const BOARD_HEIGHT = 20;

// Timing (milliseconds)
const GAME_DURATION = 60000;
const TICK_RATE = 150;
const RESPAWN_DELAY = 3000;
const INVINCIBILITY_DURATION = 1500;
const FOOD_RESPAWN_DELAY = 1500;

// Scoring
const REGULAR_FOOD_POINTS = 10;
const BONUS_FOOD_POINTS = 25;
const DEATH_PENALTY_POINTS = 5;
const DEATH_LENGTH_PENALTY = 0.25;
const STAR_THRESHOLD = 50;

// Food
const MIN_FOOD_COUNT = 3;
const MAX_FOOD_COUNT = 5;
const BONUS_FOOD_CHANCE = 0.15;

// Snake
const INITIAL_LENGTH = 3;
const MIN_LENGTH = 3;

// Snake colors (unique per player)
const SNAKE_COLORS = [
  { primary: '#22c55e', name: 'Green' },
  { primary: '#3b82f6', name: 'Blue' },
  { primary: '#eab308', name: 'Yellow' },
  { primary: '#a855f7', name: 'Purple' },
  { primary: '#f97316', name: 'Orange' },
  { primary: '#ec4899', name: 'Pink' },
  { primary: '#14b8a6', name: 'Teal' },
  { primary: '#f43f5e', name: 'Rose' },
];

// Direction vectors
const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// Opposite directions (can't reverse)
const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/**
 * Initialize a new snake game
 * @param {Array} players - Array of player objects with {id, name, age}
 * @returns {Object} Initial game state
 */
function initializeGame(players) {
  const snakes = {};

  // Create snake for each player
  players.forEach((player, index) => {
    const color = SNAKE_COLORS[index % SNAKE_COLORS.length];
    const startPos = getSpawnPosition(index, players.length);
    const direction = getInitialDirection(startPos);

    snakes[player.id] = {
      id: player.id,
      name: player.name,
      color: color.primary,
      colorName: color.name,
      segments: generateInitialSegments(startPos, direction),
      direction,
      nextDirection: direction,
      isAlive: true,
      isInvincible: false,
      invincibleUntil: null,
      respawnAt: null,
      score: 0,
    };
  });

  // Generate initial food
  const food = [];
  const foodCount = Math.min(MIN_FOOD_COUNT + Math.floor(players.length / 2), MAX_FOOD_COUNT);
  for (let i = 0; i < foodCount; i++) {
    food.push(spawnFood(snakes, food));
  }

  return {
    board: {
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
    },
    snakes,
    food,
    startTime: null,
    gameOver: false,
    config: {
      tickRate: TICK_RATE,
      gameDuration: GAME_DURATION,
      respawnDelay: RESPAWN_DELAY,
      invincibilityDuration: INVINCIBILITY_DURATION,
    },
  };
}

/**
 * Get spawn position for player based on index
 */
function getSpawnPosition(playerIndex, totalPlayers) {
  // Distribute players around the board edges
  const positions = [
    { x: 5, y: 5 },
    { x: BOARD_WIDTH - 6, y: 5 },
    { x: 5, y: BOARD_HEIGHT - 6 },
    { x: BOARD_WIDTH - 6, y: BOARD_HEIGHT - 6 },
    { x: Math.floor(BOARD_WIDTH / 2), y: 3 },
    { x: Math.floor(BOARD_WIDTH / 2), y: BOARD_HEIGHT - 4 },
    { x: 3, y: Math.floor(BOARD_HEIGHT / 2) },
    { x: BOARD_WIDTH - 4, y: Math.floor(BOARD_HEIGHT / 2) },
  ];

  return positions[playerIndex % positions.length];
}

/**
 * Get initial direction based on spawn position
 */
function getInitialDirection(pos) {
  // Point toward center
  if (pos.x < BOARD_WIDTH / 2) {
    return 'right';
  }
  return 'left';
}

/**
 * Generate initial snake segments
 */
function generateInitialSegments(headPos, direction) {
  const segments = [{ ...headPos }];
  const oppositeDir = DIRECTIONS[OPPOSITE[direction]];

  for (let i = 1; i < INITIAL_LENGTH; i++) {
    segments.push({
      x: headPos.x + oppositeDir.x * i,
      y: headPos.y + oppositeDir.y * i,
    });
  }

  return segments;
}

/**
 * Spawn food at random empty position
 */
function spawnFood(snakes, existingFood) {
  const occupied = new Set();

  // Mark snake positions
  Object.values(snakes).forEach(snake => {
    if (snake.isAlive) {
      snake.segments.forEach(seg => {
        occupied.add(`${seg.x},${seg.y}`);
      });
    }
  });

  // Mark existing food positions
  existingFood.forEach(f => {
    occupied.add(`${f.x},${f.y}`);
  });

  // Find empty position
  let attempts = 0;
  while (attempts < 100) {
    const x = Math.floor(Math.random() * BOARD_WIDTH);
    const y = Math.floor(Math.random() * BOARD_HEIGHT);

    if (!occupied.has(`${x},${y}`)) {
      return {
        x,
        y,
        type: Math.random() < BONUS_FOOD_CHANCE ? 'bonus' : 'regular',
        id: `food-${Date.now()}-${Math.random()}`,
      };
    }
    attempts++;
  }

  // Fallback to center if can't find empty spot
  return {
    x: Math.floor(BOARD_WIDTH / 2),
    y: Math.floor(BOARD_HEIGHT / 2),
    type: 'regular',
    id: `food-${Date.now()}-${Math.random()}`,
  };
}

/**
 * Queue direction change for a snake
 * @returns {boolean} Whether the direction was accepted
 */
function processDirection(gameState, playerId, newDirection) {
  const snake = gameState.snakes[playerId];
  if (!snake || !snake.isAlive) return false;

  // Validate direction
  if (!DIRECTIONS[newDirection]) return false;

  // Can't reverse (opposite of current direction)
  if (OPPOSITE[snake.direction] === newDirection) return false;

  snake.nextDirection = newDirection;
  return true;
}

/**
 * Process one game tick
 * @returns {Object} Tick result with events
 */
function gameTick(gameState) {
  const now = Date.now();
  const events = [];

  // Check if game is over
  if (gameState.gameOver) {
    return { events, gameOver: true };
  }

  // Check game duration
  if (gameState.startTime && now - gameState.startTime >= GAME_DURATION) {
    gameState.gameOver = true;
    return { events: [{ type: 'game-end' }], gameOver: true };
  }

  // Take a snapshot of all snake positions BEFORE any movement
  // This prevents race conditions where processed snakes move before others check collision
  const snakePositionsSnapshot = {};
  Object.values(gameState.snakes).forEach(snake => {
    if (snake.isAlive) {
      snakePositionsSnapshot[snake.id] = {
        segments: snake.segments.map(seg => ({ ...seg })),
        direction: snake.direction,
        isInvincible: snake.isInvincible,
      };
    }
  });

  // Process each snake
  Object.values(gameState.snakes).forEach(snake => {
    // Handle respawn
    if (!snake.isAlive && snake.respawnAt && now >= snake.respawnAt) {
      respawnSnake(snake, gameState);
      events.push({
        type: 'respawn',
        playerId: snake.id,
        position: snake.segments[0],
      });
    }

    if (!snake.isAlive) return;

    // Check invincibility expiry
    if (snake.isInvincible && now >= snake.invincibleUntil) {
      snake.isInvincible = false;
    }

    // Apply queued direction
    snake.direction = snake.nextDirection;

    // Calculate new head position
    const dir = DIRECTIONS[snake.direction];
    const newHead = {
      x: snake.segments[0].x + dir.x,
      y: snake.segments[0].y + dir.y,
    };

    // Check wall collision
    if (isOutOfBounds(newHead)) {
      killSnake(snake, null, gameState, now);
      events.push({
        type: 'death',
        playerId: snake.id,
        cause: 'wall',
        respawnAt: snake.respawnAt,
      });
      return;
    }

    // Check self collision
    if (collidesWithSelf(newHead, snake)) {
      killSnake(snake, null, gameState, now);
      events.push({
        type: 'death',
        playerId: snake.id,
        cause: 'self',
        respawnAt: snake.respawnAt,
      });
      return;
    }

    // Check collision with other snakes (using snapshot to avoid race conditions)
    const collision = checkOtherSnakeCollision(newHead, snake, gameState, snakePositionsSnapshot);
    if (collision && !snake.isInvincible) {
      if (collision.isHeadOn) {
        // Both die in head-on collision
        killSnake(snake, collision.otherId, gameState, now);
        killSnake(gameState.snakes[collision.otherId], snake.id, gameState, now);
        events.push({
          type: 'death',
          playerId: snake.id,
          cause: 'head-on',
          killerId: collision.otherId,
          respawnAt: snake.respawnAt,
        });
        events.push({
          type: 'death',
          playerId: collision.otherId,
          cause: 'head-on',
          killerId: snake.id,
          respawnAt: gameState.snakes[collision.otherId].respawnAt,
        });
      } else {
        // Attacker dies hitting body
        killSnake(snake, collision.otherId, gameState, now);
        events.push({
          type: 'death',
          playerId: snake.id,
          cause: 'collision',
          killerId: collision.otherId,
          respawnAt: snake.respawnAt,
        });
      }
      return;
    }

    // Move snake (add new head)
    snake.segments.unshift(newHead);

    // Check food collision
    const eatenFood = checkFoodCollision(newHead, gameState.food);
    if (eatenFood) {
      const points = eatenFood.type === 'bonus' ? BONUS_FOOD_POINTS : REGULAR_FOOD_POINTS;
      snake.score += points;

      events.push({
        type: 'food-eaten',
        playerId: snake.id,
        food: eatenFood,
        points,
        newScore: snake.score,
      });

      // Grow snake (bonus grows by 2)
      if (eatenFood.type === 'bonus') {
        snake.segments.push({ ...snake.segments[snake.segments.length - 1] });
      }
      // Regular food: already added head, don't remove tail = grow by 1

      // Remove eaten food and schedule respawn
      gameState.food = gameState.food.filter(f => f.id !== eatenFood.id);

      // Schedule food respawn
      setTimeout(() => {
        if (!gameState.gameOver && gameState.food.length < MAX_FOOD_COUNT) {
          const newFood = spawnFood(gameState.snakes, gameState.food);
          gameState.food.push(newFood);
        }
      }, FOOD_RESPAWN_DELAY);
    } else {
      // Normal movement: remove tail
      snake.segments.pop();
    }
  });

  return { events, gameOver: false };
}

/**
 * Check if position is out of bounds
 */
function isOutOfBounds(pos) {
  return pos.x < 0 || pos.x >= BOARD_WIDTH || pos.y < 0 || pos.y >= BOARD_HEIGHT;
}

/**
 * Check if snake collides with itself
 */
function collidesWithSelf(newHead, snake) {
  // Check all segments except last (it will move)
  for (let i = 0; i < snake.segments.length - 1; i++) {
    if (snake.segments[i].x === newHead.x && snake.segments[i].y === newHead.y) {
      return true;
    }
  }
  return false;
}

/**
 * Check collision with other snakes
 * Uses snapshot of positions to avoid race conditions from processing order
 * @returns {Object|null} { otherId, isHeadOn } or null
 */
function checkOtherSnakeCollision(newHead, snake, gameState, snapshot) {
  for (const other of Object.values(gameState.snakes)) {
    if (other.id === snake.id || !other.isAlive) continue;

    // Use snapshot data if available (for consistent collision detection)
    const otherData = snapshot && snapshot[other.id];
    if (!otherData) continue; // Snake wasn't alive at start of tick

    // Skip if the other snake was invincible at the start of the tick
    if (otherData.isInvincible) continue;

    const otherSegments = otherData.segments;
    const otherDirection = otherData.direction;

    // Check head-on collision (both snakes moving to same position)
    const otherDir = DIRECTIONS[otherDirection];
    const otherNextHead = {
      x: otherSegments[0].x + otherDir.x,
      y: otherSegments[0].y + otherDir.y,
    };

    if (newHead.x === otherNextHead.x && newHead.y === otherNextHead.y) {
      return { otherId: other.id, isHeadOn: true };
    }

    // Check collision with other's current head position (from snapshot)
    if (newHead.x === otherSegments[0].x && newHead.y === otherSegments[0].y) {
      return { otherId: other.id, isHeadOn: true };
    }

    // Check collision with other's body (from snapshot)
    for (let i = 1; i < otherSegments.length; i++) {
      if (newHead.x === otherSegments[i].x && newHead.y === otherSegments[i].y) {
        return { otherId: other.id, isHeadOn: false };
      }
    }
  }
  return null;
}

/**
 * Check if head collides with any food
 */
function checkFoodCollision(head, food) {
  return food.find(f => f.x === head.x && f.y === head.y) || null;
}

/**
 * Kill a snake
 */
function killSnake(snake, killerId, gameState, now) {
  snake.isAlive = false;
  snake.isInvincible = false;

  // Apply death penalty
  snake.score = Math.max(0, snake.score - DEATH_PENALTY_POINTS);

  // Reduce length
  const newLength = Math.max(MIN_LENGTH, Math.floor(snake.segments.length * (1 - DEATH_LENGTH_PENALTY)));
  snake.segments = snake.segments.slice(0, newLength);

  // Schedule respawn
  snake.respawnAt = now + RESPAWN_DELAY;
}

/**
 * Respawn a snake at a random position
 */
function respawnSnake(snake, gameState) {
  const occupied = new Set();

  // Mark all snake positions
  Object.values(gameState.snakes).forEach(s => {
    if (s.isAlive) {
      s.segments.forEach(seg => {
        // Also mark adjacent cells for safety
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            occupied.add(`${seg.x + dx},${seg.y + dy}`);
          }
        }
      });
    }
  });

  // Find empty spawn position
  let spawnPos = null;
  let attempts = 0;
  while (!spawnPos && attempts < 100) {
    const x = 3 + Math.floor(Math.random() * (BOARD_WIDTH - 6));
    const y = 3 + Math.floor(Math.random() * (BOARD_HEIGHT - 6));

    if (!occupied.has(`${x},${y}`)) {
      spawnPos = { x, y };
    }
    attempts++;
  }

  if (!spawnPos) {
    // Fallback
    spawnPos = { x: Math.floor(BOARD_WIDTH / 2), y: Math.floor(BOARD_HEIGHT / 2) };
  }

  // Determine direction pointing toward center
  const direction = spawnPos.x < BOARD_WIDTH / 2 ? 'right' : 'left';

  // Reset snake
  snake.segments = generateInitialSegments(spawnPos, direction);
  snake.direction = direction;
  snake.nextDirection = direction;
  snake.isAlive = true;
  snake.isInvincible = true;
  snake.invincibleUntil = Date.now() + INVINCIBILITY_DURATION;
  snake.respawnAt = null;
}

/**
 * Calculate final placements and scores
 */
function calculatePlacements(gameState) {
  const scores = Object.values(gameState.snakes)
    .map(s => ({ playerId: s.id, name: s.name, score: s.score, color: s.color }))
    .sort((a, b) => b.score - a.score);

  const placements = [];
  let currentPlacement = 1;
  let lastScore = null;

  scores.forEach((player, index) => {
    if (lastScore !== null && player.score < lastScore) {
      currentPlacement = index + 1;
    }
    placements.push({
      ...player,
      placement: currentPlacement,
      awardedPoints: getAwardedPoints(currentPlacement),
    });
    lastScore = player.score;
  });

  return placements;
}

/**
 * Get awarded points based on placement
 */
function getAwardedPoints(placement) {
  if (placement === 1) return 30;
  if (placement === 2) return 20;
  return 10;
}

/**
 * Check if any player earned a star (score >= threshold)
 */
function checkStarEarned(gameState) {
  return Object.values(gameState.snakes).some(s => s.score >= STAR_THRESHOLD);
}

/**
 * Get current game state for broadcast (sanitized)
 */
function getGameStateForBroadcast(gameState) {
  return {
    board: gameState.board,
    snakes: Object.fromEntries(
      Object.entries(gameState.snakes).map(([id, snake]) => [
        id,
        {
          id: snake.id,
          name: snake.name,
          color: snake.color,
          colorName: snake.colorName,
          segments: snake.segments,
          direction: snake.direction,
          isAlive: snake.isAlive,
          isInvincible: snake.isInvincible,
          score: snake.score,
          respawnAt: snake.respawnAt,
        },
      ])
    ),
    food: gameState.food,
    timeRemaining: gameState.startTime
      ? Math.max(0, GAME_DURATION - (Date.now() - gameState.startTime))
      : GAME_DURATION,
  };
}

module.exports = {
  // Constants
  BOARD_WIDTH,
  BOARD_HEIGHT,
  GAME_DURATION,
  TICK_RATE,
  RESPAWN_DELAY,
  INVINCIBILITY_DURATION,
  STAR_THRESHOLD,

  // Functions
  initializeGame,
  processDirection,
  gameTick,
  calculatePlacements,
  checkStarEarned,
  getGameStateForBroadcast,
  spawnFood,
};
