class Bullet {
    constructor(x, y, dx = 0, dy = -4.5, type = 1) { // Reduced default dy speed for floaty pacing[cite: 1]
        this.x = x - 3;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.type = type; // 1: Standard, 2: Spread, 3: Rapid/Plasma, 4: Enemy Projectile
        this.width = type === 2 ? 8 : 6;
        this.height = type === 2 ? 8 : 14;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.y < -30 || this.y > 680 || this.x < 0 || this.x > 480) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.type === 4) {
            ctx.fillStyle = '#dd6b20';
            ctx.fillRect(-2, -6, 4, 12);
            ctx.fillStyle = '#ff3300';
            ctx.fillRect(-1, -4, 2, 8);
        } else if (this.type === 2) {
            ctx.fillStyle = '#f6ad55';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fffaf0';
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 3) {
            ctx.fillStyle = '#38a169';
            ctx.fillRect(-2, -8, 4, 16);
            ctx.fillStyle = '#68d391';
            ctx.fillRect(-1, -6, 2, 12);
        } else {
            ctx.fillStyle = '#3182ce';
            ctx.fillRect(-2, -7, 4, 14);
            ctx.fillStyle = '#63b3ed';
            ctx.fillRect(-1, -5, 2, 10);
        }

        ctx.restore();
    }
}