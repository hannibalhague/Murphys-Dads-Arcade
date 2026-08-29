import { initGame, gameLoop } from "./game.js";

window.onload = () => {
    initGame();
    requestAnimationFrame(gameLoop);
};
