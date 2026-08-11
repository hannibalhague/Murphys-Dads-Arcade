// =======================
// js/stars.js - NPC-STYLE SPAWNING & COLLECTION
// =======================
window.Stars = {
    list: [],
    starScore: 0,

    reset() {
        this.list = [];
        this.starScore = 0;
    },

    spawnRandom(worldOffset, canvasWidth, GROUND_Y) {
        // Spawn interval control (similar to NPCs)
        if (this.list.length >= 4) return;
        if (Math.random() > 0.04) return;

        // Place them at a reachable jumping height or walking height
        const minY = GROUND_Y - 140;
        const maxY = GROUND_Y - 40;
        const y = minY + Math.random() * (maxY - minY);

        const star = {
            x: worldOffset + canvasWidth + 100,
            y: y,
            w: 30,
            h: 30,
            floatOffset: Math.random() * Math.PI * 2
        };

        this.list.push(star);
    },

    update(dt, worldOffset, canvasWidth) {
        // Keep stars that are still visible ahead or on screen
        this.list = this.list.filter(star => star.x - worldOffset > -60 && star.x - worldOffset < canvasWidth + 200);
    },

    draw(ctx, worldOffset, time) {
        for (let i = 0; i < this.list.length; i++) {
            const star = this.list[i];
            const x = star.x - worldOffset;
            
            // Gentle hovering bob
            const yOffset = Math.sin(time * 0.006 + star.floatOffset) * 8;
            const drawY = star.y + yOffset;

            ctx.save();
            ctx.translate(x + star.w / 2, drawY + star.h / 2);
            ctx.rotate(time * 0.004);

            // Draw Bright Yellow Star
            ctx.fillStyle = "#FFD700";
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;

            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
                const outerRadius = 15;
                const innerRadius = 7;
                
                const ox = Math.cos(angle) * outerRadius;
                const oy = Math.sin(angle) * outerRadius;
                if (j === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);

                const innerAngle = angle + (2 * Math.PI) / 10;
                const ix = Math.cos(innerAngle) * innerRadius;
                const iy = Math.sin(innerAngle) * innerRadius;
                ctx.lineTo(ix, iy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
};