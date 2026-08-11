class Particle {
    constructor(x, y, color, type = 'circle') {
        this.x = x;
        this.y = y;
        this.color = color || '#ffaa00';
        this.type = type; 
        
        const angle = Math.random() * Math.PI * 2;
        const isAstronautPart = (this.type === 'limb' || this.type === 'helmet' || this.type === 'boot' || this.type === 'glove');
        const isBlood = (this.type === 'blood');
        
        let speed;
        if (isBlood) {
            speed = Math.random() * 1.0 + 0.2; // Extra slow drifting blood for zero-g[cite: 5]
        } else if (isAstronautPart) {
            speed = Math.random() * 1.2 + 0.5;
        } else {
            speed = Math.random() * 2.0 + 0.8;
        }
        
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        
        if (isBlood) {
            this.size = Math.random() * 4 + 1.5;
            this.life = 5.5; 
            this.decay = Math.random() * 0.0008 + 0.0004; 
        } else {
            this.size = isAstronautPart ? (Math.random() * 5 + 4) : (Math.random() * 4 + 2);
            this.life = isAstronautPart ? 4.5 : 1.5; 
            this.decay = isAstronautPart ? (Math.random() * 0.001 + 0.0008) : (Math.random() * 0.01 + 0.008);
        }

        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = isAstronautPart ? (Math.random() - 0.5) * 0.006 : (Math.random() - 0.5) * 0.1;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        const isAstronautPart = (this.type === 'limb' || this.type === 'helmet' || this.type === 'boot' || this.type === 'glove');
        const isBlood = (this.type === 'blood');
        
        const drag = isBlood ? 0.999 : (isAstronautPart ? 0.9995 : 0.98); // High retention drag for space weightlessness[cite: 5]
        
        this.dx *= drag; 
        this.dy *= drag;
        this.rotation += this.rotSpeed;
        this.life -= this.decay;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.min(1.0, Math.max(0, this.life));
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'limb') {
            ctx.fillStyle = '#edf2f7';
            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 1.5;
            ctx.fillRect(-4, -10, 8, 20);
            ctx.strokeRect(-4, -10, 8, 20);
            
            ctx.strokeStyle = '#a0aec0';
            ctx.beginPath();
            ctx.moveTo(-4, -4); ctx.lineTo(4, -4);
            ctx.moveTo(-4, 2); ctx.lineTo(4, 2);
            ctx.stroke();

            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-3, -11, 6, 3);
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -10, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'helmet') {
            ctx.fillStyle = '#d69e2e';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(-2, -2, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'boot') {
            ctx.fillStyle = '#cbd5e0';
            ctx.strokeStyle = '#4a5568';
            ctx.lineWidth = 1.5;
            ctx.fillRect(-5, -6, 10, 14);
            ctx.strokeRect(-5, -6, 10, 14);

            ctx.fillStyle = '#2d3748';
            ctx.fillRect(-6, 4, 12, 4);

            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-4, -7, 8, 3);
        } else if (this.type === 'glove') {
            ctx.fillStyle = '#e2e8f0';
            ctx.strokeStyle = '#a0aec0';
            ctx.lineWidth = 1;
            ctx.fillRect(-4, -5, 8, 10);
            ctx.strokeRect(-4, -5, 8, 10);

            ctx.fillStyle = '#cbd5e0';
            ctx.beginPath();
            ctx.arc(4, 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-3, -6, 6, 2);
        } else if (this.type === 'blood') {
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.arc(0, 0, this.size + 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-0.5, -0.5, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}