// =======================
// js/title.js
// =======================
window.TitleScreen = (function () {
    const state = { loaded: true };
    function init() {}

    function draw(ctx, canvas, time) {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, "#1a1a1a"); grad.addColorStop(1, "#000000");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center"; ctx.fillStyle = "#FFD700"; ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
        ctx.font = "bold 42px Impact";
        ctx.strokeText("Murphy StJohn Skates", canvas.width / 2, 110);
        ctx.fillText("Murphy StJohn Skates", canvas.width / 2, 110);

        ctx.fillStyle = "#FFFFFF"; ctx.font = "16px Courier New";
        ctx.fillText("SKATE OR DIE", canvas.width / 2, 140);

        const blink = 0.5 + 0.5 * Math.sin(time * 0.008);
        ctx.globalAlpha = blink;
        ctx.fillStyle = "#00E5FF";
        ctx.font = "bold 20px Courier New";
        ctx.fillText("PRESS ANY KEY", canvas.width / 2, canvas.height - 80);
        ctx.globalAlpha = 1;
    }

    return { init, draw };
})();