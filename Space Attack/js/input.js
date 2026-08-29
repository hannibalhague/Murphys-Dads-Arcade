class InputHandler {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('load', () => {
            this.initTouchControls();
        });
        
        setTimeout(() => {
            this.initTouchControls();
        }, 100);
    }

    initTouchControls() {
        // Standard D-Pad
        this.setupTouchButton('btn-up', 'ArrowUp');
        this.setupTouchButton('btn-down', 'ArrowDown');
        this.setupTouchButton('btn-left', 'ArrowLeft');
        this.setupTouchButton('btn-right', 'ArrowRight');

        // Diagonal 8-Way D-Pad Mappings
        this.setupTouchButton('btn-upleft', ['ArrowUp', 'ArrowLeft']);
        this.setupTouchButton('btn-upright', ['ArrowUp', 'ArrowRight']);
        this.setupTouchButton('btn-downleft', ['ArrowDown', 'ArrowLeft']);
        this.setupTouchButton('btn-downright', ['ArrowDown', 'ArrowRight']);

        // Action Buttons
        this.setupTouchButton('btn-fire', 'Space');
        this.setupTouchButton('btn-arm', 'KeyF'); 
    }

    setupTouchButton(elementId, keyCodes) {
        const btn = document.getElementById(elementId);
        if (!btn) return;

        const codes = Array.isArray(keyCodes) ? keyCodes : [keyCodes];

        const press = (e) => {
            e.preventDefault();
            codes.forEach(code => { this.keys[code] = true; });
            btn.classList.add('active');
        };

        const release = (e) => {
            e.preventDefault();
            codes.forEach(code => { this.keys[code] = false; });
            btn.classList.remove('active');
        };

        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
        
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
    }

    isDown(code) {
        if (!!this.keys[code]) return true;

        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let gp of gamepads) {
            if (!gp) continue;

            if (code === 'ArrowUp') {
                if (gp.buttons[12]?.pressed || gp.axes[1] < -0.5) return true;
            }
            if (code === 'ArrowDown') {
                if (gp.buttons[13]?.pressed || gp.axes[1] > 0.5) return true;
            }
            if (code === 'ArrowLeft') {
                if (gp.buttons[14]?.pressed || gp.axes[0] < -0.5) return true;
            }
            if (code === 'ArrowRight') {
                if (gp.buttons[15]?.pressed || gp.axes[0] > 0.5) return true;
            }
            if (code === 'Space') {
                if (gp.buttons[0]?.pressed || gp.buttons[7]?.pressed) return true;
            }
            if (code === 'KeyF') {
                if (gp.buttons[2]?.pressed || gp.buttons[5]?.pressed) return true;
            }
        }

        return false;
    }
}