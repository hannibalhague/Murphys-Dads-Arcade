// --- INPUT FILE (Unified Single Action Button, 8-Axis Touch D-Pad & Gamepad) ---

window.addEventListener('DOMContentLoaded', () => {
    const touchContainer = document.getElementById('touch-controls');
    if (touchContainer) {
        touchContainer.style.display = 'flex';
    }
});

// --- CENTRALIZED UNIFIED ACTION LOGIC ---
function triggerUnifiedAction() {
    initAudio();
    if (gameState === 'START' || gameState === 'HIGHSCORES') {
        startGame();
    } else if (gameState === 'GAMEOVER') {
        gameState = 'HIGHSCORES';
    } else if (gameState === 'PLAYING') {
        if (typeof player !== 'undefined' && player.holdingPassenger) {
            player.holdingPassenger = false;
        } else {
            handleAction();
            handleExtinguisher();
        }
    }
}

// --- KEYBOARD LISTENERS ---
window.addEventListener('keydown', (e) => {
    // Universal "any key press" action trigger for start/game-over screens
    initAudio();
    if (gameState === 'START' || gameState === 'HIGHSCORES') {
        startGame();
        return;
    } else if (gameState === 'GAMEOVER') {
        gameState = 'HIGHSCORES';
        return;
    }

    if (gameState === 'NAME_ENTRY') {
        if (e.key === 'Enter') {
            addHighScore(playerName || "PILOT", score, passengersRescued);
            gameState = 'HIGHSCORES';
            return;
        }
        if (e.key === 'Backspace') {
            playerName = playerName.slice(0, -1);
            return;
        }
        if (e.key.length === 1 && playerName.length < 8) {
            playerName += e.key.toUpperCase();
        }
        return;
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') activeInputs.yDir = -1;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') activeInputs.yDir = 1;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        activeInputs.xDir = -1;
        activeInputs.facingDir = 'left';
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        activeInputs.xDir = 1;
        activeInputs.facingDir = 'right';
    }
    
    if (e.key === 'Shift') activeInputs.shiftPressed = true;

    if ([' ', 'Enter', 'j', 'J', 'k', 'K', 'l', 'L', 't', 'T'].includes(e.key)) {
        triggerUnifiedAction();
    }

    if (e.key === 'c' || e.key === 'C') {
        if (gameState === 'PLAYING') gameState = 'CUSTOMIZE';
        else if (gameState === 'CUSTOMIZE') gameState = 'PLAYING';
    }
});

window.addEventListener('keyup', (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && activeInputs.yDir === -1) activeInputs.yDir = 0;
    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && activeInputs.yDir === 1) activeInputs.yDir = 0;
    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && activeInputs.xDir === -1) activeInputs.xDir = 0;
    if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && activeInputs.xDir === 1) activeInputs.xDir = 0;
    if (e.key === 'Shift') activeInputs.shiftPressed = false;
});

// --- UNIFIED POINTER EVENT BINDINGS ---
function bindPointerButton(id, onDown, onUp) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        initAudio();
        el.classList.add('pressed');
        if (onDown) onDown();
    });

    el.addEventListener('pointerup', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove('pressed');
        if (onUp) onUp();
    });

    el.addEventListener('pointercancel', (e) => {
        el.classList.remove('pressed');
        if (onUp) onUp();
    });

    el.addEventListener('pointerleave', (e) => {
        el.classList.remove('pressed');
        if (onUp) onUp();
    });
}

// 8-Axis D-Pad Pointer Bindings
bindPointerButton('btn-up', () => { activeInputs.yDir = -1; }, () => { if (activeInputs.yDir === -1) activeInputs.yDir = 0; });
bindPointerButton('btn-down', () => { activeInputs.yDir = 1; }, () => { if (activeInputs.yDir === 1) activeInputs.yDir = 0; });
bindPointerButton('btn-left', () => { activeInputs.xDir = -1; activeInputs.facingDir = 'left'; }, () => { if (activeInputs.xDir === -1) activeInputs.xDir = 0; });
bindPointerButton('btn-right', () => { activeInputs.xDir = 1; activeInputs.facingDir = 'right'; }, () => { if (activeInputs.xDir === 1) activeInputs.xDir = 0; });

// Diagonal Pointer Bindings
bindPointerButton('btn-upleft', () => { activeInputs.yDir = -1; activeInputs.xDir = -1; activeInputs.facingDir = 'left'; }, () => { 
    if (activeInputs.yDir === -1) activeInputs.yDir = 0; 
    if (activeInputs.xDir === -1) activeInputs.xDir = 0; 
});
bindPointerButton('btn-upright', () => { activeInputs.yDir = -1; activeInputs.xDir = 1; activeInputs.facingDir = 'right'; }, () => { 
    if (activeInputs.yDir === -1) activeInputs.yDir = 0; 
    if (activeInputs.xDir === 1) activeInputs.xDir = 0; 
});
bindPointerButton('btn-downleft', () => { activeInputs.yDir = 1; activeInputs.xDir = -1; activeInputs.facingDir = 'left'; }, () => { 
    if (activeInputs.yDir === 1) activeInputs.yDir = 0; 
    if (activeInputs.xDir === -1) activeInputs.xDir = 0; 
});
bindPointerButton('btn-downright', () => { activeInputs.yDir = 1; activeInputs.xDir = 1; activeInputs.facingDir = 'right'; }, () => { 
    if (activeInputs.yDir === 1) activeInputs.yDir = 0; 
    if (activeInputs.xDir === 1) activeInputs.xDir = 0; 
});

// Single Unified Action Button Binding
bindPointerButton('btn-action', () => {
    triggerUnifiedAction();
}, null);

// --- GAMEPAD API INTEGRATION ---
let prevGamepadButtonStates = {};

function pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    
    for (let gp of gamepads) {
        if (!gp) continue;

        let axisX = gp.axes[0] || 0;
        let axisY = gp.axes[1] || 0;
        const deadzone = 0.25;

        let gpXDir = 0;
        let gpYDir = 0;

        // Check Analog Stick X
        if (Math.abs(axisX) > deadzone) {
            gpXDir = axisX > 0 ? 1 : -1;
            activeInputs.facingDir = axisX > 0 ? 'right' : 'left';
        }
        // Check Analog Stick Y
        if (Math.abs(axisY) > deadzone) {
            gpYDir = axisY > 0 ? 1 : -1;
            activeInputs.facingDir = axisX > 0 ? 'right' : 'left';
        }

        // Check D-Pad Buttons (Standard mapping: 12=Up, 13=Down, 14=Left, 15=Right)
        if (gp.buttons[12]?.pressed) gpYDir = -1;
        if (gp.buttons[13]?.pressed) gpYDir = 1;
        if (gp.buttons[14]?.pressed) {
            gpXDir = -1;
            activeInputs.facingDir = 'left';
        }
        if (gp.buttons[15]?.pressed) {
            gpXDir = 1;
            activeInputs.facingDir = 'right';
        }

        // Apply calculated gamepad directions to activeInputs cleanly
        if (gameState === 'PLAYING') {
            activeInputs.xDir = gpXDir;
            activeInputs.yDir = gpYDir;
        }

        // Check all buttons for edge-triggered actions (any button can start, restart, or trigger actions)
        gp.buttons.forEach((btn, index) => {
            const isPressed = btn && btn.pressed;
            const buttonKey = `${gp.index}-${index}`;
            const wasPressed = prevGamepadButtonStates[buttonKey] || false;

            if (isPressed && !wasPressed) {
                triggerUnifiedAction();
            }
            prevGamepadButtonStates[buttonKey] = isPressed;
        });
    }
}

function updateInputs() {
    pollGamepads();
}