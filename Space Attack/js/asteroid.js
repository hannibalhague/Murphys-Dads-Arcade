class Asteroid {
    constructor(canvasWidth) {
        this.width = Math.floor(Math.random() * 24) + 32;
        this.height = this.width;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 0.5 + 0.3; // Decreased speed so they float by slower[cite: 12]
        this.dx = (Math.random() - 0.5) * 0.4; // Reduced horizontal drift to match[cite: 12]
        this.hp = Math.floor(this.width / 10);
        this.maxHp = this.hp;
        this.rotation = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.015; // Slower rotation speed[cite: 12]
        this.markedForDeletion = false;

        this.vertices = 8;
        this.offsets = [];
        for (let i = 0; i < this.vertices; i++) {
            this.offsets.push(Math.random() * 0.3 + 0.85);
        }
    }

    update() {
        this.x += this.dx;
        this.y += this.speed;
        this.rotation += this.rotSpeed;

        if (this.y > 680) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        const radius = this.width / 2;

        ctx.fillStyle = '#4a5568';
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < this.vertices; i++) {
            const angle = (i / this.vertices) * Math.PI * 2;
            const r = radius * this.offsets[i];
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.arc(radius * 0.3, radius * 0.25, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}