// =================================================================
//   EXPANDED CAR & NPC MODULE (DETAILED PIXEL ART & DYNAMIC SPAWNING)
// =================================================================

class DetailedDriveableCar {
    constructor(x, y) {
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 6.0;
        this.driver = null;
        this.width = 130;
        this.height = 65;
        this.isDestroyed = false;
        this.respawnTimer = 0;
        this.wheelRotation = 0;
    }

    enterCar(fighter) {
        if (this.isDestroyed) return;
        this.driver = fighter;
        this.vx = 0;
        this.vy = 0;
    }

    exitCar() {
        if (this.driver) {
            this.driver.x = this.x - 45;
            this.driver.y = this.y;
            this.driver = null;
        }
    }

    update() {
        if (this.isDestroyed) {
            this.respawnTimer++;
            if (this.respawnTimer > 180) {
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.vx = 0;
                this.vy = 0;
                this.isDestroyed = false;
                this.respawnTimer = 0;
            }
            return;
        }

        if (!this.driver) return;

        let moving = false;
        let accel = 0.45;

        if (Input.isMovingLeft()) { this.vx -= accel; moving = true; }
        if (Input.isMovingRight()) { this.vx += accel; moving = true; }
        if (Input.isMovingUp() && this.y > CONFIG.minY) { this.vy -= accel; moving = true; }
        if (Input.isMovingDown() && this.y < CONFIG.maxY + 25) { this.vy += accel; moving = true; }

        this.vx *= 0.91;
        this.vy *= 0.91;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 100) { this.x = 100; this.vx = 0; }
        if (this.x > CONFIG.worldWidth - 100) { this.x = CONFIG.worldWidth - 100; this.vx = 0; }
        if (this.y < CONFIG.minY) { this.y = CONFIG.minY; this.vy = 0; }
        if (this.y > CONFIG.maxY + 25) { this.y = CONFIG.maxY + 25; this.vy = 0; }

        if (moving) {
            this.wheelRotation += Math.hypot(this.vx, this.vy) * 0.1;
        }

        let inPit = (this.x >= 50 && this.x <= 230 && this.y >= 340 && this.y <= 740);
        if (inPit) {
            this.explode();
            return;
        }

        this.driver.x = this.x;
        this.driver.y = this.y;

        let speedMag = Math.hypot(this.vx, this.vy);
        if (speedMag > 1.5 && typeof npcs !== 'undefined') {
            npcs.forEach(npc => {
                if (!npc.isDefeated && Math.abs(this.x - npc.x) < 60 && Math.abs(this.y - npc.y) < 32) {
                    npc.receiveHit(45, this.vx >= 0 ? 'right' : 'left', true, true);
                    if (typeof bloodSystem !== 'undefined') {
                        bloodSystem.addHitSplatter(npc.x, npc.y, this.vx >= 0 ? 'right' : 'left');
                    }
                    if (typeof addScore === 'function') addScore(60);
                }
            });
        }
    }

    explode() {
        this.isDestroyed = true;
        if (typeof activeCarExplosion !== 'undefined') {
            activeCarExplosion = {
                x: this.x,
                y: this.y,
                radius: 10,
                maxRadius: 90,
                alpha: 1.0
            };
        }
        if (typeof audioManager !== 'undefined') {
            audioManager.playDeath();
        }

        if (this.driver && this.driver.isPlayer) {
            let currentDriver = this.driver;
            currentDriver.health = 0;
            currentDriver.isDefeated = true;
            this.driver = null;

            setTimeout(() => {
                currentDriver.health = currentDriver.maxHealth;
                currentDriver.isDefeated = false;
                currentDriver.isKnockedDown = false;
                currentDriver.z = 0;
                currentDriver.zVelocity = 0;
                currentDriver.x = CONFIG.worldWidth / 2;
                currentDriver.y = CONFIG.worldHeight / 2;
            }, 1000);
        } else if (this.driver) {
            this.driver.health = 0;
            this.driver.isDefeated = true;
            this.driver = null;
        }
    }

    draw(ctx) {
        if (this.isDestroyed) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(2.2, 2.2);

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-38, 16, 76, 12);

        // Main Car Body Chassis
        ctx.fillStyle = '#1e293b'; // Under-body trim
        ctx.fillRect(-34, 4, 68, 14);

        ctx.fillStyle = '#b91c1c'; // Deep Red Car Body Paint
        ctx.fillRect(-32, -8, 64, 20);

        // Car Hood & Trunk Contour Highlights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-30, -6, 60, 4);

        // Cabin & Windows (Windshield and Side Windows)
        ctx.fillStyle = '#0f172a'; // Window Frame Base
        ctx.fillRect(-16, -24, 32, 16);

        ctx.fillStyle = '#38bdf8'; // Tinted Glass Window Color
        ctx.fillRect(-14, -22, 12, 12); // Front Window
        ctx.fillRect(2, -22, 12, 12);  // Rear Window

        // Center Pillar (B-Pillar)
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-2, -22, 4, 12);

        // Doors & Door Handles (Real Car Detail)
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1;
        ctx.strokeRect(-18, -10, 36, 22);
        
        ctx.fillStyle = '#cbd5e1'; // Chrome Door Handle
        ctx.fillRect(-4, -2, 4, 2);

        // Headlights (Glowing Yellow/White)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(30, -6, 4, 8);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)'; // Headlight beam glow
        ctx.fillRect(34, -7, 8, 10);

        // Taillights (Glowing Red)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-34, -6, 3, 8);

        // Wheels with Rotating Rims
        const drawWheel = (wx, wy) => {
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.arc(wx, wy, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wx, wy, 4, 0, Math.PI * 2);
            ctx.stroke();

            // Rotating spoke indicator
            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(this.wheelRotation);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-3, 0); ctx.lineTo(3, 0);
            ctx.moveTo(0, -3); ctx.lineTo(0, 3);
            ctx.stroke();
            ctx.restore();
        };

        drawWheel(-20, 12);
        drawWheel(20, 12);

        ctx.restore();
    }
}

// =================================================================
//   EXPANDED NPC MANAGER & CROWD SPAWNER
// =================================================================
class ExpandedNPCManager {
    constructor() {
        this.extraRoster = [
            { name: 'STREET VIPER', colors: { shirt: '#047857', pants: '#111827', skin: '#d97706', hair: '#1f2937' } },
            { name: 'BRUISER MICK', colors: { shirt: '#4338ca', pants: '#1e293b', skin: '#c2410c', hair: '#f8fafc' } },
            { name: 'ASPHALT GHOST', colors: { shirt: '#334155', pants: '#0f172a', skin: '#e2e8f0', hair: '#38bdf8' } }
        ];
    }

    spawnExtraNPCs() {
        if (typeof npcs !== 'undefined' && npcs.length < 5) {
            let randomTemplate = this.extraRoster[Math.floor(Math.random() * this.extraRoster.length)];
            let newNpc = new Fighter(
                CONFIG.worldWidth / 2 + (Math.random() * 300 - 150),
                CONFIG.worldHeight / 2 + (Math.random() * 100 - 50),
                randomTemplate.name,
                false,
                randomTemplate.colors
            );
            npcs.push(newNpc);
        }
    }
}

const extendedNPCManager = new ExpandedNPCManager();
setInterval(() => { extendedNPCManager.spawnExtraNPCs(); }, 20000); // Periodically spawn reinforcements into the brawl