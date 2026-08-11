class Star {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.4 + 0.1; 
        this.brightness = Math.random();
    }

    update(canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight) {
            this.y = 0;
            this.x = Math.random() * window.innerWidth;
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class CelestialBody {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
    }

    reset() {
        this.radius = Math.random() * 40 + 20; 
        this.x = Math.random() * (this.canvasWidth - this.radius * 2) + this.radius;
        this.y = -this.radius * 2;
        this.speed = Math.random() * 0.15 + 0.05; 

        const types = ['earth', 'gas', 'rocky'];
        this.type = types[Math.floor(Math.random() * types.length)];
    }

    update() {
        this.y += this.speed;
        if (this.y - this.radius > this.canvasHeight) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        if (this.type === 'earth') {
            ctx.fillStyle = '#1e3a8a'; 
            ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.arc(this.x + this.radius * 0.4, this.y + this.radius * 0.2, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'gas') {
            ctx.fillStyle = '#b45309'; 
            ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

            ctx.fillStyle = '#92400e';
            ctx.fillRect(this.x - this.radius, this.y - this.radius * 0.3, this.radius * 2, this.radius * 0.3);
            ctx.fillStyle = '#d97706';
            ctx.fillRect(this.x - this.radius, this.y + this.radius * 0.2, this.radius * 2, this.radius * 0.25);
        } else {
            ctx.fillStyle = '#6b7280'; 
            ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.2, this.y - this.radius * 0.3, this.radius * 0.25, 0, Math.PI * 2);
            ctx.arc(this.x + this.radius * 0.3, this.y + this.radius * 0.4, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class DebrisPiece {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvasWidth;
        this.y = -20;
        this.size = Math.random() * 4 + 2; 
        this.speed = Math.random() * 0.6 + 0.2;
        this.drift = (Math.random() - 0.5) * 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.opacity = Math.random() * 0.4 + 0.3;
    }

    update() {
        this.y += this.speed;
        this.x += this.drift;
        this.rotation += this.rotSpeed;

        if (this.y > this.canvasHeight + 20) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.fillStyle = '#718096';
        ctx.fillRect(-this.size, -this.size / 2, this.size * 1.5, this.size * 0.8);

        ctx.restore();
    }
}

class FarExplodedShip {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
    }

    reset() {
        this.x = Math.random() * (this.canvasWidth - 140) + 70;
        this.y = -150;
        this.speed = 0.35; 
        this.driftX = (Math.random() - 0.5) * 0.15;
        this.timer = 0;
        this.spawnInterval = Math.random() * 2500 + 3500; 
        this.active = false;
        
        // Floating astronauts drifting around the wreckage
        this.astronauts = [
            { offsetX: -28, offsetY: -15, driftX: -0.04, driftY: 0.02, rot: Math.random() * Math.PI, rotSpeed: 0.01 },
            { offsetX: 32, offsetY: 20, driftX: 0.03, driftY: 0.03, rot: Math.random() * Math.PI, rotSpeed: -0.015 }
        ];
    }

    update() {
        if (!this.active) {
            this.timer++;
            if (this.timer >= this.spawnInterval) {
                this.active = true;
                this.x = Math.random() * (this.canvasWidth - 180) + 90;
                this.y = -100;
                this.timer = 0;
            }
            return;
        }

        this.y += this.speed;
        this.x += this.driftX;

        this.astronauts.forEach(ast => {
            ast.offsetX += ast.driftX;
            ast.offsetY += ast.driftY;
            ast.rot += ast.rotSpeed;
        });

        if (this.y > this.canvasHeight + 150) {
            this.active = false;
            this.spawnInterval = Math.random() * 3000 + 4000;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // --- LEFT WING SECTION (Blown to the left and tilted) ---
        ctx.save();
        ctx.translate(-22, 5);
        ctx.rotate(-0.6);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-14, 15);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3182ce';
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-16, 16);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // --- RIGHT COCKPITS / FUSELAGE SECTION (Blown to the right with clear canopy glass) ---
        ctx.save();
        ctx.translate(22, -5);
        ctx.rotate(0.6);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(12, 14);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();

        // Distinct blue cockpit glass visible on this side piece
        ctx.fillStyle = '#63b3ed';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(6, 4);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // --- LAYERED MULTI-STAGE FIREBALL IN THE CENTER ---
        // Outer dark plasma smoke
        ctx.fillStyle = 'rgba(75, 85, 99, 0.6)';
        ctx.beginPath();
        ctx.arc(-4, -6, 16, 0, Math.PI * 2);
        ctx.arc(6, 8, 14, 0, Math.PI * 2);
        ctx.fill();

        // Deep red/orange outer fire
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Bright orange core flame
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(2, -2, 12, 0, Math.PI * 2);
        ctx.fill();

        // Yellow fiery center
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(-1, 1, 7, 0, Math.PI * 2);
        ctx.fill();

        // White hot center spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Flying fiery sparks & embers
        ctx.fillStyle = '#ff3300';
        ctx.fillRect(-20, -10, 3, 3);
        ctx.fillRect(18, 12, 3, 3);
        ctx.fillRect(-6, -24, 3, 3);
        ctx.fillRect(10, -18, 2, 2);
        ctx.fillRect(-14, 16, 2, 2);

        // --- FLOATING ASTRONAUTS ---
        this.astronauts.forEach(ast => {
            ctx.save();
            ctx.translate(ast.offsetX, ast.offsetY);
            ctx.rotate(ast.rot);

            // Suit body (solid white)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3, -4, 6, 8);

            // Gold visor helmet
            ctx.fillStyle = '#d97706';
            ctx.fillRect(-2, -6, 4, 3);

            ctx.restore();
        });

        ctx.restore();
    }
}

class SpaceBackground {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.stars = [];
        for (let i = 0; i < 140; i++) {
            this.stars.push(new Star(canvasWidth, canvasHeight));
        }
        this.celestialBodies = [
            new CelestialBody(canvasWidth, canvasHeight)
        ];
        this.debrisList = [];
        for (let i = 0; i < 8; i++) {
            this.debrisList.push(new DebrisPiece(canvasWidth, canvasHeight));
        }
        this.explodedShip = new FarExplodedShip(canvasWidth, canvasHeight);
    }

    update() {
        this.stars.forEach(star => star.update(this.canvasHeight));
        this.celestialBodies.forEach(body => body.update());
        this.debrisList.forEach(debris => debris.update());
        this.explodedShip.update();
    }

    draw(ctx) {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].draw(ctx);
        }

        this.celestialBodies.forEach(body => body.draw(ctx));
        this.debrisList.forEach(debris => debris.draw(ctx));
        this.explodedShip.draw(ctx);
    }
}