const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const completionMessage = document.getElementById('completion-message');
const wallMessage = document.getElementById('wall-message'); // Ensure this is in your HTML

let rows = 10;
let cols = 10;
canvas.width = 500;
canvas.height = 500;
let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;

let maze = [];
let player = { row: rows - 1, col: 0 }; // Start at the bottom-left corner
let exitCell = { row: 0, col: cols - 1 }; // Exit at the top-right corner
let playerEmoji = '😊'; // Smiling face emoji
let previousPosition = { ...player }; // Initialize previous position
let moveHistory = []; // Array to store move history

// Function to generate maze
function generateMaze() {
  maze = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        visited: false,
        top: true,
        right: true,
        bottom: true,
        left: true,
      });
    }
    maze.push(row);
  }
  carvePath();
  drawMaze();
  drawPlayer();
}

// Function to carve paths in the maze
function carvePath() {
  const stack = [];
  const startCell = { row: 0, col: 0 };
  maze[0][0].visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack.pop();
    const neighbors = [];

    // Check for neighbors
    if (current.row > 0 && !maze[current.row - 1][current.col].visited)
      neighbors.push({ row: current.row - 1, col: current.col, direction: 'top' });
    if (current.col < cols - 1 && !maze[current.row][current.col + 1].visited)
      neighbors.push({ row: current.row, col: current.col + 1, direction: 'right' });
    if (current.row < rows - 1 && !maze[current.row + 1][current.col].visited)
      neighbors.push({ row: current.row + 1, col: current.col, direction: 'bottom' });
    if (current.col > 0 && !maze[current.row][current.col - 1].visited)
      neighbors.push({ row: current.row, col: current.col - 1, direction: 'left' });

    if (neighbors.length > 0) {
      stack.push(current);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      // Break walls
      if (next.direction === 'top') {
        maze[current.row][current.col].top = false;
        maze[next.row][next.col].bottom = false;
      }
      if (next.direction === 'right') {
        maze[current.row][current.col].right = false;
        maze[next.row][next.col].left = false;
      }
      if (next.direction === 'bottom') {
        maze[current.row][current.col].bottom = false;
        maze[next.row][next.col].top = false;
      }
      if (next.direction === 'left') {
        maze[current.row][current.col].left = false;
        maze[next.row][next.col].right = false;
      }

      maze[next.row][next.col].visited = true;
      stack.push(next);
    }
  }
}

// Draw the maze
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  maze.forEach((row, r) => {
    row.forEach((cell, c) => {
      const x = c * cellWidth;
      const y = r * cellHeight;

      // Calculate the size and position of the fill for start and end points
      const fillSize = cellWidth * 0.6; // 30% of the cell size
      const offsetX = (cellWidth - fillSize) / 2; // Center horizontally
      const offsetY = (cellHeight - fillSize) / 2; // Center vertically
      
      // Highlight start point
      if (r === rows - 1 && c === 0) {
        ctx.fillStyle = 'blue'; // Color for start point
        ctx.fillRect(x + offsetX, y + offsetY, fillSize, fillSize);
      }
      
      // Highlight end point
      if (r === 0 && c === cols - 1) {
        ctx.fillStyle = 'red'; // Color for end point
        ctx.fillRect(x + offsetX, y + offsetY, fillSize, fillSize);
      }

      // Draw the maze walls
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      if (cell.top) ctx.moveTo(x, y), ctx.lineTo(x + cellWidth, y);
      if (cell.right) ctx.moveTo(x + cellWidth, y), ctx.lineTo(x + cellWidth, y + cellHeight);
      if (cell.bottom) ctx.moveTo(x + cellWidth, y + cellHeight), ctx.lineTo(x, y + cellHeight);
      if (cell.left) ctx.moveTo(x, y + cellHeight), ctx.lineTo(x, y);
      ctx.stroke();
    });
  });
}

// Draw the player
function drawPlayer() {
  const x = player.col * cellWidth + cellWidth / 4;
  const y = player.row * cellHeight + cellHeight / 1.5;
  ctx.font = `${cellWidth / 2}px Arial`;
  ctx.fillText(playerEmoji, x, y);
}

// Function to handle player movement
function movePlayer(direction) {
  const prevRow = player.row;
  const prevCol = player.col;

  let newRow = player.row;
  let newCol = player.col;
  let canMove = false;
  let wallHit = false;

  // Check if the move is valid and update the new position
  if (direction === 'up' && !maze[player.row][player.col].top) {
    newRow--;
    canMove = true;
  }
  if (direction === 'right' && !maze[player.row][player.col].right) {
    newCol++;
    canMove = true;
  }
  if (direction === 'down' && !maze[player.row][player.col].bottom) {
    newRow++;
    canMove = true;
  }
  if (direction === 'left' && !maze[player.row][player.col].left) {
    newCol--;
    canMove = true;
  }

  if (canMove && newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
    const newPosition = { row: newRow, col: newCol };

    // Update move history
    moveHistory.push(newPosition);
    if (moveHistory.length > 100) moveHistory.shift(); // Limit history length

    previousPosition = { row: player.row, col: player.col };
    player.row = newRow;
    player.col = newCol;

    if (player.row === exitCell.row && player.col === exitCell.col) {
      showCompletionMessage(); // Show the completion message
      createSparkles(); // Create sparkles effect (if defined)
    }

    drawMaze();
    drawPlayer();
  } else {
    // Notify the player if there is a wall in the attempted direction
    if (direction === 'up' && maze[player.row][player.col].top) wallHit = true;
    if (direction === 'right' && maze[player.row][player.col].right) wallHit = true;
    if (direction === 'down' && maze[player.row][player.col].bottom) wallHit = true;
    if (direction === 'left' && maze[player.row][player.col].left) wallHit = true;
    if (wallHit) {
      if (wallMessage.style.display === 'none') {
        wallMessage.textContent = "There's a wall blocking your way!";
        wallMessage.style.display = 'block'; // Show wall message
        wallMessage.style.fontSize = '20px'; // Increase font size to 20px (adjust as needed)
        setTimeout(() => wallMessage.style.display = 'none', 2000); // Hide message after 2 seconds
      }
    }
    
      }
    }
  


// Function to handle keydown events for player movement
function handleKeyDown(event) {
  switch (event.key) {
    case 'ArrowUp':
      movePlayer('up');
      break;
    case 'ArrowRight':
      movePlayer('right');
      break;
    case 'ArrowDown':
      movePlayer('down');
      break;
    case 'ArrowLeft':
      movePlayer('left');
      break;
  }
}

// Add event listener for keyboard controls
document.addEventListener('keydown', handleKeyDown);

// Event listeners for control buttons
document.getElementById('upButton').addEventListener('click', () => movePlayer('up'));
document.getElementById('rightButton').addEventListener('click', () => movePlayer('right'));
document.getElementById('downButton').addEventListener('click', () => movePlayer('down'));
document.getElementById('leftButton').addEventListener('click', () => movePlayer('left'));

// Reset button
document.getElementById('resetButton').addEventListener('click', () => {
  resetGame();
});

// Level buttons
document.querySelectorAll('#level-buttons .level-button').forEach(button => {
  button.addEventListener('click', (event) => {
    const level = event.target.id;
    switch (level) {
      case 'easyButton':
        rows = 10;
        cols = 10;
        break;
      case 'mediumButton':
        rows = 20;
        cols = 20;
        break;
      case 'hardButton':
        rows = 30;
        cols = 30;
        break;
    }
    resetGame();
  });
});

// Reset the game for different levels
function resetGame() {
  cellWidth = canvas.width / cols;
  cellHeight = canvas.height / rows;
  player = { row: rows - 1, col: 0 }; // Reset player position
  exitCell = { row: 0, col: cols - 1 }; // Reset exit cell position
  moveHistory = []; // Reset move history
  completionMessage.style.display = 'none'; // Hide completion message
  wallMessage.style.display = 'none'; // Hide wall message
  generateMaze(); // Regenerate maze
}

// Show completion message
function showCompletionMessage() {
  completionMessage.textContent = "Congratulations! You've completed the maze!";
  completionMessage.style.display = 'block';
}

// Create sparkles effect (if defined)
function createSparkles() {
  // Implement sparkles effect if needed
}

// Initialize the game
resetGame(); // Use resetGame to initialize instead of generating maze directly
