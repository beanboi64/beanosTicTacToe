// Mobile-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initMobileLayout();
    setupOrientationHandler();
    setupTouchEvents();
});

function initMobileLayout() {
    // Add mobile-specific class to body
    document.body.classList.add('mobile-view');
    
    // Check grid size and update classes
    updateBoardSizeClasses();
    
    // Initialize viewport for mobile
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

function updateBoardSizeClasses() {
    const gridSize = document.getElementById('grid-size').value;
    const gameBoard = document.getElementById('game-board');
    
    if (gridSize === '4x4') {
        gameBoard.classList.add('grid-4x4');
        gameBoard.classList.remove('grid-3x3');
    } else {
        gameBoard.classList.add('grid-3x3');
        gameBoard.classList.remove('grid-4x4');
    }
}

function setupOrientationHandler() {
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            adjustLayoutForOrientation();
        }, 200);
    });
    
    // Initial check
    adjustLayoutForOrientation();
}

function adjustLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    document.body.classList.toggle('landscape', isLandscape);
    document.body.classList.toggle('portrait', !isLandscape);
    
    // Adjust game board size based on orientation
    if (isLandscape) {
        // Make board smaller in landscape
        const gameBoard = document.getElementById('game-board');
        gameBoard.style.transform = 'scale(0.9)';
    } else {
        // Reset in portrait
        const gameBoard = document.getElementById('game-board');
        gameBoard.style.transform = 'scale(1)';
    }
}

function setupTouchEvents() {
    // Prevent double-tap zoom on game cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('touchend', function(e) {
            e.preventDefault();
            // The click event will still fire after touchend
        });
    });
    
    // Better touch handling for settings buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
    });
    
    // Prevent scrolling when interacting with the game board
    const gameBoard = document.getElementById('game-board');
    gameBoard.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}

// Hook into existing grid size change event
if (document.getElementById('grid-size')) {
    document.getElementById('grid-size').addEventListener('change', function() {
        updateBoardSizeClasses();
    });
}

// Improve modal positioning for mobile
const modals = document.querySelectorAll('.modal');
modals.forEach(modal => {
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        // Center modal better on mobile
        modalContent.style.top = '50%';
        modalContent.style.left = '50%';
        modalContent.style.transform = 'translate(-50%, -50%)';
    }
});