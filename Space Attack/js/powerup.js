class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.dy = 1.5;
        this.markedForDeletion = false;

        const rand = Math.random();
        if (rand < 0.25) {
            this.type = 2;
        } else if (rand < 0.45) {
            this.type = 3;
        } else if (rand < 0.6) {
            this.type = 4;
        } else if (rand < 0.8) {
            this.type = 'health';
        } else {
            this.type = 'shield';
        }
    }

    update() {
        this.y += this.dy;
        if (this.y > 700) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.type === 'health') {
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', 0, 0);
        } else if (this.type === 'shield') {
            ctx.fillStyle = '#00f5ff';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('S', 0, 0);
        } else {
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(-10, -10, 20, 20);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.type, 0, 0);
        }

        ctx.restore();
    }
}