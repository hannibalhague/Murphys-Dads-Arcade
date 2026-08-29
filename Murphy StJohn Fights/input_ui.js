// =================================================================
//   TOUCH INPUT UI CONTROLLER (MOBILE OPTIMIZED & RESPONSIVE)
// =================================================================
class InputUIController {
    constructor() {
        this.initTouchListeners();
        this.initTitleScreen();
    }

    initTouchListeners() {
        const buttons = document.querySelectorAll('.touch-btn');

        buttons.forEach(button => {
            const action = button.getAttribute('data-action');
            if (!action) return;

            const handlePressStart = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof Input !== 'undefined') {
                    Input.setVirtualButton(action, true);
                }
                button.classList.add('active');
            };

            const handlePressEnd = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof Input !== 'undefined') {
                    Input.setVirtualButton(action, false);
                }
                button.classList.remove('active');
            };

            button.addEventListener('touchstart', handlePressStart, { passive: false });
            button.addEventListener('touchend', handlePressEnd, { passive: false });
            button.addEventListener('touchcancel', handlePressEnd, { passive: false });

            button.addEventListener('mousedown', handlePressStart);
            button.addEventListener('mouseup', handlePressEnd);
            button.addEventListener('mouseleave', handlePressEnd);
        });
    }

    initTitleScreen() {
        const startBtn = document.getElementById('btn-start-game');
        const titleScreen = document.getElementById('title-screen');

        const startGameHandler = (e) => {
            if (e) e.preventDefault();
            if (titleScreen) {
                titleScreen.style.display = 'none';
            }
            if (typeof startGame === 'function') {
                startGame();
            }
        };

        if (startBtn) {
            startBtn.addEventListener('click', startGameHandler);
            startBtn.addEventListener('touchend', startGameHandler);
        }

        if (titleScreen) {
            titleScreen.addEventListener('click', (e) => {
                if (titleScreen.style.display !== 'none') {
                    startGameHandler(e);
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.touchUIController = new InputUIController();
});