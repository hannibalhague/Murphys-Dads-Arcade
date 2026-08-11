// =================================================================
//   INPUT MANAGER SCRIPT (WITH MUSIC TOGGLE ON SELECT / BACK)
// =================================================================
class InputManager {
    constructor() {
        this.keys = {};
        this.paused = false;
        this.restartRequested = false;
        this.musicToggleRequested = false;

        this.pKeyHeld = false;
        this.rKeyHeld = false;
        this.mKeyHeld = false;
        this.anyKeyPressed = false;

        this.virtualStates = {
            left: false,
            right: false,
            up: false,
            down: false,
            punch: false,
            kick: false,
            jump: false,
            pickup: false,
            block: false,
            special: false,
            pause: false,
            restart: false
        };

        this.gamepadIndex = null;
        this.gpButtonPrev = {};

        this.initKeyboardListeners();
        this.initGamepadListeners();
    }

    initKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.anyKeyPressed = true;
            this.keys[e.code] = true;

            if (e.code === 'KeyP') {
                if (!this.pKeyHeld) {
                    this.paused = !this.paused;
                    this.pKeyHeld = true;
                }
            }

            if (e.code === 'Enter') {
                if (!this.rKeyHeld) {
                    this.restartRequested = true;
                    this.rKeyHeld = true;
                }
            }

            if (e.code === 'KeyM') {
                if (!this.mKeyHeld) {
                    this.musicToggleRequested = true;
                    this.mKeyHeld = true;
                }
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            if (e.code === 'KeyP') {
                this.pKeyHeld = false;
            }

            if (e.code === 'Enter') {
                this.rKeyHeld = false;
            }

            if (e.code === 'KeyM') {
                this.mKeyHeld = false;
            }
        });
    }

    initGamepadListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepadIndex = e.gamepad.index;
            console.log(`Gamepad connected at index ${e.gamepad.index}: ${e.gamepad.id}`);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            if (this.gamepadIndex === e.gamepad.index) {
                this.gamepadIndex = null;
                console.log('Gamepad disconnected');
            }
        });
    }

    pollGamepad() {
        if (this.gamepadIndex === null) {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    this.gamepadIndex = i;
                    break;
                }
            }
        }

        if (this.gamepadIndex === null) return;

        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];
        if (!gp) return;

        for (let i = 0; i < gp.buttons.length; i++) {
            if (gp.buttons[i].pressed) {
                this.anyKeyPressed = true;
                break;
            }
        }

        const isPressed = (btnIndex) => gp.buttons[btnIndex] && gp.buttons[btnIndex].pressed;

        const justPressed = (btnIndex, keyName) => {
            const pressed = isPressed(btnIndex);
            const wasPressed = this.gpButtonPrev[keyName] || false;
            this.gpButtonPrev[keyName] = pressed;
            return pressed && !wasPressed;
        };

        // Pause toggle (Start button / Button 9)
        if (justPressed(9, 'pause')) {
            this.paused = !this.paused;
        }

        // Music toggle (Select / Back button / Button 8)
        if (justPressed(8, 'musicToggle')) {
            this.musicToggleRequested = true;
        }

        const deadzone = 0.25;
        const leftStickX = gp.axes[0] || 0;
        const leftStickY = gp.axes[1] || 0;

        this.gpLeftStickX = leftStickX;
        this.gpLeftStickY = leftStickY;

        this.gpDpadLeft = isPressed(14) || leftStickX < -deadzone;
        this.gpDpadRight = isPressed(15) || leftStickX > deadzone;
        this.gpDpadUp = isPressed(12) || leftStickY < -deadzone;
        this.gpDpadDown = isPressed(13) || leftStickY > deadzone;

        this.gpButtonA = isPressed(0);     
        this.gpButtonB = isPressed(1);     
        this.gpButtonX = isPressed(2);     
        this.gpButtonY = isPressed(3);     
        this.gpButtonLB = isPressed(4);    
    }

    setVirtualButton(actionName, isPressed) {
        if (this.virtualStates.hasOwnProperty(actionName)) {
            this.virtualStates[actionName] = isPressed;
            if (isPressed) {
                this.anyKeyPressed = true;
                if (actionName === 'pause') {
                    this.paused = !this.paused;
                }
                if (actionName === 'restart') {
                    this.restartRequested = true;
                }
            }
        }
    }

    isMovingLeft() {
        this.pollGamepad();
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.virtualStates['left'] || (this.gpDpadLeft);
    }

    isMovingRight() {
        this.pollGamepad();
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.virtualStates['right'] || (this.gpDpadRight);
    }

    isMovingUp() {
        this.pollGamepad();
        return this.keys['ArrowUp'] || this.keys['KeyW'] || this.virtualStates['up'] || (this.gpDpadUp);
    }

    isMovingDown() {
        this.pollGamepad();
        return this.keys['ArrowDown'] || this.keys['KeyS'] || this.virtualStates['down'] || (this.gpDpadDown);
    }

    getMovementVector() {
        this.pollGamepad();
        let moveX = 0;
        let moveY = 0;

        if (this.isMovingLeft()) moveX -= 1;
        if (this.isMovingRight()) moveX += 1;
        if (this.isMovingUp()) moveY -= 1;
        if (this.isMovingDown()) moveY += 1;

        if (Math.abs(moveX) === 0 && Math.abs(moveY) === 0 && this.gamepadIndex !== null) {
            const deadzone = 0.25;
            if (Math.abs(this.gpLeftStickX) > deadzone) moveX = this.gpLeftStickX;
            if (Math.abs(this.gpLeftStickY) > deadzone) moveY = this.gpLeftStickY;
        }

        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        if (length > 1) {
            moveX /= length;
            moveY /= length;
        }

        return { x: moveX, y: moveY };
    }

    isPunching() {
        this.pollGamepad();
        return this.keys['KeyJ'] || this.virtualStates['punch'] || this.gpButtonA;
    }

    isKicking() {
        this.pollGamepad();
        return this.keys['KeyK'] || this.virtualStates['kick'] || this.gpButtonB;
    }

    isJumping() {
        this.pollGamepad();
        return this.keys['Space'] || this.virtualStates['jump'] || this.gpButtonX;
    }

    isPickupPressed() {
        this.pollGamepad();
        return this.keys['KeyI'] || this.virtualStates['pickup'] || this.gpButtonY;
    }

    isThrowPressed() {
        return this.isPickupPressed();
    }

    isBlocking() {
        this.pollGamepad();
        return this.keys['KeyO'] || this.virtualStates['block'] || this.gpButtonLB;
    }

    isRunning() {
        return this.isBlocking() && (this.isMovingLeft() || this.isMovingRight() || this.isMovingUp() || this.isMovingDown());
    }

    isSpecialPressed() {
        this.pollGamepad();
        return this.keys['KeyL'] || this.virtualStates['special'];
    }

    isActionPressed() {
        return this.isPunching() || this.isKicking() || this.isJumping() || this.isPickupPressed() || this.isBlocking() || this.isSpecialPressed();
    }

    isRestartPressed() {
        this.pollGamepad();
        return this.restartRequested || this.keys['Enter'];
    }

    isMusicTogglePressed() {
        this.pollGamepad();
        if (this.musicToggleRequested) {
            this.musicToggleRequested = false; // consume the flag
            return true;
        }
        return false;
    }
}

const Input = new InputManager();

const RestartControl = {
    lockoutActive: false,
    lockoutTimer: 0,

    initiateLockout(durationMs = 3000) {
        this.lockoutActive = true;
        this.lockoutTimer = Date.now() + durationMs;
    },

    canRestart() {
        if (!this.lockoutActive) return true;
        if (Date.now() >= this.lockoutTimer) {
            this.lockoutActive = false;
            return true;
        }
        return false;
    }
};