// logic.js

// This script contains the game logic for handling player moves, AI behavior, and win conditions.

(function() {
    // Check if the game state is initialized. If not, log an error and exit.
    if (!window.gameState) {
        console.error("Game state not initialized!");
        return;
    }

    // Function to randomly assign colors to the symbols 'X' and 'O'.
    function assignSymbolColors() {
        const color1 = "#1e88e5", color2 = "#e53935"; // Define two colors: blue and red.
        if (Math.random() < 0.5) { // Randomly decide which symbol gets which color.
            window.gameState.symbolColors = { 'X': color1, 'O': color2 }; // Assign colors.
        } else {
            window.gameState.symbolColors = { 'X': color2, 'O': color1 }; // Swap the colors.
        }
    }

    // Function to assign symbols ('X' and 'O') based on the game mode.
    function assignSymbols() {
        let game = window.gameState; // Access the global game state object.

        // Call the function to assign random colors to 'X' and 'O'.
        assignSymbolColors();

        if (game.mode === 'ai') { // For AI mode:
            if (Math.random() < 0.5) { // Randomly decide who plays as 'X' and who plays as 'O'.
                game.playerSymbol = 'X'; // Player uses 'X'.
                game.beanoSymbol = 'O'; // AI uses 'O'.
            } else {
                game.playerSymbol = 'O'; // Player uses 'O'.
                game.beanoSymbol = 'X'; // AI uses 'X'.
            }
            game.currentTurn = game.playerSymbol; // The player always starts first.
        } else { // For PvP mode:
            game.currentTurn = 'X'; // Player 1 always starts with 'X'.
            game.playerSymbol = ''; // Clear these fields because they are not used in PvP.
            game.beanoSymbol = '';
        }
    }

    // This function handles a player's move when a cell is clicked.
    window.handlePlayerMove = function(index) {
        let game = window.gameState; // Access the global game state object.

        // Exit early if the game is inactive, the selected cell is already taken, or the game is waiting for AI.
        if (!game.gameActive || game.board[index] !== '' || game.waiting) return;

        // Determine the symbol to place based on the game mode.
        let symbolToPlace = (game.mode === 'ai') ? game.playerSymbol : game.currentTurn;

        // Update the board with the chosen symbol and increment the move counter.
        game.board[index] = symbolToPlace;
        game.moveCount++;

        // Play a sound effect if available.
        let moveSound = document.getElementById('move-sound');
        if (moveSound) moveSound.play();

        // Update the visual representation of the board.
        window.updateBoardUI();

        // Check if there is a winner after this move.
        let winner = window.checkWinner();
        if (winner) {
            window.endGame(winner); // End the game if there is a winner.
            return;
        } else if (game.moveCount === game.board.length) {
            window.endGame('draw'); // End the game as a draw if all cells are filled.
            return;
        }

        // In AI mode, allow the AI to make its move after a delay.
        if (game.mode === 'ai') {
            game.waiting = true; // Prevent the player from making another move while the AI is thinking.
            setTimeout(handleAIMove, 500); // Wait 500 milliseconds before the AI makes its move.
        } else if (game.mode === 'player') { // In PvP mode, switch turns between players.
            game.currentTurn = (game.currentTurn === 'X') ? 'O' : 'X';
        }
    }

    // This function handles the AI's move based on the selected difficulty.
    function handleAIMove() {
        let game = window.gameState; // Access the global game state object.

        // Exit early if the game is no longer active.
        if (!game.gameActive) {
            game.waiting = false;
            return;
        }

        let index; // Variable to store the AI's chosen move.

        // Choose the appropriate AI strategy based on difficulty.
        switch (game.difficulty) {
            case 'easy':
                index = getRandomMove(); // Easy AI makes random moves.
                break;
            case 'medium':
                index = getMediumMove(); // Medium AI tries to win or block the player.
                break;
            case 'hard':
                index = getHardMove(); // Hard AI uses minimax for optimal moves.
                break;
            default:
                index = getRandomMove(); // Default to random moves if difficulty is undefined.
        }

        // If no valid move is found, stop processing.
        if (index === -1) {
            game.waiting = false;
            return;
        }

        // Place the AI's symbol on the chosen cell and increment the move counter.
        game.board[index] = game.beanoSymbol;
        game.moveCount++;

        // Play a sound effect if available.
        let moveSound = document.getElementById('move-sound');
        if (moveSound) moveSound.play();

        // Update the visual representation of the board.
        window.updateBoardUI();

        // Check if the AI has won.
        let winner = window.checkWinner();
        if (winner) {
            window.endGame(winner); // End the game if there is a winner.
            game.waiting = false;
            return;
        } else if (game.moveCount === game.board.length) {
            window.endGame('draw'); // End the game as a draw if all cells are filled.
            game.waiting = false;
            return;
        }

        // Allow the player to make their next move.
        game.waiting = false;
    }

    // Function for easy AI: choose a random available cell.
    function getRandomMove() {
        let game = window.gameState; // Access the global game state object.
        let available = []; // Array to store empty cells.

        // Add empty cells to the array.
        game.board.forEach((cell, index) => {
            if (cell === '') available.push(index);
        });

        // Return -1 if no empty cells are available.
        if (available.length === 0) return -1;

        // Return a random empty cell.
        return available[Math.floor(Math.random() * available.length)];
    }

    // Function for medium AI: try to win, block the player, or choose a random cell.
    function getMediumMove() {
        let game = window.gameState; // Access the global game state object.

        // Try to win by placing the AI's symbol in a winning position.
        for (let i = 0; i < game.board.length; i++) {
            if (game.board[i] === '') {
                game.board[i] = game.beanoSymbol; // Temporarily place the AI's symbol.
                if (window.checkWinner() === game.beanoSymbol) {
                    game.board[i] = ''; // Reset the cell.
                    return i; // Return the winning move.
                }
                game.board[i] = ''; // Reset the cell for further checks.
            }
        }

        // Block the player's potential winning move.
        for (let i = 0; i < game.board.length; i++) {
            if (game.board[i] === '') {
                game.board[i] = game.playerSymbol; // Temporarily place the player's symbol.
                if (window.checkWinner() === game.playerSymbol) {
                    game.board[i] = ''; // Reset the cell.
                    return i; // Return the blocking move.
                }
                game.board[i] = ''; // Reset the cell for further checks.
            }
        }

        // If no winning or blocking move is found, choose a random cell.
        return getRandomMove();
    }

    // Function for hard AI: use minimax algorithm for optimal moves.
    function getHardMove() {
        let game = window.gameState; // Access the global game state object.

        // Use minimax for 3x3 grids.
        if (game.gridSize === 3) {
            let bestVal = -Infinity; // Start with the lowest possible value.
            let bestMove = -1; // Variable to store the best move.

            // Loop through all cells on the board.
            for (let i = 0; i < game.board.length; i++) {
                if (game.board[i] === '') { // If the cell is empty:
                    game.board[i] = game.beanoSymbol; // Temporarily place the AI's symbol.
                    let moveVal = minimax(game.board, 0, false, game.beanoSymbol, game.playerSymbol, game.gridSize, game.winCondition); // Evaluate the move.
                    game.board[i] = ''; // Reset the cell.

                    // Update the best move if this move is better.
                    if (moveVal > bestVal) {
                        bestVal = moveVal;
                        bestMove = i;
                    }
                }
            }

            // Return the best move if found; otherwise, fall back to random moves.
            if (bestMove !== -1) return bestMove;
            else return getRandomMove();
        } else {
            // Use medium AI strategy for larger grids.
            return getMediumMove();
        }
    }

    // A simple implementation of the minimax algorithm.
    function minimax(board, depth, isMaximizing, aiSymbol, playerSymbol, size, winCondition) {
        let winner = window.checkWinner(); // Check if there is a winner.

        // Higher score for AI winning.
        if (winner === aiSymbol) return 10 - depth;

        // Lower score for player winning.
        if (winner === playerSymbol) return depth - 10;

        // Draw scenario.
        if (!board.includes('')) return 0;

        // Maximizing player's turn (AI).
        if (isMaximizing) {
            let best = -Infinity; // Start with the lowest possible value.

            // Loop through all cells on the board.
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') { // If the cell is empty:
                    board[i] = aiSymbol; // Temporarily place the AI's symbol.
                    let val = minimax(board, depth + 1, false, aiSymbol, playerSymbol, size, winCondition); // Evaluate the move.
                    board[i] = ''; // Reset the cell.

                    // Update the best value.
                    best = Math.max(best, val);
                }
            }

            return best; // Return the best value.
        } else { // Minimizing player's turn (player).
            let best = Infinity; // Start with the highest possible value.

            // Loop through all cells on the board.
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') { // If the cell is empty:
                    board[i] = playerSymbol; // Temporarily place the player's symbol.
                    let val = minimax(board, depth + 1, true, aiSymbol, playerSymbol, size, winCondition); // Evaluate the move.
                    board[i] = ''; // Reset the cell.

                    // Update the best value.
                    best = Math.min(best, val);
                }
            }

            return best; // Return the best value.
        }
    }

    // Expose the assignSymbols function globally for game initialization.
    window.assignSymbols = assignSymbols;

    // Initialize symbols if they are not already set.
    if (!window.gameState.playerSymbol && !window.gameState.beanoSymbol) {
        assignSymbols();
    }
})();