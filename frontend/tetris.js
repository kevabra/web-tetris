const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const controlButton = document.getElementById('control-button');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = canvas.width / COLS;
const NEXT_PIECE_SIZE = nextPieceCanvas.width / 4; // 4x4 grid for next piece

let score = 0;
let level = 1;
let rowsCleared = 0;
let grid = [];
let currentPiece;
let nextPiece;
let gameInterval;
let isPaused = true;

// Tetromino shapes
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1], [1, 1]], // O
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
];

const COLORS = [
  'cyan', 'purple', 'yellow', 'green', 'red', 'orange', 'blue',
  'lightblue', 'violet', 'gold', 'lime', 'pink', 'peach', 'aqua'
];

// Initialize the grid
function createGrid() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Draw the grid and pieces
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col]) {
        ctx.fillStyle = grid[row][col];
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

// Draw the next piece
function drawNextPiece() {
  nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

  if (!nextPiece) return; // Early exit if nextPiece is not defined

  nextPieceCtx.fillStyle = nextPiece.color;
  nextPiece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell) {
        nextPieceCtx.fillRect(
          cellIndex * NEXT_PIECE_SIZE,
          rowIndex * NEXT_PIECE_SIZE,
          NEXT_PIECE_SIZE,
          NEXT_PIECE_SIZE
        );
        nextPieceCtx.strokeRect(
          cellIndex * NEXT_PIECE_SIZE,
          rowIndex * NEXT_PIECE_SIZE,
          NEXT_PIECE_SIZE,
          NEXT_PIECE_SIZE
        );
      }
    });
  });
}

// Create random tetromino piece
function randomPiece() {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[shapeIndex],
    color: COLORS[shapeIndex],
    x: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
    y: 0
  };
}

// Draw a tetromino piece
function drawPiece(piece) {
  ctx.fillStyle = piece.color;
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell) {
        ctx.fillRect(
          (piece.x + cellIndex) * BLOCK_SIZE,
          (piece.y + rowIndex) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
        ctx.strokeRect(
          (piece.x + cellIndex) * BLOCK_SIZE,
          (piece.y + rowIndex) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

// Collision detection
function isCollision(piece) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const x = piece.x + col;
        const y = piece.y + row;
        if (x < 0 || x >= COLS || y >= ROWS || grid[y][x]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Lock piece and add to grid
function lockPiece(piece) {
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (cell) {
        grid[piece.y + rowIndex][piece.x + cellIndex] = piece.color;
      }
    });
  });
  clearRows();
}

// Clear completed rows
function clearRows() {
  let lines = 0;

  grid = grid.filter(row => {
    if (row.every(cell => cell !== 0)) {
      lines++;
      return false;
    }
    return true;
  });

  while (grid.length < ROWS) {
    grid.unshift(Array(COLS).fill(0));
  }

  rowsCleared += lines;

  if (lines > 0) {
    const basePoints = [0, 50, 100, 200, 400];
    const pointsPerLine = basePoints[lines] * Math.pow(2, level - 1); // Points per row based on level
    score += pointsPerLine;
    scoreElement.textContent = score;
  }

  if (rowsCleared >= 15) {
    rowsCleared -= 15;
    level++;
    levelElement.textContent = level;
    updateColorsAndSpeed();
  }
}

// Update colors and falling speed based on level
function updateColorsAndSpeed() {
  if (level % 5 === 0) {
    COLORS.splice(0, COLORS.length, 
      'cyan', 'purple', 'yellow', 'green', 'red', 'orange', 'blue',
      'lightblue', 'violet', 'gold', 'lime', 'pink', 'peach', 'aqua'
    );
  }
  const speed = Math.max(1000 - (level - 1) * 80, 100); // Faster falling speed with a minimum speed of 100ms
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      movePieceDown();
    }, speed);
  }
}

// Move piece down
function movePieceDown() {
  if (isPaused || !currentPiece) return;
  const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
  if (!isCollision(newPiece)) {
    currentPiece = newPiece;
  } else {
    lockPiece(currentPiece);
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece();

    if (isCollision(currentPiece)) {
      gameOver();
    }
  }
  drawGame();
}

// Move piece left
function movePieceLeft() {
  if (isPaused || !currentPiece) return;
  const newPiece = { ...currentPiece, x: currentPiece.x - 1 };
  if (!isCollision(newPiece)) {
    currentPiece = newPiece;
  }
  drawGame();
}

// Move piece right
function movePieceRight() {
  if (isPaused || !currentPiece) return;
  const newPiece = { ...currentPiece, x: currentPiece.x + 1 };
  if (!isCollision(newPiece)) {
    currentPiece = newPiece;
  }
  drawGame();
}

// Rotate piece
function rotatePiece() {
  if (isPaused || !currentPiece) return;
  const newShape = currentPiece.shape[0].map((_, i) =>
    currentPiece.shape.map(row => row[i]).reverse()
  );
  const newPiece = { ...currentPiece, shape: newShape };
  if (!isCollision(newPiece)) {
    currentPiece = newPiece;
  }
  drawGame();
}

// Game over logic
function gameOver() {
  clearInterval(gameInterval);
  isPaused = true;
  controlButton.textContent = 'Start Game';
  createGrid();
  nextPiece = randomPiece(); // Ensure nextPiece is initialized
  drawNextPiece();
  grid.forEach(row => row.fill(0));
  score = 0;
  level = 1;
  rowsCleared = 0;
  scoreElement.textContent = score;
  levelElement.textContent = level;
  drawGame();
}

// Start or pause game
function toggleGame() {
  if (isPaused) {
    gameInterval = setInterval(() => {
      movePieceDown();
    }, 1000 - (level - 1) * 100); // Speed up as level increases
    controlButton.textContent = 'Pause Game';
    isPaused = false;
  } else {
    clearInterval(gameInterval);
    gameInterval = null;
    controlButton.textContent = 'Start Game';
    isPaused = true;
  }
}

// Draw everything
function drawGame() {
  drawGrid();
  drawPiece(currentPiece);
}

// Handle key presses
function handleKeyPress(e) {
  if (e.key === 'ArrowLeft') {
    movePieceLeft();
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    movePieceRight();
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    movePieceDown();
    e.preventDefault();
  } else if (e.key === 'ArrowUp' || e.key === ' ') {
    rotatePiece();
    e.preventDefault(); // Prevent space key from scrolling the page
  }
}

// Initialize game
document.addEventListener('keydown', handleKeyPress);
controlButton.addEventListener('click', toggleGame);
createGrid();
nextPiece = randomPiece(); // Initialize nextPiece
currentPiece = randomPiece();
drawNextPiece();
drawGame();
