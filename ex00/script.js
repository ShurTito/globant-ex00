const gridSize = 4; // The grid is 4x4
let board = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0; // Retrieve the best score from localStorage or set to 0
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game when the DOM is ready
    initGame();
    
    // Handle restart button
    document.getElementById('restart-btn').addEventListener('click', initGame);
    
    // Handle key presses for movement
    window.addEventListener('keydown', handleKeyPress);

    // Detectar desplazamiento en la pantalla
    document.body.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.body.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.body.addEventListener('touchend', handleTouchEnd, { passive: true });
});

function initGame() {
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
    score = 0;
    document.getElementById('score').textContent = score;  // Set initial score to 0
    document.getElementById('best-score').textContent = bestScore;
    generateRandomTile();
    generateRandomTile();
    updateBoard();
    updateArrowDisplay(''); // Clear the arrow display
}

function generateRandomTile() {
    let emptyCells = [];
    
    // Find all empty cells on the board
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    // Randomly pick an empty cell
    if (emptyCells.length > 0) {
        let [x, y] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[x][y] = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% for 4
        addTile(x, y, board[x][y]);
    }
}

function updateBoard() {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = ''; // Clear the grid
    
    // Create and place tiles
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.textContent = board[i][j] === 0 ? '' : board[i][j];
            if (board[i][j] > 0) {
                tile.classList.add(`tile-${board[i][j]}`);
            }
            gridContainer.appendChild(tile);
        }
    }
}

function handleKeyPress(event) {
    let moved = false;
    
    let direction = '';

    switch (event.key) {
        case 'ArrowUp':
            moved = moveUp();
            direction = 'up';
            break;
        case 'ArrowDown':
            moved = moveDown();
            direction = 'down';
            break;
        case 'ArrowLeft':
            moved = moveLeft();
            direction = 'left';
            break;
        case 'ArrowRight':
            moved = moveRight();
            direction = 'right';
            break;
        default:
            return; // Ignore other keys
    }

    
    if (moved) {
        generateRandomTile(); // Generate a new tile after a valid move
        updateBoard(); // Update the visual representation
        document.getElementById('score').textContent = score;  // Update score in real-time
    }
    
    if (checkGameOver()) {
        alert('Game Over!'); // Alert the player when the game is over
        updateBestScore(); // Update the best score if necessary
        initGame();
    }
    
    if (checkWin()) {
        alert('You Win!'); // Alert the player when they win
    }
    updateArrowDisplay(direction); // Update the arrow display with the last pressed key

}

function updateArrowDisplay(direction) {
    const arrows = document.querySelectorAll('#arrow-display .arrow');
    
    // Remove the 'active' class from all arrows
    arrows.forEach(arrow => {
        arrow.classList.remove('active');
    });

    // Find the arrow with the matching 'data-direction' and add the 'active' class
    const lastArrow = [...arrows].find(arrow => {
        return arrow.getAttribute('data-direction') === direction;
    });

    if (lastArrow) {
        lastArrow.classList.add('active');
    }
}

function moveUp() {
    let moved = false;
    
    for (let col = 0; col < gridSize; col++) {
        let column = [];
        
        // Get all the tiles in the column
        for (let row = 0; row < gridSize; row++) {
            if (board[row][col] !== 0) {
                column.push(board[row][col]);
            }
        }
        
        column = mergeTiles(column);
        
        // Place the merged column back to the board
        for (let row = 0; row < gridSize; row++) {
            if (row < column.length) {
                if (board[row][col] !== column[row]) {
                    moved = true;
                    moveTile(column[row], column[row].x, column[row].y, row, col);
                }
                board[row][col] = column[row];
            } else {
                board[row][col] = 0;
            }
        }
    }
    
    return moved;
}

function moveDown() {
    let moved = false;
    
    for (let col = 0; col < gridSize; col++) {
        let column = [];
        
        // Get all the tiles in the column
        for (let row = gridSize - 1; row >= 0; row--) {
            if (board[row][col] !== 0) {
                column.push(board[row][col]);
            }
        }
        
        column = mergeTiles(column);
        
        // Place the merged column back to the board
        for (let row = gridSize - 1; row >= 0; row--) {
            if (gridSize - 1 - row < column.length) {
                if (board[row][col] !== column[gridSize - 1 - row]) {
                    moved = true;
                    moveTile(column[gridSize - 1 - row], column[gridSize - 1 - row].x, column[gridSize - 1 - row].y, row, col);
                }
                board[row][col] = column[gridSize - 1 - row];
            } else {
                board[row][col] = 0;
            }
        }
    }
    
    return moved;
}

function moveLeft() {
    let moved = false;
    
    for (let row = 0; row < gridSize; row++) {
        let line = [];
        
        // Get all the tiles in the row
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] !== 0) {
                line.push(board[row][col]);
            }
        }
        
        line = mergeTiles(line);
        
        // Place the merged row back to the board
        for (let col = 0; col < gridSize; col++) {
            if (col < line.length) {
                if (board[row][col] !== line[col]) {
                    moved = true;
                    moveTile(line[col], line[col].x, line[col].y, row, col);
                }
                board[row][col] = line[col];
            } else {
                board[row][col] = 0;
            }
        }
    }
    
    return moved;
}

function moveRight() {
    let moved = false;
    
    for (let row = 0; row < gridSize; row++) {
        let line = [];
        
        // Get all the tiles in the row
        for (let col = gridSize - 1; col >= 0; col--) {
            if (board[row][col] !== 0) {
                line.push(board[row][col]);
            }
        }
        
        line = mergeTiles(line);
        
        // Place the merged row back to the board
        for (let col = gridSize - 1; col >= 0; col--) {
            if (gridSize - 1 - col < line.length) {
                if (board[row][col] !== line[gridSize - 1 - col]) {
                    moved = true;
                    moveTile(line[gridSize - 1 - col], line[gridSize - 1 - col].x, line[gridSize - 1 - col].y, row, col);
                }
                board[row][col] = line[gridSize - 1 - col];
            } else {
                board[row][col] = 0;
            }
        }
    }
    
    return moved;
}

function mergeTiles(line) {
    let newLine = [];
    
    // Merge tiles in the line
    for (let i = 0; i < line.length; i++) {
        if (i + 1 < line.length && line[i] === line[i + 1]) {
            newLine.push(line[i] * 2);
            score += line[i] * 2;
            i++; // Skip the next tile since it has already merged
        } else {
            newLine.push(line[i]);
        }
    }
    
    // Fill the rest with zeros
    while (newLine.length < gridSize) {
        newLine.push(0);
    }
    
    return newLine;
}

function checkGameOver() {
    // If there is any empty cell or any adjacent tiles can be merged, the game is not over
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) return false;
            if (i + 1 < gridSize && board[i][j] === board[i + 1][j]) return false;
            if (j + 1 < gridSize && board[i][j] === board[i][j + 1]) return false;
        }
    }
    return true;
}

function checkWin() {
    // Check if the player created the 2048 tile
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 2048) return true;
        }
    }
    return false;
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore); // Save the best score to localStorage
        document.getElementById('best-score').textContent = bestScore; // Update the best score on the UI
    }
}

function moveTile(tile, fromX, fromY, toX, toY) {
    const tileElement = document.querySelector(`.tile[data-x="${fromX}"][data-y="${fromY}"]`);
    if (tileElement) {
        tileElement.style.transform = `translate(${(toX - fromX) * 100}%, ${(toY - fromY) * 100}%)`;
        tileElement.setAttribute('data-x', toX);
        tileElement.setAttribute('data-y', toY);
    }
}

function addTile(x, y, value) {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile', 'new');
    tileElement.setAttribute('data-x', x);
    tileElement.setAttribute('data-y', y);
    tileElement.textContent = value;
    document.getElementById('grid-container').appendChild(tileElement);
    setTimeout(() => tileElement.classList.remove('new'), 200);
}

// Función para detectar el inicio del toque
function handleTouchStart(event) {
    // Prevent default behavior (prevent scrolling or zooming)
    event.preventDefault();
    const touch = event.touches[0]; // Obtiene el primer toque
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouching = true;
}

// Función para detectar el movimiento del toque
function handleTouchMove(event) {
    if (!isTouching) return; // Solo procesar si se está tocando
    
    event.preventDefault(); // Evita el comportamiento por defecto del navegador (scrolling)
}

// Función para detectar el final del toque
function handleTouchEnd(event) {
    if (!isTouching) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX; // Desplazamiento horizontal
    const deltaY = touchEndY - touchStartY; // Desplazamiento vertical
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Desplazamiento horizontal (izquierda o derecha)
        if (deltaX > 0) {
            // Deslizó a la derecha
            handleTouchMove('right');
        } else {
            // Deslizó a la izquierda
            handleTouchMove('left');
        }
    } else {
        // Desplazamiento vertical (arriba o abajo)
        if (deltaY > 0) {
            // Deslizó hacia abajo
            handleTouchMove('down');
        } else {
            // Deslizó hacia arriba
            handleTouchMove('up');
        }
    }
    
    isTouching = false; // Resetear el estado
}

// Función que maneja el movimiento según la dirección tocada
function handleTouchMove(direction) {
    let moved = false;
    
    let direct = '';
    switch (direction) {
        case 'up':
            moved = moveUp();
            direct = 'up';
            break;
        case 'down':
            moved = moveDown();
            direct = 'down';
            break;
        case 'left':
            moved = moveLeft();
            direct = 'left';
            break;
        case 'right':
            moved = moveRight();
            direct = 'right';
            break;
    }

    if (moved) {
        generateRandomTile(); // Generar un nuevo tile
        updateBoard(); // Actualizar el tablero visualmente
        document.getElementById('score').textContent = score;  // Actualizar la puntuación
    }

    if (checkGameOver()) {
        alert('Game Over!');
        updateBestScore(); // Actualizar la mejor puntuación
        initGame(); // Reiniciar el juego
    }

    if (checkWin()) {
        alert('You Win!');
    }

    updateArrowDisplay(direct); // Actualizar la dirección del último movimiento
}