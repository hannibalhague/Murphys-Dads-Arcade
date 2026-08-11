// =======================
// js/objects.js
// =======================
window.Objects = {
    platforms: [],
    lastX: 0,
    collectibleHearts: [],

    reset() {
        this.platforms = [];
        this.lastX = 0;
        this.collectibleHearts = [];
    },

    spawnHeartFlyby(worldOffset, canvasWidth) {
        this.collectibleHearts.push({
            x: worldOffset + canvasWidth + 50,
            y: Math.random() * 120 + 60,
            w: 24,
            h: 24,
            dead: false
        });
    },

    update(dt, worldOffset, canvasWidth, GROUND_Y) {
        while (this.lastX < worldOffset + canvasWidth + 600) {
            let width = Math.random() * 400 + 300;
            let gap = Math.random() * 80 + 120;

            if (this.platforms.length > 0) {
                let pitWidth = gap;
                this.lastX += pitWidth;
            }

            this.platforms.push({
                x: this.lastX,
                w: width
            });
            this.lastX += width;
        }

        if (this.platforms.length > 0 && this.platforms[0].x + this.platforms[0].w < worldOffset - 200) {
            this.platforms.shift();
        }

        this.collectibleHearts = this.collectibleHearts.filter(h => !h.dead && h.x > worldOffset - 100);
    },

    checkSolid(worldX) {
        for (let p of this.platforms) {
            if (worldX >= p.x && worldX <= p.x + p.w) return true;
        }
        return false;
    },

    checkHeartCollisions(player, worldOffset) {
        for (let heart of this.collectibleHearts) {
            if (heart.dead) continue;
            let heartScreenX = heart.x - worldOffset;
            if (
                player.x < heartScreenX + heart.w &&
                player.x + player.w > heartScreenX &&
                player.y < heart.y + heart.h &&
                player.y + player.h > heart.y
            ) {
                heart.dead = true;
                if (window.GameAPI && window.GameAPI.addHeart) {
                    window.GameAPI.addHeart();
                }
            }
        }
    },

    draw(ctx, worldOffset) {
        this.drawSpikes(ctx);

        this.collectibleHearts.forEach(heart => {
            if (heart.dead) return;
            let x = heart.x - worldOffset;
            if (x > -50 && x < 700) {
                ctx.save();
                ctx.fillStyle = "#FF1744";
                ctx.font = "20px Arial";
                ctx.fillText("❤️", x, heart.y);
                ctx.restore();
            }
        });

        this.platforms.forEach(p => {
            const x = p.x - worldOffset;
            const y = 265;

            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(x, y + 5, p.w, 35);

            ctx.fillStyle = "#333";
            ctx.fillRect(x, y, p.w, 150);

            ctx.fillStyle = "#FFD700";
            for (let dx = 20; dx < p.w - 40; dx += 80) {
                ctx.fillRect(x + dx, y + 60, 40, 5);
            }

            ctx.fillStyle = "#555";
            ctx.fillRect(x, y, p.w, 5);
        });
    },

    drawSpikes(ctx) {
        const spikeWidth = 20;
        const spikeHeight = 45;
        const count = 32;

        let pitGrad = ctx.createLinearGradient(0, 265, 0, 360);
        pitGrad.addColorStop(0, "#000");
        pitGrad.addColorStop(1, "#1a0000");
        ctx.fillStyle = pitGrad;
        ctx.fillRect(0, 265, 640, 100);

        ctx.fillStyle = "#90A4AE";
        for (let i = 0; i < count; i++) {
            let sx = i * spikeWidth;
            let sy = 360;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + spikeWidth / 2, sy - spikeHeight);
            ctx.lineTo(sx + spikeWidth, sy);
            ctx.fill();

            ctx.fillStyle = "#B0BEC5";
            ctx.fillRect(sx + spikeWidth / 2 - 1, sy - spikeHeight + 10, 2, 10);
            ctx.fillStyle = "#90A4AE";
        }
    }
};