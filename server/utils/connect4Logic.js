/**
 * Connect 4 Game Logic
 * 7 columns × 6 rows board
 * Team-based gameplay with turn rotation
 */

const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const RED = 'red';
const BLUE = 'blue';

/**
 * Create empty Connect 4 board
 * @returns {Array} 6x7 grid filled with null
 */
function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
}

/**
 * Assign players to teams (Red vs Blue)
 * @param {Array} players - Array of player objects with id, name, age
 * @returns {Object} { red: [...players], blue: [...players] }
 */
function assignTeams(players) {
  const shuffled = [...players].sort(() => Math.random() - 0.5); // Shuffle for fairness
  const midpoint = Math.ceil(shuffled.length / 2);

  return {
    red: shuffled.slice(0, midpoint),
    blue: shuffled.slice(midpoint)
  };
}

/**
 * Get next player to move
 * @param {Object} teams - { red: [...], blue: [...] }
 * @param {number} moveCount - Total moves made so far
 * @returns {Object} { playerId, playerName, team }
 */
function getNextPlayer(teams, moveCount) {
  const isRedTurn = moveCount % 2 === 0; // Even moves = Red, Odd = Blue
  const currentTeam = isRedTurn ? teams.red : teams.blue;
  const teamColor = isRedTurn ? RED : BLUE;

  // Cycle through team members
  const playerIndex = Math.floor(moveCount / 2) % currentTeam.length;
  const player = currentTeam[playerIndex];

  return {
    playerId: player.id,
    playerName: player.name,
    team: teamColor
  };
}

/**
 * Check if column is valid for a move
 * @param {Array} board - Game board
 * @param {number} col - Column index (0-6)
 * @returns {boolean}
 */
function isValidMove(board, col) {
  if (col < 0 || col >= COLS) return false;
  return board[0][col] === EMPTY; // Top row must have space
}

/**
 * Place piece in column
 * @param {Array} board - Game board
 * @param {number} col - Column index (0-6)
 * @param {string} team - 'red' or 'blue'
 * @returns {Object} { success, board, row } - row where piece landed
 */
function placePiece(board, col, team) {
  if (!isValidMove(board, col)) {
    return { success: false, board, row: -1 };
  }

  // Find lowest empty row in column
  let row = ROWS - 1;
  while (row >= 0 && board[row][col] !== EMPTY) {
    row--;
  }

  // Place piece
  const newBoard = board.map(r => [...r]); // Deep copy
  newBoard[row][col] = team;

  return { success: true, board: newBoard, row };
}

/**
 * Check for 4-in-a-row from last move
 * @param {Array} board - Game board
 * @param {number} row - Last move row
 * @param {number} col - Last move column
 * @returns {Object} { winner: 'red'|'blue'|null, winningCells: [[r,c],...] }
 */
function checkWin(board, row, col) {
  const piece = board[row][col];
  if (!piece) return { winner: null, winningCells: [] };

  // Directions: horizontal, vertical, diagonal-down, diagonal-up
  const directions = [
    [[0, 1], [0, -1]], // Horizontal
    [[1, 0], [-1, 0]], // Vertical
    [[1, 1], [-1, -1]], // Diagonal \
    [[1, -1], [-1, 1]]  // Diagonal /
  ];

  for (const [dir1, dir2] of directions) {
    const cells = [[row, col]];

    // Check in direction 1
    let r = row + dir1[0];
    let c = col + dir1[1];
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === piece) {
      cells.push([r, c]);
      r += dir1[0];
      c += dir1[1];
    }

    // Check in direction 2
    r = row + dir2[0];
    c = col + dir2[1];
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === piece) {
      cells.push([r, c]);
      r += dir2[0];
      c += dir2[1];
    }

    // Check if 4+ in a row
    if (cells.length >= 4) {
      return { winner: piece, winningCells: cells };
    }
  }

  return { winner: null, winningCells: [] };
}

/**
 * Check if board is full (draw condition)
 * @param {Array} board - Game board
 * @returns {boolean}
 */
function isBoardFull(board) {
  return board[0].every(cell => cell !== EMPTY);
}

/**
 * Get random valid column (for timeout auto-move)
 * @param {Array} board - Game board
 * @returns {number} Random valid column index
 */
function getRandomValidColumn(board) {
  const validCols = [];
  for (let col = 0; col < COLS; col++) {
    if (isValidMove(board, col)) {
      validCols.push(col);
    }
  }
  return validCols[Math.floor(Math.random() * validCols.length)];
}

module.exports = {
  ROWS,
  COLS,
  EMPTY,
  RED,
  BLUE,
  createBoard,
  assignTeams,
  getNextPlayer,
  isValidMove,
  placePiece,
  checkWin,
  isBoardFull,
  getRandomValidColumn
};
