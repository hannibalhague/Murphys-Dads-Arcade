// ==========================================
// js/input.js - FIXED (Continuous Polling Loop Integration)
// ==========================================
window.Input = {
    keys: { a: false, d: false, s: false, up: false, punch: false },
    gamepadState: { left: false, right: false, down: false, jump: false, punch: false, aWasDown: false, startWasDown: false, punchWasDown: false },

    setupInput() {
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected index:", e.gamepad.index, e.gamepad.id);
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("Gamepad disconnected:", e.gamepad.id);
        });

        // --- Keyboard Listeners ---
        window.addEventListener("keydown", e => {
            const state = window.Game?.state;

            if (state === "NAME_ENTRY") {
                if (e.code === "ArrowUp" || e.code === "KeyW") window.Game.changeLetter(-1);
                if (e.code === "ArrowDown" || e.code === "KeyS") window.Game.changeLetter(1);
                if (e.code === "ArrowLeft" || e.code === "KeyA") window.Game.changeLetter(-1); 
                if (e.code === "ArrowRight" || e.code === "KeyD") window.Game.changeLetter(1);  
                if (e.code === "Enter" || e.code === "Space") window.Game.confirmLetter();
                if (e.code === "Backspace") window.Game.backspaceLetter();
                if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) window.Game.typeLetter(e.key);
                return;
            }

            if (state === "GAMEOVER") {
                if (e.code === "Enter" || e.code === "Space" || e.code === "KeyJ" || e.code === "KeyF") {
                    window.GameAPI.restart();
                }
                return;
            }

            if (["ArrowUp", "KeyW", "Space"].includes(e.code)) {
                if (!this.keys.up) {
                    if (state === "TITLE") window.GameAPI.goToCharSelect();
                    else if (state === "CHAR_SELECT") window.CharacterSelect.confirmSelection();
                    else if (window.Player?.requestJump && !window.GameAPI.isPaused()) window.Player.requestJump();
                }
                this.keys.up = true;
            }

            if (e.code === "KeyA" || e.code === "ArrowLeft") {
                this.keys.a = true;
                if (state === "CHAR_SELECT") window.CharacterSelect.moveSelection(-1);
            }
            if (e.code === "KeyD" || e.code === "ArrowRight") {
                this.keys.d = true;
                if (state === "CHAR_SELECT") window.CharacterSelect.moveSelection(1);
            }
            if (e.code === "KeyS" || e.code === "ArrowDown") this.keys.s = true;
            
            if (e.code === "KeyJ" || e.code === "KeyF") {
                if (!this.keys.punch && window.Player?.requestAttack && !window.GameAPI.isPaused()) window.Player.requestAttack();
                this.keys.punch = true;
            }

            if (e.code === "KeyP" || e.code === "Escape") window.GameAPI.togglePause();
            if (e.code === "KeyM") window.GameAPI.toggleMute();
        });

        window.addEventListener("keyup", e => {
            if (["ArrowUp", "KeyW", "Space"].includes(e.code)) this.keys.up = false;
            if (e.code === "KeyA" || e.code === "ArrowLeft") this.keys.a = false;
            if (e.code === "KeyD" || e.code === "ArrowRight") this.keys.d = false;
            if (e.code === "KeyS" || e.code === "ArrowDown") this.keys.s = false;
            if (e.code === "KeyJ" || e.code === "KeyF") this.keys.punch = false;
        });

        // --- On-Screen Touch / Pointer Bindings ---
        const bindButton = (id, keyName, action) => {
            const btn = document.getElementById(id) || document.querySelector(`.${id}`);
            if (!btn) return;

            const activate = (e) => {
                e.preventDefault();
                if (action) action();
                if (keyName) this.keys[keyName] = true;
            };

            const release = (e) => {
                e.preventDefault();
                if (keyName) this.keys[keyName] = false;
            };

            btn.addEventListener("pointerdown", activate);
            btn.addEventListener("pointerup", release);
            btn.addEventListener("pointerleave", release);
            btn.addEventListener("pointercancel", release);
        };

        bindButton("btn-jump", "up", () => {
            const state = window.Game?.state;
            if (state === "GAMEOVER") window.GameAPI.restart(); 
            else if (state === "TITLE") window.GameAPI.goToCharSelect();
            else if (state === "CHAR_SELECT") window.CharacterSelect.confirmSelection();
            else if (state === "NAME_ENTRY") window.Game.confirmLetter(); 
            else if (window.Player?.requestJump && !window.GameAPI.isPaused()) window.Player.requestJump();
        });

        bindButton("btn-punch", "punch", () => {
            const state = window.Game?.state;
            if (state === "GAMEOVER") window.GameAPI.restart(); 
            else if (window.Player?.requestAttack && !window.GameAPI.isPaused()) window.Player.requestAttack();
        });

        bindButton("btn-left", "a", () => {
            const state = window.Game?.state;
            if (state === "CHAR_SELECT") window.CharacterSelect.moveSelection(-1);
            if (state === "NAME_ENTRY") window.Game.changeLetter(-1); 
        });

        bindButton("btn-right", "d", () => {
            const state = window.Game?.state;
            if (state === "CHAR_SELECT") window.CharacterSelect.moveSelection(1);
            if (state === "NAME_ENTRY") window.Game.changeLetter(1);  
        });

        bindButton("btn-down", "s");

        // --- Gamepad Polling Loop (Fixed structure based on working reference) ---
        let lastAxisLeft = false;
        let lastAxisRight = false;
        let lastAxisDown = false;
        let lastAxisUp = false;

        const poll = () => {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            let gp = null;

            // Explicitly iterate to find the active gamepad, just like the working template
            for (let i = 0; i < gamepads.length; i++) {
                const candidate = gamepads[i];
                if (candidate) {
                    const hasActivity = candidate.buttons.some(b => b.pressed) || candidate.axes.some(a => Math.abs(a) > 0.25);
                    if (hasActivity || !gp) {
                        gp = candidate;
                        if (hasActivity) break;
                    }
                }
            }

            if (gp && window.Game) {
                const state = window.Game.state;
                let axisX = gp.axes[0] || 0;
                let axisY = gp.axes[1] || 0;
                const DEADZONE = 0.25;

                const gpLeft = (axisX < -DEADZONE) || !!gp.buttons[14]?.pressed;
                const gpRight = (axisX > DEADZONE) || !!gp.buttons[15]?.pressed;
                const gpDown = (axisY > DEADZONE) || !!gp.buttons[13]?.pressed;
                const gpUp = (axisY < -DEADZONE) || !!gp.buttons[12]?.pressed;
                
                const aDown = !!gp.buttons[0]?.pressed || !!gp.buttons[1]?.pressed;
                const startDown = !!gp.buttons[9]?.pressed || !!gp.buttons[3]?.pressed || !!gp.buttons[7]?.pressed || !!gp.buttons[6]?.pressed;
                const punchBtn = !!gp.buttons[2]?.pressed || !!gp.buttons[3]?.pressed || !!gp.buttons[5]?.pressed;

                this.gamepadState.left = gpLeft;
                this.gamepadState.right = gpRight;
                this.gamepadState.down = gpDown;
                this.gamepadState.jump = aDown || gpUp;
                this.gamepadState.punch = punchBtn;

                if (gpLeft && !lastAxisLeft) {
                    if (state === "CHAR_SELECT") window.CharacterSelect.moveSelection(-1);
                    else if (state === "NAME_ENTRY") window.Game.changeLetter(-1);
                }
                if (gpRight && !lastAxisRight) {
                    if (state === "CHAR_SELECT") window.CharacterSelect.moveSelection(1);
                    else if (state === "NAME_ENTRY") window.Game.changeLetter(1);
                }
                if (gpUp && !lastAxisUp) {
                    if (state === "NAME_ENTRY") window.Game.changeLetter(-1);
                }
                if (gpDown && !lastAxisDown) {
                    if (state === "NAME_ENTRY") window.Game.changeLetter(1);
                }

                if ((aDown && !this.gamepadState.aWasDown) || (startDown && !this.gamepadState.startWasDown)) {
                    if (state === "GAMEOVER") window.GameAPI.restart();
                    else if (state === "TITLE") window.GameAPI.goToCharSelect();
                    else if (state === "CHAR_SELECT") window.CharacterSelect.confirmSelection();
                    else if (state === "NAME_ENTRY") window.Game.confirmLetter(); 
                    else if (startDown && !this.gamepadState.startWasDown && state === "PLAYING") window.GameAPI.togglePause();
                }

                if (state === "PLAYING") {
                    if (aDown && !this.gamepadState.aWasDown) {
                        if (window.Player?.requestJump && !window.GameAPI.isPaused()) window.Player.requestJump();
                    }
                    if (punchBtn && !this.gamepadState.punchWasDown) {
                        if (window.Player?.requestAttack && !window.GameAPI.isPaused()) window.Player.requestAttack();
                    }
                }

                this.gamepadState.aWasDown = aDown;
                this.gamepadState.startWasDown = startDown;
                this.gamepadState.punchWasDown = punchBtn;
                
                lastAxisLeft = gpLeft;
                lastAxisRight = gpRight;
                lastAxisUp = gpUp;
                lastAxisDown = gpDown;
            } else {
                this.gamepadState.left = false;
                this.gamepadState.right = false;
                this.gamepadState.down = false;
                this.gamepadState.jump = false;
                this.gamepadState.punch = false;
            }

            requestAnimationFrame(poll);
        };
        
        requestAnimationFrame(poll);
    },

    inputLeft() { return this.keys.a || this.gamepadState.left; },
    inputRight() { return this.keys.d || this.gamepadState.right; },
    inputDown() { return this.keys.s || this.gamepadState.down; },
    inputJump() { return this.keys.up || this.gamepadState.jump; }
};