/**
 * Memory Match Game Logic
 * Team-based card-flipping game where players find matching pairs
 */

// Grid configuration (fixed)
const GRID_ROWS = 5;
const GRID_COLS = 6;
const TOTAL_CARDS = GRID_ROWS * GRID_COLS; // 30
const TOTAL_PAIRS = TOTAL_CARDS / 2; // 15

// Timing (milliseconds)
const REVEAL_TIME = 2000; // How long non-matching cards stay visible
const TURN_TIME_LIMIT = 15000; // 15 seconds per turn
const FLIP_ANIMATION_TIME = 500; // 0.5 seconds for flip animation

// Scoring
const POINTS_PER_MATCH = 10;

// Card images (Christmas-themed)
const CARD_IMAGES = [
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
  { id: 'wreath', emoji: '🎀', name: 'Wreath' },
];

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate the memory match board
 * @returns {Array} Array of card objects
 */
function generateBoard() {
  // Select 15 random images for the pairs
  const selectedImages = shuffleArray(CARD_IMAGES).slice(0, TOTAL_PAIRS);

  // Create pairs of cards
  const cards = [];
  selectedImages.forEach((img, index) => {
    // Create two cards for each image (the pair)
    cards.push({
      id: index * 2,
      imageId: img.id,
      emoji: img.emoji,
      name: img.name,
      flipped: false,
      matched: false,
    });
    cards.push({
      id: index * 2 + 1,
      imageId: img.id,
      emoji: img.emoji,
      name: img.name,
      flipped: false,
      matched: false,
    });
  });

  // Shuffle card positions
  return shuffleArray(cards);
}

/**
 * Initialize a new memory match game
 * @param {Array} players - Array of player objects with {id, name}
 * @returns {Object} Initial game state
 */
function initializeGame(players) {
  const board = generateBoard();
  const turnOrder = shuffleArray(players.map(p => p.id));

  const scores = {};
  players.forEach(p => {
    scores[p.id] = 0;
  });

  const playerNames = {};
  players.forEach(p => {
    playerNames[p.id] = p.name;
  });

  return {
    gameType: 'memory-match',
    board,
    gridSize: { rows: GRID_ROWS, cols: GRID_COLS },
    cursorPosition: { row: 0, col: 0 },
    currentPlayer: turnOrder[0],
    currentPlayerName: playerNames[turnOrder[0]],
    turnOrder,
    turnIndex: 0,
    playerNames,
    selectedCards: [], // Cards flipped this turn (0, 1, or 2)
    pairsFound: 0,
    totalPairs: TOTAL_PAIRS,
    scores,
    turnStartTime: null,
    gameOver: false,
    config: {
      revealTime: REVEAL_TIME,
      turnTimeLimit: TURN_TIME_LIMIT,
      flipAnimationTime: FLIP_ANIMATION_TIME,
      pointsPerMatch: POINTS_PER_MATCH,
    },
  };
}

/**
 * Get card at a specific grid position
 * @param {Object} gameState - Current game state
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {Object|null} Card at position or null
 */
function getCardAtPosition(gameState, row, col) {
  const index = row * GRID_COLS + col;
  return gameState.board[index] || null;
}

/**
 * Get grid position from card index
 * @param {number} cardIndex - Index in the board array
 * @returns {Object} { row, col }
 */
function getPositionFromIndex(cardIndex) {
  return {
    row: Math.floor(cardIndex / GRID_COLS),
    col: cardIndex % GRID_COLS,
  };
}

/**
 * Move cursor in a direction
 * @param {Object} gameState - Current game state
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @returns {Object} New cursor position
 */
function moveCursor(gameState, direction) {
  let { row, col } = gameState.cursorPosition;

  switch (direction) {
    case 'up':
      row = Math.max(0, row - 1);
      break;
    case 'down':
      row = Math.min(GRID_ROWS - 1, row + 1);
      break;
    case 'left':
      col = Math.max(0, col - 1);
      break;
    case 'right':
      col = Math.min(GRID_COLS - 1, col + 1);
      break;
  }

  gameState.cursorPosition = { row, col };
  return gameState.cursorPosition;
}

/**
 * Select (flip) the card at current cursor position
 * @param {Object} gameState - Current game state
 * @returns {Object} Result of selection { success, card, isSecondCard, isMatch }
 */
function selectCard(gameState) {
  const { row, col } = gameState.cursorPosition;
  const cardIndex = row * GRID_COLS + col;
  const card = gameState.board[cardIndex];

  // Can't select already matched or flipped cards
  if (!card || card.matched || card.flipped) {
    return { success: false, reason: 'invalid_selection' };
  }

  // Can't select more than 2 cards per turn
  if (gameState.selectedCards.length >= 2) {
    return { success: false, reason: 'already_selected_two' };
  }

  // Flip the card
  card.flipped = true;
  gameState.selectedCards.push(cardIndex);

  // Check if this is the second card
  if (gameState.selectedCards.length === 2) {
    const card1 = gameState.board[gameState.selectedCards[0]];
    const card2 = gameState.board[gameState.selectedCards[1]];
    const isMatch = card1.imageId === card2.imageId;

    return {
      success: true,
      card,
      cardIndex,
      isSecondCard: true,
      isMatch,
      card1Index: gameState.selectedCards[0],
      card2Index: gameState.selectedCards[1],
    };
  }

  return {
    success: true,
    card,
    cardIndex,
    isSecondCard: false,
  };
}

/**
 * Process match result after second card is selected
 * @param {Object} gameState - Current game state
 * @param {boolean} isMatch - Whether the cards matched
 * @param {number} card1Index - Index of first card
 * @param {number} card2Index - Index of second card
 * @returns {Object} Result with score changes
 */
function processMatchResult(gameState, isMatch, card1Index, card2Index) {
  const card1 = gameState.board[card1Index];
  const card2 = gameState.board[card2Index];

  // Safety check - cards might have been cleared by timeout
  if (!card1 || !card2) {
    return { matched: false, error: 'cards_not_found' };
  }

  if (isMatch) {
    // Mark cards as matched
    card1.matched = true;
    card2.matched = true;

    // Award points to current player
    gameState.scores[gameState.currentPlayer] += POINTS_PER_MATCH;
    gameState.pairsFound++;

    // Check if game is complete
    if (gameState.pairsFound >= TOTAL_PAIRS) {
      gameState.gameOver = true;
    }

    return {
      matched: true,
      playerId: gameState.currentPlayer,
      playerName: gameState.currentPlayerName,
      pointsEarned: POINTS_PER_MATCH,
      newScore: gameState.scores[gameState.currentPlayer],
      pairsFound: gameState.pairsFound,
      gameOver: gameState.gameOver,
    };
  } else {
    // Cards don't match - they will be flipped back after reveal time
    return {
      matched: false,
      playerId: gameState.currentPlayer,
      playerName: gameState.currentPlayerName,
      pointsEarned: 0,
    };
  }
}

/**
 * Flip non-matching cards back face-down
 * @param {Object} gameState - Current game state
 * @param {number[]} cardIndices - Optional specific card indices to flip back
 */
function flipCardsBack(gameState, cardIndices = null) {
  const indicesToFlip = cardIndices || gameState.selectedCards;
  indicesToFlip.forEach(cardIndex => {
    const card = gameState.board[cardIndex];
    if (card && !card.matched) {
      card.flipped = false;
    }
  });
}

/**
 * Advance to next player's turn
 * @param {Object} gameState - Current game state
 * @returns {Object} New turn info
 */
function advanceTurn(gameState) {
  // Clear selected cards
  gameState.selectedCards = [];

  // Move to next player
  gameState.turnIndex = (gameState.turnIndex + 1) % gameState.turnOrder.length;
  gameState.currentPlayer = gameState.turnOrder[gameState.turnIndex];
  gameState.currentPlayerName = gameState.playerNames[gameState.currentPlayer];

  // Reset cursor to first unmatched card
  resetCursorToUnmatched(gameState);

  // Reset turn timer
  gameState.turnStartTime = Date.now();

  return {
    currentPlayer: gameState.currentPlayer,
    currentPlayerName: gameState.currentPlayerName,
    cursorPosition: gameState.cursorPosition,
  };
}

/**
 * Reset cursor to first unmatched card
 * @param {Object} gameState - Current game state
 */
function resetCursorToUnmatched(gameState) {
  for (let i = 0; i < gameState.board.length; i++) {
    if (!gameState.board[i].matched) {
      gameState.cursorPosition = getPositionFromIndex(i);
      return;
    }
  }
  // Fallback to (0,0) if all matched (shouldn't happen before game over)
  gameState.cursorPosition = { row: 0, col: 0 };
}

/**
 * Handle turn timeout
 * @param {Object} gameState - Current game state
 * @returns {Object} Timeout result
 */
function handleTurnTimeout(gameState) {
  // Flip back any revealed cards
  flipCardsBack(gameState);

  // Advance to next player
  return advanceTurn(gameState);
}

/**
 * Calculate final placements based on mini-game scores
 * @param {Object} gameState - Current game state
 * @returns {Array} Placements with awarded points
 */
function calculatePlacements(gameState) {
  const scores = Object.entries(gameState.scores)
    .map(([playerId, score]) => ({
      playerId,
      name: gameState.playerNames[playerId],
      score,
    }))
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
 * Get awarded game points based on placement
 * @param {number} placement - Player's placement (1, 2, 3+)
 * @returns {number} Game points to award
 */
function getAwardedPoints(placement) {
  if (placement === 1) return 30;
  if (placement === 2) return 20;
  return 10;
}

/**
 * Get game state for broadcast to coordinator (full state)
 * @param {Object} gameState - Current game state
 * @returns {Object} Sanitized state for coordinator
 */
function getStateForCoordinator(gameState) {
  return {
    gameType: gameState.gameType,
    board: gameState.board.map(card => ({
      id: card.id,
      imageId: card.imageId,
      emoji: card.emoji,
      name: card.name,
      flipped: card.flipped,
      matched: card.matched,
    })),
    gridSize: gameState.gridSize,
    cursorPosition: gameState.cursorPosition,
    currentPlayer: gameState.currentPlayer,
    currentPlayerName: gameState.currentPlayerName,
    selectedCards: gameState.selectedCards,
    pairsFound: gameState.pairsFound,
    totalPairs: gameState.totalPairs,
    scores: gameState.scores,
    playerNames: gameState.playerNames,
    gameOver: gameState.gameOver,
    config: gameState.config,
  };
}

/**
 * Get player-specific state (is it their turn?)
 * @param {Object} gameState - Current game state
 * @param {string} playerId - Player's socket ID
 * @returns {Object} Player-specific state
 */
function getStateForPlayer(gameState, playerId) {
  return {
    isYourTurn: gameState.currentPlayer === playerId,
    currentPlayerName: gameState.currentPlayerName,
    pairsFound: gameState.pairsFound,
    totalPairs: gameState.totalPairs,
    yourScore: gameState.scores[playerId] || 0,
    gameOver: gameState.gameOver,
  };
}

module.exports = {
  // Constants
  GRID_ROWS,
  GRID_COLS,
  TOTAL_PAIRS,
  REVEAL_TIME,
  TURN_TIME_LIMIT,
  FLIP_ANIMATION_TIME,
  POINTS_PER_MATCH,
  CARD_IMAGES,

  // Functions
  initializeGame,
  generateBoard,
  getCardAtPosition,
  getPositionFromIndex,
  moveCursor,
  selectCard,
  processMatchResult,
  flipCardsBack,
  advanceTurn,
  handleTurnTimeout,
  calculatePlacements,
  getAwardedPoints,
  getStateForCoordinator,
  getStateForPlayer,
};
