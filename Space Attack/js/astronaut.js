class Astronaut {
    constructor(canvasWidth) {
        this.width = 30;
        this.height = 36;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 0.4 + 0.2; // Extra slow drifting speed for a floating zero-g effect[cite: 9]
        this.driftSpeed = (Math.random() - 0.5) * 1.0; 
        this.animTime = Math.random() * Math.PI * 2;
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;
        this.animTime += 0.03;
        this.x += Math.sin(this.animTime) * 0.5; // Gentle floating side-to-side drift

        if (this.y > 680) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#edf2f7';
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect = ctx.roundRect || function(x, y, w, h, r) {
            this.beginPath(); this.rect(x,y,w,h); this.closePath();
        };
        ctx.fillRect(-10, -10, 20, 22);
        ctx.strokeRect(-10, -10, 20, 22);

        ctx.fillStyle = '#edf2f7';
        ctx.beginPath();
        ctx.arc(0, -14, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d69e2e'; 
        ctx.beginPath();
        ctx.arc(0, -14, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a0aec0';
        ctx.fillRect(-13, -6, 5, 12);

        ctx.fillStyle = '#edf2f7';
        ctx.fillRect(-14, -2, 5, 10);
        ctx.fillRect(9, -2, 5, 10);

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(-9, 12, 7, 5);
        ctx.fillRect(2, 12, 7, 5);

        ctx.restore();
    }
}