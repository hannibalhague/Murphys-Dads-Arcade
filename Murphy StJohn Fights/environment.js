// =================================================================
//   MODULE 4: SCENERY, SCHOOL YARD & INTERACTIVE OBJECTS (PIXEL ART CARS + BLOOD)
// =================================================================

class BloodSystem {
    constructor() {
        this.particles = [];
        this.splatters = [];
    }

    addHitSplatter(x, y, facing) {
        // Add ground splatter marks
        this.splatters.push({
            x: x + (Math.random() * 20 - 10),
            y: y + (Math.random() * 10 - 5),
            radius: Math.random() * 6 + 4,
            alpha: 0.85
        });
        if (this.splatters.length > 50) this.splatters.shift();

        // Add flying blood particles
        let count = Math.floor(Math.random() * 5) + 5;
        for (let i = 0; i < count; i++) {
            let dir = facing === 'right' ? 1 : -1;
            this.particles.push({
                x: x,
                y: y - 30,
                z: Math.random() * 20 + 10,
                vx: (Math.random() * 6 + 2) * dir,
                vy: Math.random() * 4 - 2,
                vz: Math.random() * 4 + 2,
                size: Math.random() * 3 + 2,
                alpha: 1.0
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.z -= p.vz;
            p.vz -= 0.5; // gravity

            if (p.z <= 0) {
                p.z = 0;
                // Leave a tiny splatter where it lands
                if (Math.random() < 0.4) {
                    this.splatters.push({
                        x: p.x,
                        y: p.y,
                        radius: p.size * 1.2,
                        alpha: 0.7
                    });
                }
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw ground splatters
        ctx.save();
        for (let s of this.splatters) {
            ctx.fillStyle = `rgba(153, 0, 0, ${s.alpha})`;
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw flying particles
        for (let p of this.particles) {
            ctx.fillStyle = `rgba(204, 0, 0, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y - p.z, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

const bloodSystem = new BloodSystem();

// Explosion effect tracker for the car
let activeCarExplosion = null;

class DriveableCar {
    constructor(x, y) {
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5.5;
        this.driver = null;
        this.width = 120;
        this.height = 60;
        this.isDestroyed = false;
        this.respawnTimer = 0;
    }

    enterCar(fighter) {
        if (this.isDestroyed) return;
        this.driver = fighter;
        this.vx = 0;
        this.vy = 0;
    }

    exitCar() {
        if (this.driver) {
            this.driver.x = this.x - 40;
            this.driver.y = this.y;
            this.driver = null;
        }
    }

    update() {
        if (this.isDestroyed) {
            this.respawnTimer++;
            if (this.respawnTimer > 180) { // Respawn car after 3 seconds
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
        let accel = 0.4;

        if (Input.isMovingLeft()) { this.vx -= accel; moving = true; }
        if (Input.isMovingRight()) { this.vx += accel; moving = true; }
        if (Input.isMovingUp() && this.y > CONFIG.minY) { this.vy -= accel; moving = true; }
        if (Input.isMovingDown() && this.y < CONFIG.maxY + 25) { this.vy += accel; moving = true; }

        this.vx *= 0.92;
        this.vy *= 0.92;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 100) { this.x = 100; this.vx = 0; }
        if (this.x > CONFIG.worldWidth - 100) { this.x = CONFIG.worldWidth - 100; this.vx = 0; }
        if (this.y < CONFIG.minY) { this.y = CONFIG.minY; this.vy = 0; }
        if (this.y > CONFIG.maxY + 25) { this.y = CONFIG.maxY + 25; this.vy = 0; }

        // Check if car drives into the pit (Pit bounds: x between 50 and 230, y between 340 and 740)
        let inPit = (this.x >= 50 && this.x <= 230 && this.y >= 340 && this.y <= 740);
        if (inPit) {
            this.explode();
            return;
        }

        this.driver.x = this.x;
        this.driver.y = this.y;

        let speedMag = Math.hypot(this.vx, this.vy);
        if (speedMag > 1.5) {
            npcs.forEach(npc => {
                if (!npc.isDefeated && Math.abs(this.x - npc.x) < 55 && Math.abs(this.y - npc.y) < 30) {
                    npc.receiveHit(40, this.vx >= 0 ? 'right' : 'left', true, true);
                    bloodSystem.addHitSplatter(npc.x, npc.y, this.vx >= 0 ? 'right' : 'left');
                    if (typeof addScore === 'function') addScore(50);
                }
            });
        }
    }

    explode() {
        this.isDestroyed = true;
        
        // Trigger visual explosion at car position
        activeCarExplosion = {
            x: this.x,
            y: this.y,
            radius: 10,
            maxRadius: 80,
            alpha: 1.0
        };

        if (typeof audioManager !== 'undefined') {
            audioManager.playDeath();
        }

        // If player was driving, handle damage/respawn center screen
        if (this.driver && this.driver.isPlayer) {
            let currentDriver = this.driver;
            currentDriver.health = 0;
            currentDriver.isDefeated = true;
            this.driver = null;

            // Respawn player center screen
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
        // Draw explosion if active
        if (activeCarExplosion) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(activeCarExplosion.x, activeCarExplosion.y, activeCarExplosion.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 100, 0, ${activeCarExplosion.alpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 0, ${activeCarExplosion.alpha})`;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();

            activeCarExplosion.radius += 4;
            activeCarExplosion.alpha -= 0.05;
            if (activeCarExplosion.alpha <= 0 || activeCarExplosion.radius >= activeCarExplosion.maxRadius) {
                activeCarExplosion = null;
            }
        }

        if (this.isDestroyed) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(2.0, 2.0);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-35, 15, 70, 12);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-30, -10, 60, 24);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-15, -22, 30, 14);

        ctx.fillStyle = '#030712';
        ctx.fillRect(-25, 4, 12, 12);
        ctx.fillRect(13, 4, 12, 12);

        ctx.restore();
    }
}

const Environment = {
    drawBackground(ctx, cameraX, canvasWidth, worldWidth) {
        // [Background drawing code remains unchanged]
        const parkingLotX = worldWidth - 220;

        let skyGradient = ctx.createLinearGradient(0, 0, 0, 260);
        skyGradient.addColorStop(0, '#0f172a');
        skyGradient.addColorStop(0.5, '#1e3a8a');
        skyGradient.addColorStop(1, '#63b3ed');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, worldWidth, 260);

        for (let cx = 150; cx < worldWidth; cx += 300) {
            this.drawCloud(ctx, cx, 45, 90);
        }

        this.drawBird(ctx, 300 + (Date.now() * 0.02) % worldWidth, 70);
        this.drawBird(ctx, 800 + (Date.now() * 0.015) % worldWidth, 45);

        for (let treeX = 60; treeX < parkingLotX - 60; treeX += 180) {
            this.drawTree(ctx, treeX, 150);
        }

        let buildingWidth = parkingLotX - 20;
        ctx.fillStyle = '#742a2a';
        ctx.fillRect(0, 80, buildingWidth, 180);
        
        ctx.fillStyle = '#552121';
        for (let bx = 0; bx < buildingWidth; bx += 24) {
            ctx.fillRect(bx, 80, 2, 180);
        }
        for (let by = 95; by < 260; by += 15) {
            ctx.fillRect(0, by, buildingWidth, 2);
        }
        
        for (let wx = 50; wx < buildingWidth - 80; wx += 100) {
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(wx - 8, 110, 6, 90);
            ctx.fillRect(wx + 62, 110, 6, 90);

            ctx.fillStyle = '#feebc8';
            ctx.fillRect(wx, 110, 60, 90);
            
            ctx.fillStyle = '#cbd5e0';
            ctx.fillRect(wx - 4, 200, 68, 6);
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(wx + 28, 110, 4, 90);
            ctx.fillRect(wx, 150, 60, 4);
        }

        for (let bellX = 400; bellX < buildingWidth; bellX += 800) {
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(bellX - 30, 25, 60, 55);
            ctx.beginPath();
            ctx.moveTo(bellX - 40, 25);
            ctx.lineTo(bellX, 0);
            ctx.lineTo(bellX + 40, 25);
            ctx.fill();
            
            ctx.fillStyle = '#edf2f7';
            ctx.beginPath();
            ctx.arc(bellX, 52, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1a202c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bellX, 52); ctx.lineTo(bellX, 42);
            ctx.moveTo(bellX, 52); ctx.lineTo(bellX + 7, 52);
            ctx.stroke();
        }

        for (let doorX = 350; doorX < buildingWidth - 100; doorX += 600) {
            this.drawSchoolDoors(ctx, doorX, 190);
        }

        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 2;
        for (let fx = 0; fx < worldWidth; fx += 40) {
            ctx.beginPath();
            ctx.moveTo(fx, 180);
            ctx.lineTo(fx, 340);
            ctx.stroke();
            if (fx % 100 === 0) {
                ctx.fillStyle = '#4a5568';
                ctx.fillRect(fx - 3, 180, 6, 160);
            }
        }
        for (let fx = 0; fx < worldWidth; fx += 80) {
            ctx.beginPath();
            ctx.moveTo(fx, 180);
            ctx.lineTo(fx + 40, 340);
            ctx.moveTo(fx + 40, 180);
            ctx.lineTo(fx, 340);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, 200); ctx.lineTo(worldWidth, 200);
        ctx.moveTo(0, 320); ctx.lineTo(worldWidth, 320);
        ctx.stroke();

        ctx.fillStyle = '#2f855a';
        ctx.fillRect(0, 260, 50, 80);
        ctx.fillRect(230, 260, parkingLotX - 230, 80);
        this.drawGrassTufts(ctx, parkingLotX);
        this.drawFlowers(ctx, parkingLotX);

        for (let bx = 260; bx < parkingLotX - 50; bx += 170) {
            this.drawBushDetailed(ctx, bx, 312);
        }

        const teacherTypes = [0, 1, 2, 3];
        let typeIdx = 0;
        for (let teacherX = 300; teacherX < parkingLotX - 50; teacherX += 320) {
            this.drawTeacher(ctx, teacherX, 300, teacherTypes[typeIdx % teacherTypes.length]);
            typeIdx++;
        }

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(0, 340, 50, 400);
        ctx.fillRect(230, 340, parkingLotX - 230, 400);

        let pitGradient = ctx.createLinearGradient(50, 340, 50, 740);
        pitGradient.addColorStop(0, '#090d16');
        pitGradient.addColorStop(0.3, '#020609');
        pitGradient.addColorStop(1, '#000000');
        ctx.fillStyle = pitGradient;
        ctx.fillRect(50, 340, 180, 400);

        ctx.fillStyle = '#d69e2e';
        ctx.fillRect(45, 336, 10, 408);
        ctx.fillRect(225, 336, 10, 408);

        ctx.fillStyle = '#1a202c';
        for (let stripeY = 340; stripeY < 740; stripeY += 30) {
            ctx.fillRect(45, stripeY, 10, 15);
            ctx.fillRect(225, stripeY, 10, 15);
        }

        ctx.fillStyle = '#c53030';
        ctx.fillRect(125, 324, 30, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('DANGER', 130, 338);
        ctx.fillStyle = '#718096';
        ctx.fillRect(138, 344, 4, 12);

        ctx.strokeStyle = '#3e4c59';
        ctx.lineWidth = 1;
        for (let tx = 230; tx < parkingLotX; tx += 80) {
            ctx.beginPath();
            ctx.moveTo(tx, 340);
            ctx.lineTo(tx, 740);
            ctx.stroke();
        }
        for (let ty = 340; ty < 740; ty += 80) {
            ctx.beginPath();
            ctx.moveTo(230, ty);
            ctx.lineTo(parkingLotX, ty);
            ctx.stroke();
        }

        const chairSlots = [290, 540, 790, 1040, 1290, 1540];
        chairSlots.forEach((slotX, idx) => {
            if (slotX < parkingLotX - 50) {
                let randYOffset = (idx % 3) * 18 - 10;
                let randFlip = (idx % 2 === 0);
                this.drawChair(ctx, slotX + ((idx * 37) % 40) - 20, 410 + randYOffset, randFlip);
            }
        });

        for (let trashX = 300; trashX < parkingLotX - 50; trashX += 300) {
            this.drawTrashCan(ctx, trashX, 385);
        }

        let mouseOffset = (Date.now() * 0.05) % worldWidth;
        for (let mx = 300; mx < worldWidth; mx += 300) {
            let currentMouseX = (mx + mouseOffset) % worldWidth;
            this.drawMouse(ctx, currentMouseX, 335);
        }

        this.drawParkingLot(ctx, parkingLotX, 260, 560, 900);

        const courtXs = [350, 700, 1050, 1400];
        courtXs.forEach(courtX => {
            if (courtX < parkingLotX - 100) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                
                ctx.beginPath();
                ctx.arc(courtX, 480, 90, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.rect(courtX - 120, 340, 240, 220);
                ctx.stroke();

                this.drawStraightBasketballHoop(ctx, courtX - 40, 340);
            }
        });

        this.drawConveyorBelt(ctx, worldWidth, 620, 55);
    },

    drawConveyorBelt(ctx, worldWidth, y, height) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, y + height, worldWidth, 8);

        let beltGrad = ctx.createLinearGradient(0, y, 0, y + height);
        beltGrad.addColorStop(0, '#4a5568');
        beltGrad.addColorStop(0.5, '#2d3748');
        beltGrad.addColorStop(1, '#1a202c');
        ctx.fillStyle = beltGrad;
        ctx.fillRect(0, y, worldWidth, height);

        ctx.fillStyle = '#cbd5e0';
        ctx.fillRect(0, y, worldWidth, 5);
        ctx.fillStyle = '#718096';
        ctx.fillRect(0, y + height - 5, worldWidth, 5);

        const stripeWidth = 20;
        const stripeOffset = (Date.now() * 0.1) % (stripeWidth * 2);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y + 5, worldWidth, 6);
        ctx.clip();
        for (let sx = -stripeWidth * 2; sx < worldWidth + stripeWidth * 2; sx += stripeWidth) {
            ctx.fillStyle = (Math.floor((sx / stripeWidth)) % 2 === 0) ? '#ecc94b' : '#1a202c';
            ctx.fillRect(sx - stripeOffset, y + 5, stripeWidth, 6);
        }
        ctx.restore();

        const speed = 0.2;
        const treadWidth = 24;
        const treadOffset = (Date.now() * speed) % treadWidth;

        ctx.fillStyle = '#111827';
        for (let tx = -treadWidth; tx < worldWidth + treadWidth; tx += treadWidth) {
            let currentX = tx - treadOffset;
            ctx.fillRect(currentX, y + 11, 12, height - 22);

            ctx.fillStyle = '#374151';
            ctx.fillRect(currentX + 2, y + 13, 3, height - 26);
            ctx.fillStyle = '#111827';
        }

        ctx.restore();
    },

    drawCloud(ctx, x, y, width) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, width * 0.25, 0, Math.PI * 2);
        ctx.arc(x + width * 0.2, y - width * 0.1, width * 0.3, 0, Math.PI * 2);
        ctx.arc(x + width * 0.45, y, width * 0.22, 0, Math.PI * 2);
        ctx.fill();
    },

    drawBird(ctx, x, y) {
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 5);
        ctx.quadraticCurveTo(x - 5, y - 12, x, y);
        ctx.quadraticCurveTo(x + 5, y - 12, x + 10, y - 5);
        ctx.stroke();
    },

    drawTree(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#4a2c11';
        ctx.fillRect(x - 10, y - 70, 20, 70);

        ctx.fillStyle = '#22543d';
        ctx.beginPath();
        ctx.arc(x, y - 85, 35, 0, Math.PI * 2);
        ctx.arc(x - 25, y - 65, 26, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 65, 26, 0, Math.PI * 2);
        ctx.arc(x, y - 110, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2f855a';
        ctx.beginPath();
        ctx.arc(x - 8, y - 90, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawSchoolDoors(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x - 2, y - 2, 54, 72);

        ctx.fillStyle = '#319795';
        ctx.fillRect(x, y, 24, 68);
        ctx.fillRect(x + 26, y, 24, 68);

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 20, y + 30, 3, 12);
        ctx.fillRect(x + 27, y + 30, 3, 12);

        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 24, 68);
        ctx.strokeRect(x + 26, y, 24, 68);
        ctx.restore();
    },

    drawChair(ctx, x, y, flip = false) {
        ctx.save();
        ctx.translate(x, y);
        if (flip) ctx.scale(-1, 1);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#a0aec0';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(-12, -20);
        ctx.moveTo(16, 0);  ctx.lineTo(12, -20);
        ctx.moveTo(-20, 0); ctx.lineTo(-14, -38);
        ctx.moveTo(10, 0);  ctx.lineTo(10, -20);
        ctx.stroke();

        ctx.strokeStyle = '#718096';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, -10); ctx.lineTo(12, -10);
        ctx.stroke();

        ctx.fillStyle = '#3182ce';
        ctx.beginPath();
        ctx.roundRect(-18, -24, 36, 7, 3);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(-16, -42, 32, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#63b3ed';
        ctx.fillRect(-15, -23, 30, 2);

        ctx.restore();
    },

    drawTrashCan(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(x - 12, y - 25, 24, 25);

        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.arc(x, y - 25, 12, Math.PI, 0, false);
        ctx.fill();

        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 15); ctx.lineTo(x + 12, y - 15);
        ctx.moveTo(x - 12, y - 8); ctx.lineTo(x + 12, y - 8);
        ctx.stroke();
        ctx.restore();
    },

    drawParkingLot(ctx, x, y, width, height) {
        ctx.save();
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = '#a0aec0';
        ctx.fillRect(x - 5, y, 5, height);

        ctx.strokeStyle = '#ecc94b';
        ctx.lineWidth = 4;

        let leftColX = x + 25;
        let rightColX = x + 295;

        const carPalettes = [
            { main: '#dc2626', dark: '#991b1b', shadow: '#7f1d1d' },
            { main: '#2563eb', dark: '#1d4ed8', shadow: '#1e3a8a' },
            { main: '#16a34a', dark: '#15803d', shadow: '#14532d' },
            { main: '#ca8a04', dark: '#a16207', shadow: '#713f12' },
            { main: '#7c3aed', dark: '#6d28d9', shadow: '#4c1d95' },
            { main: '#db2777', dark: '#be185d', shadow: '#831843' }
        ];

        let colorIndex = 0;
        for (let spotY = y + 25; spotY < y + height - 200; spotY += 140) {
            ctx.beginPath();
            ctx.moveTo(leftColX, spotY + 120);
            ctx.lineTo(leftColX + 230, spotY + 120);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rightColX, spotY + 120);
            ctx.lineTo(rightColX + 230, spotY + 120);
            ctx.stroke();

            let leftCar = carPalettes[colorIndex % carPalettes.length];
            colorIndex++;
            let rightCar = carPalettes[colorIndex % carPalettes.length];
            colorIndex++;

            this.drawPixelSideCar(ctx, leftColX + 4, spotY + 15, leftCar);
            this.drawPixelSideCar(ctx, rightColX + 4, spotY + 15, rightCar);
        }

        ctx.restore();
    },

    drawPixelSideCar(ctx, x, y, palette) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1.5, 1.5);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(6, 78, 82, 8);

        ctx.fillStyle = '#111827';
        ctx.fillRect(6, 40, 14, 12);
        ctx.fillStyle = palette.shadow;
        ctx.fillRect(8, 43, 10, 8);

        ctx.fillStyle = '#111827';
        ctx.fillRect(14, 50, 70, 26);

        ctx.fillStyle = palette.main;
        ctx.fillRect(16, 52, 66, 22);

        ctx.fillStyle = palette.dark;
        ctx.fillRect(16, 64, 66, 10);
        ctx.fillRect(38, 52, 4, 12);

        ctx.fillStyle = '#111827';
        ctx.fillRect(26, 32, 40, 20);

        ctx.fillStyle = '#374151';
        ctx.fillRect(30, 35, 32, 14);

        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(50, 35, 10, 12);

        ctx.fillStyle = palette.main;
        ctx.fillRect(46, 44, 4, 4);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(80, 58, 4, 4);

        ctx.fillStyle = '#facc15';
        ctx.fillRect(2, 58, 6, 10);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(4, 60, 4, 6);

        ctx.fillStyle = '#030712';
        ctx.fillRect(20, 66, 18, 18);
        ctx.fillStyle = '#374151';
        ctx.fillRect(22, 68, 14, 14);
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(26, 72, 6, 6);

        ctx.fillStyle = '#030712';
        ctx.fillRect(62, 66, 18, 18);
        ctx.fillStyle = '#374151';
        ctx.fillRect(64, 68, 14, 14);
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(68, 72, 6, 6);

        ctx.restore();
    },

    drawMouse(ctx, x, y) {
        ctx.fillStyle = '#a0aec0';
        ctx.beginPath();
        ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 6, y - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a0aec0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.quadraticCurveTo(x - 14, y + 4, x - 18, y);
        ctx.stroke();
    },

    drawGrassTufts(ctx, limitX) {
        ctx.strokeStyle = '#276749';
        ctx.lineWidth = 2;
        for (let gx = 15; gx < limitX; gx += 25) {
            if (gx > 50 && gx < 230) continue; 
            ctx.beginPath();
            ctx.moveTo(gx, 340);
            ctx.lineTo(gx - 3, 328);
            ctx.moveTo(gx, 340);
            ctx.lineTo(gx + 3, 330);
            ctx.moveTo(gx + 4, 340);
            ctx.lineTo(gx + 8, 326);
            ctx.stroke();
        }
    },

    drawFlowers(ctx, limitX) {
        for (let fx = 40; fx < limitX; fx += 130) {
            if (fx > 50 && fx < 230) continue; 
            ctx.fillStyle = '#fc8181';
            ctx.beginPath();
            ctx.arc(fx, 272, 4, 0, Math.PI * 2);
            ctx.arc(fx + 5, 275, 4, 0, Math.PI * 2);
            ctx.arc(fx - 5, 275, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f6e05e';
            ctx.beginPath();
            ctx.arc(fx, 274, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawBushDetailed(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 32, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1b4332';
        ctx.beginPath();
        ctx.arc(-18, 0, 18, 0, Math.PI * 2);
        ctx.arc(18, 0, 18, 0, Math.PI * 2);
        ctx.arc(0, -12, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.arc(-10, -6, 16, 0, Math.PI * 2);
        ctx.arc(12, -4, 15, 0, Math.PI * 2);
        ctx.arc(0, -16, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#40916c';
        ctx.beginPath();
        ctx.arc(-5, -12, 11, 0, Math.PI * 2);
        ctx.arc(8, -10, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#feb2b2';
        ctx.beginPath();
        ctx.arc(-12, -2, 3, 0, Math.PI * 2);
        ctx.arc(14, 2, 3, 0, Math.PI * 2);
        ctx.arc(2, -18, 3, 0, Math.PI * 2);
        ctx.arc(-6, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawStraightBasketballHoop(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#718096';
        ctx.fillRect(-8, -210, 16, 210);
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(-8, -210, 5, 210);

        ctx.fillStyle = '#edf2f7';
        ctx.fillRect(-65, -300, 130, 90);
        ctx.strokeStyle = '#cbd5e0';
        ctx.lineWidth = 4;
        ctx.strokeRect(-65, -300, 130, 90);

        ctx.strokeStyle = '#ed8936';
        ctx.lineWidth = 4;
        ctx.strokeRect(-28, -260, 56, 40);

        ctx.strokeStyle = '#dd6b20';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, -215, 22, 9, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-20, -215); ctx.lineTo(-12, -170);
        ctx.moveTo(-10, -215); ctx.lineTo(-4, -170);
        ctx.moveTo(0, -215);   ctx.lineTo(0, -170);
        ctx.moveTo(10, -215);  ctx.lineTo(4, -170);
        ctx.moveTo(20, -215);  ctx.lineTo(12, -170);
        ctx.moveTo(-16, -200); ctx.lineTo(16, -200);
        ctx.moveTo(-14, -185); ctx.lineTo(14, -185);
        ctx.stroke();

        ctx.restore();
    },

    drawTeacher(ctx, x, y, type = 0) {
        // [Teacher drawing code remains unchanged]
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (type === 0) {
            ctx.fillStyle = '#c53030';
            ctx.fillRect(-22, -75, 7, 24);
            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(-21, -51, 5, 6);

            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-10, -15, 8, 25);
            ctx.fillRect(2, -15, 8, 25);

            ctx.fillStyle = '#1a202c'; 
            ctx.fillRect(-12, -45, 24, 32);
            ctx.fillStyle = '#c53030'; 
            ctx.fillRect(-15, -75, 30, 32);

            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(-4, -75, 8, 20);
            ctx.fillStyle = '#000000';
            ctx.fillRect(-2, -72, 4, 16);

            ctx.fillStyle = '#f6ad55'; 
            ctx.fillRect(-10, -95, 20, 22);
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(-11, -98, 22, 8);

            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(-6, -88, 4, 3);
            ctx.fillRect(2, -88, 4, 3);
            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-5, -87, 2, 2);
            ctx.fillRect(3, -87, 2, 2);
            
            ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
            ctx.fillRect(-2, -83, 4, 3);
            
            ctx.fillStyle = '#822727'; 
            ctx.fillRect(-4, -78, 8, 1);

            ctx.strokeStyle = '#000000'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(-7, -90, 6, 6);
            ctx.strokeRect(1, -90, 6, 6);

            ctx.fillStyle = '#c53030';
            ctx.fillRect(14, -75, 7, 12); 
            ctx.fillRect(14, -63, 10, 7); 
            
            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(20, -79, 6, 6); 
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, -78, 10, 2);
            ctx.fillStyle = '#ed8936';
            ctx.fillRect(10, -78, 2, 2); 

            let time = Date.now() * 0.0015 + x;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(10, -78);
            ctx.quadraticCurveTo(8 - Math.sin(time) * 4, -92, 12 - Math.cos(time) * 6, -104);
            ctx.stroke();

        } else if (type === 1) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(12, -75, 6, 26);
            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(12, -49, 5, 6);

            ctx.fillStyle = '#000000'; 
            ctx.beginPath();
            ctx.moveTo(-12, -75);
            ctx.lineTo(12, -75);
            ctx.lineTo(20, 5);
            ctx.lineTo(-20, 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-8, -75);
            ctx.lineTo(0, -62);
            ctx.lineTo(8, -75);
            ctx.fill();

            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(-8, 5, 5, 8);
            ctx.fillRect(3, 5, 5, 8);
            ctx.fillStyle = '#000000';
            ctx.fillRect(-9, 11, 7, 3);
            ctx.fillRect(2, 11, 7, 3);

            ctx.fillStyle = '#000000';
            ctx.fillRect(-22, -75, 6, 15); 
            ctx.fillRect(-22, -60, 12, 6); 
            
            ctx.fillStyle = '#d69e2e';
            ctx.fillRect(-18, -63, 12, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-16, -61, 8, 12);
            
            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(-12, -60, 5, 5);

            ctx.fillStyle = '#9b2c2c'; 
            ctx.beginPath();
            ctx.arc(0, -90, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f6ad55'; 
            ctx.fillRect(-8, -95, 16, 20);

            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(-5, -89, 4, 3);
            ctx.fillRect(1, -89, 4, 3);
            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-4, -88, 2, 2);
            ctx.fillRect(2, -88, 2, 2);
            
            ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
            ctx.fillRect(-1, -84, 2, 3);
            
            ctx.fillStyle = '#c53030'; 
            ctx.fillRect(-3, -79, 6, 2);

        } else if (type === 2) {
            ctx.fillStyle = '#d69e2e';
            ctx.fillRect(-21, -75, 8, 24);
            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(-20, -51, 6, 6); 

            ctx.fillStyle = '#d69e2e';
            ctx.fillRect(13, -75, 8, 24);
            ctx.fillStyle = '#f6ad55';
            ctx.fillRect(14, -51, 6, 6); 

            ctx.fillStyle = '#050505'; 
            ctx.fillRect(-11, -20, 9, 30);
            ctx.fillRect(2, -20, 9, 30);

            ctx.fillStyle = '#d69e2e'; 
            ctx.roundRect(-14, -75, 28, 56, 4);
            ctx.fill();

            ctx.fillStyle = '#f6ad55'; 
            ctx.fillRect(-9, -95, 18, 20);
            ctx.fillStyle = '#4a5568'; 
            ctx.beginPath();
            ctx.arc(0, -98, 12, 0, Math.PI, true);
            ctx.fill();

            ctx.fillStyle = '#4a5568'; 
            ctx.fillRect(-5, -80, 10, 4);
            ctx.fillRect(-3, -76, 6, 3);
            
            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(-5, -89, 3, 3);
            ctx.fillRect(2, -89, 3, 3);
            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-4, -88, 1.5, 1.5);
            ctx.fillRect(3, -88, 1.5, 1.5);

            ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
            ctx.fillRect(-1, -85, 2, 3);

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-3.5, -87.5, 3.5, 0, Math.PI * 2);
            ctx.arc(3.5, -87.5, 3.5, 0, Math.PI * 2);
            ctx.stroke();

        } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(-22, -75, 7, 24);
            ctx.fillStyle = '#ed8936'; 
            ctx.fillRect(-21, -51, 5, 6);

            ctx.fillStyle = '#000000';
            ctx.fillRect(15, -75, 7, 24);
            ctx.fillStyle = '#ed8936';
            ctx.fillRect(16, -51, 5, 6);

            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-12, -35, 24, 38);
            ctx.fillStyle = '#319795'; 
            ctx.fillRect(-10, -75, 20, 40);
            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-15, -75, 6, 40);
            ctx.fillRect(9, -75, 6, 40);

            ctx.fillStyle = '#ed8936';
            ctx.fillRect(-8, 3, 5, 8);
            ctx.fillRect(3, 3, 5, 8);
            ctx.fillStyle = '#000000';
            ctx.fillRect(-9, -5, 7, 16);
            ctx.fillRect(2, -5, 7, 16);

            ctx.fillStyle = '#2b6cb0'; 
            ctx.beginPath();
            ctx.arc(0, -90, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ed8936'; 
            ctx.fillRect(-8, -95, 16, 20);

            ctx.fillStyle = '#ffffff'; 
            ctx.fillRect(-5, -89, 4, 3);
            ctx.fillRect(1, -89, 4, 3);
            ctx.fillStyle = '#000000'; 
            ctx.fillRect(-4, -88, 2, 2);
            ctx.fillRect(2, -88, 2, 2);
            ctx.fillRect(-6, -90, 6, 1); 
            ctx.fillRect(0, -90, 6, 1);
            
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
            ctx.fillRect(-1, -84, 2, 3);
            
            ctx.fillStyle = '#9b2c2c'; 
            ctx.fillRect(-3, -79, 6, 2);
        }

        ctx.restore();
    }
};