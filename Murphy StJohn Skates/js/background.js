// =======================
// js/background.js
// =======================
window.Background = {
    clouds: [],
    birds: [],
    stars: [],
    trees: [],
    bushes: [],
    mountains: [],
    hotAirBalloons: [],
    regularBalloons: [],
    houses: [],
    traffic: [],
    cemeteryProps: [],
    spaceshipAliens: [],
    alienJars: [],
    
    alienShip: {
        x: -500,
        y: 80,
        active: false,
        speed: 3.5,
        timer: 0,
        lastSpawn: 0,
        hasCow: false
    },
    jet: {
        x: -700,
        y: 100,
        active: false,
        speed: 5,
        angle: 0,
        timer: 0,
        lastSpawn: 0,
        maneuver: "straight"
    },
    
    lastVehicleSpawn: 0,
    initialized: false,

    reset() {
        this.clouds = [];
        this.birds = [];
        this.stars = [];
        this.trees = [];
        this.bushes = [];
        this.mountains = [];
        this.hotAirBalloons = [];
        this.regularBalloons = [];
        this.houses = [];
        this.traffic = [];
        this.cemeteryProps = [];
        this.spaceshipAliens = [];
        this.alienJars = [];
        this.lastVehicleSpawn = 0;
        this.alienShip = { x: -500, y: 80, active: false, speed: 3.5, timer: 0, lastSpawn: 0, hasCow: false };
        this.jet = { x: -700, y: 100, active: false, speed: 5, angle: 0, timer: 0, lastSpawn: 0, maneuver: "straight" };
        this.initialized = false;
    },

    init(canvas, GROUND_Y) {
        this.reset();

        for (let i = 0; i < 7; i++) {
            this.clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (GROUND_Y - 200),
                scale: 0.6 + Math.random() * 0.9,
                speed: 0.2 + Math.random() * 0.4
            });
        }
        for (let i = 0; i < 12; i++) {
            this.mountains.push({
                x: i * 350,
                width: 400 + Math.random() * 100,
                height: 180 + Math.random() * 100
            });
        }
        for (let i = 0; i < 25; i++) {
            this.trees.push({
                x: i * 180,
                y: GROUND_Y - 5,
                scale: 0.8 + Math.random() * 0.3
            });
        }
        for (let i = 0; i < 20; i++) {
            this.bushes.push({
                x: i * 220 + Math.random() * 50,
                y: GROUND_Y - 12,
                scale: 0.6 + Math.random() * 0.5
            });
        }
        for (let i = 0; i < 5; i++) {
            this.birds.push({
                x: Math.random() * canvas.width,
                y: 30 + Math.random() * 120,
                speed: 1.2 + Math.random() * 2.2,
                type: Math.random() > 0.5 ? "seagull" : "small",
                flap: Math.random() * Math.PI
            });
        }
        for (let i = 0; i < 2; i++) {
            this.hotAirBalloons.push({
                x: Math.random() * canvas.width,
                y: 60 + Math.random() * 100,
                speed: 0.3 + Math.random() * 0.3,
                primaryColor: i === 0 ? "#ff5722" : "#3f51b5",
                secondaryColor: i === 0 ? "#ffeb3b" : "#e91e63",
                scale: 0.8 + Math.random() * 0.3,
                wobbleOffset: Math.random() * Math.PI * 2,
                hasDangler: i === 1
            });
        }
        for (let i = 0; i < 4; i++) {
            this.regularBalloons.push({
                x: Math.random() * canvas.width,
                y: GROUND_Y - 140 - Math.random() * 160,
                speed: 0.4 + Math.random() * 0.3,
                color: ["#e91e63", "#00bcd4", "#ffeb3b", "#4caf50"][i],
                phaseOffset: i * 1.5,
                scale: 0.6 + Math.random() * 0.15
            });
        }
        for (let i = 0; i < 8; i++) {
            this.houses.push({
                x: i * 450,
                style: i === 2 ? "pizza" : (i % 2 === 0 ? "modern" : "classic"),
                hasPerson: i % 2 === 0,
                personWave: Math.random() > 0.5,
                waveOffset: Math.random() * Math.PI * 2
            });
        }
        for (let i = 0; i < 14; i++) {
            let propType = "tombstone";
            if (i % 3 === 1) propType = "cross";
            if (i % 3 === 2) propType = "obelisk";
            this.cemeteryProps.push({
                x: i * 220 + Math.random() * 60,
                type: propType,
                variant: i % 3,
                moss: Math.random() > 0.4
            });
        }
        for (let i = 0; i < 6; i++) {
            this.spaceshipAliens.push({
                x: i * 320 + Math.random() * 80,
                animOffset: Math.random() * Math.PI
            });
        }
        for (let i = 0; i < 8; i++) {
            this.alienJars.push({
                x: i * 260 + Math.random() * 100,
                liquidColor: i % 2 === 0 ? "#00ffcc" : "#00e5ff",
                bubbleOffset: Math.random() * Math.PI * 2
            });
        }
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (GROUND_Y - 50),
                size: Math.random() * 2,
                twinkle: Math.random() * Math.PI,
                color: Math.random() > 0.8 ? "#00ffcc" : "#ffffff"
            });
        }
        this.initialized = true;
    },

    lerpColor(c1, c2, f) {
        const r1 = parseInt(c1.substring(1, 3), 16), g1 = parseInt(c1.substring(3, 5), 16), b1 = parseInt(c1.substring(5, 7), 16);
        const r2 = parseInt(c2.substring(1, 3), 16), g2 = parseInt(c2.substring(3, 5), 16), b2 = parseInt(c2.substring(5, 7), 16);
        return `rgb(${Math.round(r1 + f * (r2 - r1))},${Math.round(g1 + f * (g2 - g1))},${Math.round(b1 + f * (b2 - b1))})`;
    },

    getWorld(score) {
        if (score >= 22000) return "heaven";
        if (score >= 20000) return "wildwest";
        if (score >= 18000) return "japan";
        if (score >= 16000) return "underwater";
        if (score >= 14000) return "candy";
        if (score >= 12000) return "volcano";
        if (score >= 10000) return "cyberpunk";
        if (score >= 8000) return "pirate";
        if (score >= 4000) return "spaceship";
        if (score >= 2000) return "cemetery";
        return "default";
    },

    drawCelestialBodies(ctx, canvas, dayProgress) {
        // Sun fading out during sunset/night
        if (dayProgress < 0.7) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - (dayProgress * 1.4));
            ctx.fillStyle = this.lerpColor("#fff096", "#ff2e00", Math.min(dayProgress * 2, 1));
            ctx.beginPath();
            ctx.arc(520, 60 + (dayProgress * 400), 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Detailed Moon fading in at night with atmospheric glow and craters
        if (dayProgress > 0.35) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, (dayProgress - 0.35) * 2.5);
            const moonX = canvas.width - 120;
            const moonY = 100 + Math.sin(dayProgress * Math.PI) * 20;
            const radius = 32;

            // Outer soft glow aura
            ctx.shadowColor = "rgba(230, 245, 255, 0.6)";
            ctx.shadowBlur = 25;

            // Moon body base gradient
            let moonGrad = ctx.createRadialGradient(moonX - 8, moonY - 8, 4, moonX, moonY, radius);
            moonGrad.addColorStop(0, "#ffffff");
            moonGrad.addColorStop(0.7, "#d6e4f0");
            moonGrad.addColorStop(1, "#9bb1c8");
            
            ctx.fillStyle = moonGrad;
            ctx.beginPath();
            ctx.arc(moonX, moonY, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0; // Reset shadow for surface craters

            // Textured Craters for realistic high-detail look
            ctx.fillStyle = "rgba(130, 150, 175, 0.35)";
            
            // Large Mare crater top-left
            ctx.beginPath();
            ctx.arc(moonX - 10, moonY - 10, 7, 0, Math.PI * 2);
            ctx.fill();

            // Medium crater mid-right
            ctx.beginPath();
            ctx.arc(moonX + 12, moonY + 6, 9, 0, Math.PI * 2);
            ctx.fill();

            // Small crater bottom
            ctx.beginPath();
            ctx.arc(moonX - 4, moonY + 14, 5, 0, Math.PI * 2);
            ctx.fill();

            // Tiny accent crater
            ctx.beginPath();
            ctx.arc(moonX + 8, moonY - 12, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    },

    draw(ctx, worldOffset, canvas, GROUND_Y) {
        if (!this.initialized) this.init(canvas, GROUND_Y);

        const score = (window.Game && typeof window.Game.score === "number") ? window.Game.score : 0;
        const world = this.getWorld(score);
        const dayProgress = Math.min((score % 4000) / 3000, 1);

        if (world === "default") {
            this.drawDefaultWorld(ctx, worldOffset, canvas, GROUND_Y, score, dayProgress);
        } else {
            this.drawWorldTheme(ctx, world, worldOffset, canvas, GROUND_Y, dayProgress);
        }

        ctx.fillStyle = "#000";
        ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    },

    drawUniversalBackgroundElements(ctx, worldOffset, canvas, GROUND_Y, dayProgress) {
        if (dayProgress > 0.5) this.drawStarfield(ctx, Math.min(1, (dayProgress - 0.5) * 2));
        this.drawCelestialBodies(ctx, canvas, dayProgress);

        this.clouds.forEach(c => {
            let cx = (c.x - (worldOffset * c.speed)) % (canvas.width + 200);
            if (cx < -100) cx += (canvas.width + 200);
            this.drawCloud(ctx, cx, c.y, c.scale, dayProgress);
        });

        const mountMove = worldOffset * 0.12;
        this.mountains.forEach((m) => {
            let mx = (m.x - (mountMove % 4200)) - 400;
            if (mx < -500) mx += 4200;
            this.drawDetailedMountain(ctx, mx, GROUND_Y, m.width, m.height, dayProgress);
        });

        const habMove = worldOffset * 0.18;
        this.hotAirBalloons.forEach((hab) => {
            let hx = (hab.x - habMove) % (canvas.width + 300);
            if (hx < -150) hx += canvas.width + 300;
            let floatY = hab.y + Math.sin(Date.now() * 0.001 + hab.wobbleOffset) * 12;
            this.drawHotAirBalloon(ctx, hx, floatY, hab.scale, hab.primaryColor, hab.secondaryColor, hab.hasDangler);
        });

        const rbParallax = worldOffset * 0.2;
        this.regularBalloons.forEach(rb => {
            rb.x -= rb.speed * 0.3;
            let rx = (rb.x - rbParallax) % (canvas.width + 100);
            if (rx < -50) {
                rx += canvas.width + 100;
                rb.x = canvas.width + 50;
            }
            let timeVal = (Date.now() * 0.002) + rb.phaseOffset;
            let verticalDip = Math.sin(timeVal) * 18; 
            this.drawRegularBalloon(ctx, rx, rb.y + verticalDip, rb.color, rb.scale);
        });

        this.updateAndDrawAlienShip(ctx, canvas, GROUND_Y);
        this.updateAndDrawJet(ctx, canvas);
        this.updateAndDrawBirds(ctx, worldOffset, canvas);

        const houseMove = worldOffset * 0.35;
        this.houses.forEach(h => {
            let hx = (h.x - (houseMove % 3600)) - 300;
            if (hx < -300) hx += 3600;
            this.drawHouseStyle(ctx, hx, GROUND_Y, h.style, dayProgress, h.hasPerson, h.personWave, h.waveOffset);
        });
    },

    drawDefaultWorld(ctx, worldOffset, canvas, GROUND_Y, score, dayProgress) {
        let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (dayProgress < 0.5) {
            let f = dayProgress * 2;
            skyGrad.addColorStop(0, this.lerpColor("#4da9ff", "#ff5e00", f));
            skyGrad.addColorStop(1, this.lerpColor("#99ccff", "#833ab4", f));
        } else {
            let f = (dayProgress - 0.5) * 2;
            skyGrad.addColorStop(0, this.lerpColor("#ff5e00", "#020111", f));
            skyGrad.addColorStop(1, this.lerpColor("#833ab4", "#191970", f));
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawUniversalBackgroundElements(ctx, worldOffset, canvas, GROUND_Y, dayProgress);

        this.updateAndDrawTraffic(ctx, canvas, GROUND_Y, worldOffset, dayProgress);
        this.drawFence(ctx, worldOffset * 0.4, GROUND_Y, dayProgress);

        const bushMove = worldOffset * 0.4;
        this.bushes.forEach(b => {
            let bx = (b.x - (bushMove % 4000)) - 200;
            if (bx < -200) bx += 4000;
            this.drawBush(ctx, bx, b.y, b.scale, dayProgress);
        });

        const leafColor = this.lerpColor("#2d5a27", "#051105", dayProgress);
        const treeMove = worldOffset * 0.45;
        this.trees.forEach(t => {
            let tx = (t.x - (treeMove % 4500)) - 180;
            if (tx < -200) tx += 4500;
            this.drawTree(ctx, tx, t.y, t.scale, leafColor);
        });

        this.drawRoadsideDetails(ctx, worldOffset * 0.8, GROUND_Y, dayProgress);
    },

    drawWorldTheme(ctx, world, move, canvas, GROUND_Y, dayProgress) {
        switch (world) {
            case "cemetery": {
                let cemGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                cemGrad.addColorStop(0, "#0a1118");
                cemGrad.addColorStop(0.5, "#101e2b");
                cemGrad.addColorStop(1, "#030608");
                ctx.fillStyle = cemGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                this.drawStarfield(ctx, 0.4);

                ctx.fillStyle = "rgba(120, 160, 180, 0.08)";
                ctx.fillRect(0, GROUND_Y - 180, canvas.width, 180);

                const bgTreeMove = move * 0.2;
                for (let i = 0; i < 5; i++) {
                    let btx = (i * 700 - (bgTreeMove % 3500)) - 200;
                    if (btx < -400) btx += 3500;
                    this.drawSpookyAncientTree(ctx, btx, GROUND_Y);
                }

                const propMove = move * 0.4;
                this.cemeteryProps.forEach(p => {
                    let px = (p.x - (propMove % 3500)) - 200;
                    if (px < -200) px += 3500;
                    this.drawCemeteryProp(ctx, px, GROUND_Y, p.type, p.variant, p.moss);
                });
                break;
            }
            case "spaceship": {
                let shipGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                shipGrad.addColorStop(0, "#04080c");
                shipGrad.addColorStop(0.5, "#0b131d");
                shipGrad.addColorStop(1, "#020407");
                ctx.fillStyle = shipGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const ribMove = move * 0.25;
                ctx.fillStyle = "#0f1722";
                ctx.strokeStyle = "#1b2a3a";
                ctx.lineWidth = 2;
                for (let i = 0; i < 10; i++) {
                    let rx = (i * 400 - (ribMove % 4000)) - 200;
                    if (rx < -300) rx += 4000;
                    ctx.fillRect(rx, 0, 60, canvas.height);
                    ctx.strokeRect(rx, 0, 60, canvas.height);
                    ctx.fillStyle = "#00ffcc";
                    ctx.shadowColor = "#00ffcc";
                    ctx.shadowBlur = 12;
                    ctx.fillRect(rx + 15, 20, 30, 8);
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = "#0f1722";
                }

                const spaceViewportMove = move * 0.3;
                for (let i = 0; i < 4; i++) {
                    let vx = (i * 900 - (spaceViewportMove % 3600)) - 200;
                    if (vx < -500) vx += 3600;
                    this.drawSpaceshipViewport(ctx, vx, 40);
                }

                const shipMove = move * 0.35;
                this.spaceshipAliens.forEach(sa => {
                    let sx = (sa.x - (shipMove % 4000)) - 200;
                    if (sx < -200) sx += 4000;
                    this.drawSpaceshipPlatformWithAliens(ctx, sx, GROUND_Y, sa.animOffset);
                });

                const jarMove = move * 0.4;
                this.alienJars.forEach(aj => {
                    let jx = (aj.x - (jarMove % 3500)) - 200;
                    if (jx < -200) jx += 3500;
                    this.drawAlienJar(ctx, jx, GROUND_Y, aj.liquidColor, aj.bubbleOffset);
                });
                break;
            }
            case "pirate": ctx.fillStyle = "#87ceeb"; break;
            case "cyberpunk": ctx.fillStyle = "#0a001a"; break;
            case "volcano": ctx.fillStyle = "#1a0500"; break;
            case "candy": ctx.fillStyle = "#ffdef2"; break;
            case "underwater": ctx.fillStyle = "#002b5c"; break;
            case "japan": ctx.fillStyle = "#fff5f8"; break;
            case "wildwest": ctx.fillStyle = "#e3a857"; break;
            case "heaven": ctx.fillStyle = "#b3e5fc"; break;
            default: ctx.fillStyle = "#4da9ff";
        }
        if (world !== "cemetery" && world !== "spaceship") {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.drawUniversalBackgroundElements(ctx, move, canvas, GROUND_Y, dayProgress);

        let leafColor = world === "japan" ? "#ffb7c5" : this.lerpColor("#2d5a27", "#051105", dayProgress);
        const treeMove = move * 0.45;
        this.trees.forEach(t => {
            let tx = (t.x - (treeMove % 4500)) - 180;
            if (tx < -200) tx += 4500;
            this.drawTree(ctx, tx, t.y, t.scale, leafColor);
        });
    },

    drawSpookyAncientTree(ctx, x, GROUND_Y) {
        ctx.save();
        ctx.fillStyle = "#0d1317";
        ctx.beginPath();
        ctx.moveTo(x - 35, GROUND_Y);
        ctx.lineTo(x - 15, GROUND_Y - 180);
        ctx.lineTo(x + 20, GROUND_Y - 220);
        ctx.lineTo(x + 30, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#0d1317";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y - 160);
        ctx.quadraticCurveTo(x - 90, GROUND_Y - 240, x - 150, GROUND_Y - 200);
        ctx.moveTo(x + 10, GROUND_Y - 180);
        ctx.quadraticCurveTo(x + 100, GROUND_Y - 260, x + 180, GROUND_Y - 210);
        ctx.stroke();

        ctx.fillStyle = "#121b22";
        ctx.beginPath();
        ctx.arc(x - 130, GROUND_Y - 205, 45, 0, Math.PI * 2);
        ctx.arc(x + 160, GROUND_Y - 215, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawSpaceshipViewport(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = "#111a24";
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.roundRect(x, y, 320, 180, [16]);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 10, 300, 160, [10]);
        ctx.clip();

        let spaceGrad = ctx.createLinearGradient(x, y, x, y + 180);
        spaceGrad.addColorStop(0, "#010206");
        spaceGrad.addColorStop(1, "#08101a");
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(x + 10, y + 10, 300, 160);

        ctx.fillStyle = "#1b2b3a";
        ctx.beginPath();
        ctx.arc(x + 150, y + 260, 130, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 150, y + 260, 130, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    },

    drawCemeteryProp(ctx, x, GROUND_Y, type, variant, moss) {
        ctx.save();
        if (type === "tombstone") {
            ctx.fillStyle = "#2c3e50";
            if (variant === 0) {
                ctx.fillRect(x, GROUND_Y - 65, 36, 65);
                ctx.beginPath(); ctx.arc(x + 18, GROUND_Y - 65, 18, Math.PI, 0, false); ctx.fill();
            } else if (variant === 1) {
                ctx.fillRect(x, GROUND_Y - 55, 40, 55);
                ctx.beginPath(); ctx.moveTo(x, GROUND_Y - 55); ctx.lineTo(x + 20, GROUND_Y - 80); ctx.lineTo(x + 40, GROUND_Y - 55); ctx.fill();
            } else {
                ctx.fillRect(x, GROUND_Y - 60, 30, 60);
            }
            ctx.fillStyle = "#1a252f";
            ctx.fillRect(x + 12, GROUND_Y - 35, 12, 6);
            ctx.fillRect(x + 16, GROUND_Y - 45, 4, 20);

            if (moss) {
                ctx.fillStyle = "#274e13";
                ctx.beginPath();
                ctx.arc(x + 6, GROUND_Y - 55, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === "cross") {
            ctx.fillStyle = "#34495e";
            ctx.fillRect(x + 12, GROUND_Y - 85, 12, 85);
            ctx.fillRect(x, GROUND_Y - 60, 36, 12);
            if (moss) {
                ctx.fillStyle = "#274e13";
                ctx.fillRect(x + 12, GROUND_Y - 85, 12, 10);
            }
        } else if (type === "obelisk") {
            ctx.fillStyle = "#3a4f63";
            ctx.fillRect(x + 4, GROUND_Y - 110, 24, 110);
            ctx.beginPath();
            ctx.moveTo(x + 4, GROUND_Y - 110);
            ctx.lineTo(x + 16, GROUND_Y - 135);
            ctx.lineTo(x + 28, GROUND_Y - 110);
            ctx.fill();
            ctx.fillStyle = "#22313f";
            ctx.fillRect(x - 2, GROUND_Y - 15, 36, 15);
            
            if (moss) {
                ctx.fillStyle = "#274e13";
                ctx.fillRect(x - 2, GROUND_Y - 15, 36, 6);
            }
        }
        ctx.restore();
    },

    drawAlienJar(ctx, x, GROUND_Y, liquidColor, bubbleOffset) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 255, 204, 0.12)";
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.roundRect(x, GROUND_Y - 85, 42, 85, [16, 16, 6, 6]);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#1b2a3a";
        ctx.fillRect(x + 6, GROUND_Y - 95, 30, 12);
        ctx.fillRect(x + 3, GROUND_Y - 99, 36, 5);
        ctx.fillRect(x + 2, GROUND_Y - 8, 38, 8);

        ctx.fillStyle = liquidColor;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.roundRect(x + 3, GROUND_Y - 60, 36, 60, [4, 4, 6, 6]);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = "#ffffff";
        let floatBob = Math.sin(Date.now() * 0.003 + bubbleOffset) * 6;
        ctx.beginPath();
        ctx.arc(x + 21, GROUND_Y - 35 + floatBob, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        let bubbleY1 = GROUND_Y - 20 - ((Date.now() * 0.03 + bubbleOffset * 20) % 40);
        let bubbleY2 = GROUND_Y - 12 - ((Date.now() * 0.04 + bubbleOffset * 10) % 30);
        ctx.beginPath();
        ctx.arc(x + 14, bubbleY1, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 28, bubbleY2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawSpaceshipPlatformWithAliens(ctx, x, GROUND_Y, animOffset) {
        ctx.save();
        ctx.fillStyle = "#0f1722"; 
        ctx.fillRect(x, GROUND_Y - 90, 160, 90);
        ctx.strokeStyle = "#00ffcc"; 
        ctx.lineWidth = 2; 
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 10;
        ctx.strokeRect(x, GROUND_Y - 90, 160, 90);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#00a8cc"; 
        ctx.fillRect(x + 15, GROUND_Y - 65, 45, 25);
        ctx.fillStyle = "#ff00ff"; 
        ctx.fillRect(x + 75, GROUND_Y - 65, 45, 25);

        let bob = Math.sin(Date.now() * 0.004 + animOffset) * 5;
        let alienX = x + 135;
        let alienY = GROUND_Y - 95 + bob;

        ctx.fillStyle = "#00ffcc";
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 6;
        ctx.beginPath(); 
        ctx.arc(alienX, alienY, 16, 0, Math.PI * 2); 
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#050b14";
        ctx.beginPath(); 
        ctx.ellipse(alienX - 5, alienY - 2, 3.5, 6, -0.2, 0, Math.PI * 2); 
        ctx.fill();
        ctx.beginPath(); 
        ctx.ellipse(alienX + 5, alienY - 2, 3.5, 6, 0.2, 0, Math.PI * 2); 
        ctx.fill();

        ctx.restore();
    },

    updateAndDrawAlienShip(ctx, canvas, GROUND_Y) {
        const now = Date.now();
        if (!this.alienShip.active && (now - this.alienShip.lastSpawn > 22000)) {
            this.alienShip.active = true;
            this.alienShip.x = canvas.width + 150;
            this.alienShip.y = 70 + Math.random() * 80;
            this.alienShip.lastSpawn = now;
            this.alienShip.hasCow = Math.random() > 0.5;
        }
        if (this.alienShip.active) {
            this.alienShip.x -= this.alienShip.speed;
            this.alienShip.timer += 0.05;
            let hoverY = this.alienShip.y + Math.sin(this.alienShip.timer * 3) * 8;

            ctx.save();
            
            if (this.alienShip.hasCow) {
                ctx.fillStyle = "rgba(0, 255, 204, 0.2)";
                ctx.beginPath();
                ctx.moveTo(this.alienShip.x - 12, hoverY + 6);
                ctx.lineTo(this.alienShip.x + 12, hoverY + 6);
                ctx.lineTo(this.alienShip.x + 35, GROUND_Y);
                ctx.lineTo(this.alienShip.x - 35, GROUND_Y);
                ctx.closePath();
                ctx.fill();

                let cowLiftY = GROUND_Y - 65 + Math.sin(this.alienShip.timer * 5) * 10;
                let cowTilt = Math.sin(this.alienShip.timer * 3) * 0.15;
                ctx.save();
                ctx.translate(this.alienShip.x, cowLiftY);
                ctx.rotate(cowTilt);

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-16, -10, 32, 18);
                ctx.fillStyle = "#111111";
                ctx.fillRect(-10, -8, 10, 8);
                ctx.fillRect(4, -4, 8, 8);

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(14, -16, 12, 12);
                ctx.fillStyle = "#ffc0cb";
                ctx.fillRect(22, -10, 5, 6);

                ctx.fillStyle = "#dcdcdc";
                ctx.beginPath();
                ctx.moveTo(16, -16); ctx.lineTo(13, -22); ctx.lineTo(19, -16);
                ctx.moveTo(22, -16); ctx.lineTo(25, -22); ctx.lineTo(26, -16);
                ctx.fill();

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-12, 8, 4, 8);
                ctx.fillRect(-4, 8, 4, 8);
                ctx.fillRect(4, 8, 4, 8);
                ctx.fillRect(10, 8, 4, 8);

                ctx.restore();
            }

            ctx.translate(this.alienShip.x, hoverY);
            ctx.fillStyle = "#b0bec5";
            ctx.beginPath(); ctx.ellipse(0, 0, 35, 12, 0, 0, Math.PI * 2); ctx.fill();
            
            ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
            ctx.beginPath(); ctx.arc(0, -6, 15, Math.PI, 0, false); ctx.fill();
            
            ctx.fillStyle = "#00ffcc";
            ctx.beginPath(); ctx.arc(0, -10, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#111";
            ctx.beginPath(); ctx.arc(-2.5, -11, 1.5, 0, Math.PI * 2); ctx.arc(2.5, -11, 1.5, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = Math.sin(this.alienShip.timer * 10) > 0 ? "#00ffcc" : "#ff00ff";
            for (let i = -20; i <= 20; i += 10) {
                ctx.beginPath(); ctx.arc(i, 4, 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
            if (this.alienShip.x < -200) this.alienShip.active = false;
        }
    },

    updateAndDrawJet(ctx, canvas) {
        const now = Date.now();
        if (!this.jet.active && (now - this.jet.lastSpawn > 35000)) {
            this.jet.active = true;
            this.jet.x = canvas.width + 300;
            this.jet.y = 90 + Math.random() * 60;
            this.jet.lastSpawn = now;
            this.jet.timer = 0;
            this.jet.maneuver = Math.random() > 0.5 ? "roll" : "straight";
        }
        if (this.jet.active) {
            this.jet.x -= this.jet.speed;
            this.jet.timer += 0.02;
            let visualY = this.jet.y;
            if (this.jet.maneuver === "roll") {
                this.jet.angle = Math.sin(this.jet.timer * 3) * 0.5;
                visualY += Math.sin(this.jet.timer * 6) * 15;
            } else { 
                this.jet.angle = Math.sin(this.jet.timer) * 0.1; 
            }
            ctx.save();
            ctx.translate(this.jet.x, visualY);
            ctx.rotate(this.jet.angle);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(55, -2); ctx.lineTo(350, -2); ctx.stroke();
            ctx.fillStyle = "#333"; 
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(25, -7); ctx.lineTo(35, -22); ctx.lineTo(42, -7); ctx.lineTo(55, -18); ctx.lineTo(52, 0);
            ctx.lineTo(55, 18); ctx.lineTo(42, 7); ctx.lineTo(35, 22); ctx.lineTo(25, 7); ctx.closePath(); ctx.fill();
            ctx.restore();
            if (this.jet.x < -500) this.jet.active = false;
        }
    },

    updateAndDrawBirds(ctx, worldOffset, canvas) {
        this.birds.forEach(b => {
            b.x -= b.speed;
            b.flap += 0.15;
            let visualX = (b.x - (worldOffset * 0.2)) % (canvas.width + 100);
            if (visualX < -50) visualX += canvas.width + 100;

            ctx.save();
            ctx.strokeStyle = "#222"; ctx.lineWidth = 2;
            ctx.beginPath();
            let wingOffset = Math.sin(b.flap) * 8;
            if (b.type === "seagull") {
                ctx.moveTo(visualX - 12, b.y + wingOffset);
                ctx.quadraticCurveTo(visualX, b.y - 6, visualX + 12, b.y + wingOffset);
            } else {
                ctx.moveTo(visualX - 8, b.y + wingOffset * 0.7);
                ctx.lineTo(visualX, b.y);
                ctx.lineTo(visualX + 8, b.y + wingOffset * 0.7);
            }
            ctx.stroke();
            ctx.restore();
        });
    },

    drawHotAirBalloon(ctx, x, y, scale, primaryColor, secondaryColor, hasDangler) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = primaryColor;
        ctx.beginPath(); ctx.ellipse(0, 0, 26, 34, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = secondaryColor;
        ctx.beginPath(); ctx.ellipse(0, 0, 13, 34, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.ellipse(0, 0, 5, 33, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "#ffeb3b";
        ctx.fillRect(-22, -4, 44, 7);

        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(0, 40, 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "rgba(255, 152, 0, 0.7)";
        ctx.beginPath(); ctx.arc(0, 28, 4, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = "#3e2723"; ctx.lineWidth = 1;
        ctx.beginPath(); 
        ctx.moveTo(-12, 30); ctx.lineTo(-6, 42); 
        ctx.moveTo(12, 30); ctx.lineTo(6, 42); 
        ctx.stroke();

        ctx.fillStyle = "#5d4037"; 
        ctx.fillRect(-8, 42, 16, 12);
        ctx.strokeStyle = "#3e2723"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-8, 48); ctx.lineTo(8, 48); ctx.stroke();

        if (hasDangler) {
            ctx.strokeStyle = "#333"; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(0, 54); ctx.lineTo(0, 78); ctx.stroke();
            
            ctx.fillStyle = "#222";
            ctx.beginPath(); ctx.arc(0, 81, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(-2, 84, 4, 10);

            let kickCycle = Date.now() * 0.015;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(-2, 87);
            ctx.lineTo(-8, 87 + Math.sin(kickCycle) * 4);
            ctx.moveTo(2, 87);
            ctx.lineTo(8, 87 - Math.sin(kickCycle) * 4);
            ctx.stroke();

            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-1, 94);
            ctx.lineTo(-6, 94 + Math.sin(kickCycle) * 6);
            ctx.moveTo(1, 94);
            ctx.lineTo(6, 94 - Math.sin(kickCycle) * 6);
            ctx.stroke();
        }

        ctx.restore();
    },

    drawRegularBalloon(ctx, x, y, color, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1, 10, 2, 2);
        ctx.strokeStyle = "#888"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(0, 26); ctx.stroke();
        ctx.restore();
    },

    drawHouseStyle(ctx, x, GROUND_Y, style, dayProgress, hasPerson, personWave, waveOffset) {
        ctx.save();
        const winCol = dayProgress > 0.6 ? "#ffeb3b" : "#b3e5fc";
        
        const drawWindowWithPanes = (wx, wy, ww, wh) => {
            ctx.fillStyle = winCol;
            ctx.fillRect(wx, wy, ww, wh);
            
            if (hasPerson) {
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                let headY = wy + wh * 0.45;
                let bodyY = wy + wh * 0.65;
                ctx.beginPath(); ctx.arc(wx + ww * 0.5, headY, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillRect(wx + ww * 0.35, bodyY, ww * 0.3, wh * 0.35);

                if (personWave) {
                    let timeVal = (Date.now() * 0.01) + waveOffset;
                    ctx.strokeStyle = "rgba(0,0,0,0.7)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(wx + ww * 0.35, bodyY + 3);
                    ctx.lineTo(wx + ww * 0.05, bodyY - 4 + (Math.sin(timeVal) * 8));
                    ctx.moveTo(wx + ww * 0.65, bodyY + 3);
                    ctx.lineTo(wx + ww * 0.95, bodyY - 4 + (Math.cos(timeVal * 1.3) * 8));
                    ctx.stroke();
                }
            }

            ctx.strokeStyle = "#333";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(wx, wy, ww, wh);
            ctx.beginPath();
            ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
            ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
            ctx.stroke();
        };

        if (style === "pizza") {
            ctx.fillStyle = this.lerpColor("#d32f2f", "#400", dayProgress);
            ctx.fillRect(x, GROUND_Y - 110, 110, 110);
            ctx.fillStyle = "#ffeb3b"; ctx.fillRect(x - 5, GROUND_Y - 75, 120, 15);
            ctx.fillStyle = "#e64a19"; ctx.fillRect(x + 5, GROUND_Y - 75, 20, 15);
            ctx.fillRect(x + 45, GROUND_Y - 75, 20, 15); ctx.fillRect(x + 85, GROUND_Y - 75, 20, 15);
            
            ctx.fillStyle = "#fff"; ctx.font = "bold 12px sans-serif"; ctx.fillText("PIZZA", x + 35, GROUND_Y - 90);
            
            drawWindowWithPanes(x + 15, GROUND_Y - 55, 30, 35);
            
            ctx.fillStyle = "#3e2723"; ctx.fillRect(x + 60, GROUND_Y - 60, 35, 60);
        } else if (style === "modern") {
            ctx.fillStyle = this.lerpColor("#78909c", "#1c2826", dayProgress);
            ctx.fillRect(x, GROUND_Y - 120, 90, 120);
            ctx.fillStyle = this.lerpColor("#546e7a", "#111", dayProgress);
            ctx.fillRect(x - 5, GROUND_Y - 125, 100, 8);
            
            drawWindowWithPanes(x + 12, GROUND_Y - 95, 28, 30);
            drawWindowWithPanes(x + 50, GROUND_Y - 95, 28, 30);
        } else {
            ctx.fillStyle = this.lerpColor("#a1887f", "#2c1d1a", dayProgress);
            ctx.fillRect(x, GROUND_Y - 95, 85, 95);
            ctx.fillStyle = "#5d4037"; 
            ctx.beginPath(); ctx.moveTo(x - 8, GROUND_Y - 95); ctx.lineTo(x + 42.5, GROUND_Y - 135); ctx.lineTo(x + 93, GROUND_Y - 95); ctx.fill();
            
            drawWindowWithPanes(x + 25, GROUND_Y - 70, 22, 22);

            ctx.fillStyle = "#4e342e"; ctx.fillRect(x + 50, GROUND_Y - 55, 22, 55);
        }
        ctx.restore();
    },

    drawDetailedMountain(ctx, x, y, w, h, dayProgress) {
        ctx.save();
        ctx.fillStyle = this.lerpColor("#5c7ea8", "#111823", dayProgress);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w / 2, y - h); ctx.lineTo(x + w, y); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w * 0.7, y); ctx.lineTo(x + w / 2, y); ctx.fill();
        if (dayProgress < 0.8) {
            ctx.fillStyle = this.lerpColor("#ffffff", "#555", dayProgress);
            ctx.beginPath(); ctx.moveTo(x + w / 2, y - h); ctx.lineTo(x + w / 2 - 25, y - h + 50); ctx.lineTo(x + w / 2, y - h + 65); ctx.lineTo(x + w / 2 + 25, y - h + 50); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    },

    updateAndDrawTraffic(ctx, canvas, GROUND_Y, worldOffset, dayProgress) {
        const now = Date.now();
        const trafficParallax = worldOffset * 0.28;
        if (now - this.lastVehicleSpawn > 3000 + Math.random() * 3000) {
            const isTruck = Math.random() > 0.4;
            const colors = isTruck ? ["#b71c1c", "#0d47a1", "#1b5e20"] : ["#f44336", "#2196f3", "#ffeb3b", "#ffffff"];
            this.traffic.push({
                x: canvas.width + 150,
                type: isTruck ? "truck" : "car",
                speed: 1.5 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 0.8 + Math.random() * 0.3
            });
            this.lastVehicleSpawn = now;
        }
        for (let i = this.traffic.length - 1; i >= 0; i--) {
            let v = this.traffic[i];
            v.x -= v.speed;
            let visualX = v.x - (trafficParallax % (canvas.width + 800));
            ctx.save();
            ctx.translate(visualX, GROUND_Y);
            ctx.scale(v.size, v.size);
            const bodyCol = this.lerpColor(v.color, "#111", dayProgress);
            const winCol = dayProgress > 0.6 ? "#ffeb3b" : "#b3e5fc";
            
            if (v.type === "truck") {
                ctx.fillStyle = bodyCol; ctx.fillRect(0, -35, 60, 25);
                ctx.fillStyle = "#263238"; ctx.fillRect(-25, -28, 25, 18);
                ctx.fillStyle = winCol; ctx.fillRect(-18, -26, 10, 8);
            } else {
                ctx.fillStyle = bodyCol; 
                ctx.beginPath(); ctx.roundRect(-22, -18, 44, 13, 5); ctx.fill();
                ctx.beginPath(); ctx.roundRect(-12, -27, 26, 11, 4); ctx.fill();
                ctx.fillStyle = winCol; 
                ctx.fillRect(-10, -25, 9, 7); 
                ctx.fillRect(2, -25, 9, 7);
                ctx.fillStyle = "#ffeb3b"; ctx.fillRect(20, -14, 3, 4);
            }
            ctx.restore();
            if (visualX < -300) this.traffic.splice(i, 1);
        }
    },

    drawFence(ctx, move, GROUND_Y, dayProgress) {
        ctx.save();
        ctx.strokeStyle = this.lerpColor("#333333", "#111", dayProgress);
        ctx.lineWidth = 1;
        const segmentWidth = 60;
        for (let i = 0; i < 35; i++) {
            let fx = (i * segmentWidth) - (move % (35 * segmentWidth)) - segmentWidth;
            ctx.beginPath(); ctx.moveTo(fx, GROUND_Y); ctx.lineTo(fx, GROUND_Y - 40); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(fx, GROUND_Y - 40); ctx.lineTo(fx + segmentWidth, GROUND_Y - 40); ctx.stroke();
        }
        ctx.restore();
    },

    drawStarfield(ctx, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        this.stars.forEach(s => {
            s.twinkle += 0.05;
            let size = s.size * (0.8 + Math.sin(s.twinkle) * 0.2);
            ctx.fillStyle = s.color || "white";
            ctx.fillRect(s.x, s.y, size, size);
        });
        ctx.restore();
    },

    drawCloud(ctx, x, y, scale, dayProgress) {
        ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
        ctx.fillStyle = this.lerpColor("#ffffff", "#202030", dayProgress);
        ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.arc(15, -10, 22, 0, Math.PI * 2); ctx.arc(35, 0, 20, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },

    drawTree(ctx, x, y, scale, leafColor) {
        ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
        ctx.fillStyle = "#3e2723"; ctx.fillRect(-5, -12, 10, 12);
        ctx.fillStyle = "#4e342e"; ctx.fillRect(-2, -10, 3, 10);
        ctx.fillStyle = leafColor;
        ctx.beginPath(); ctx.moveTo(-28, -12); ctx.lineTo(0, -42); ctx.lineTo(28, -12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-22, -32); ctx.lineTo(0, -58); ctx.lineTo(22, -32); ctx.fill();
        ctx.restore();
    },

    drawBush(ctx, x, y, scale, dayProgress) {
        ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
        ctx.fillStyle = this.lerpColor("#2e7d32", "#0b220d", dayProgress);
        ctx.beginPath();
        ctx.arc(-10, -8, 12, 0, Math.PI * 2);
        ctx.arc(6, -14, 15, 0, Math.PI * 2);
        ctx.arc(18, -8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawRoadsideDetails(ctx, move, GROUND_Y, dayProgress) {
        ctx.fillStyle = this.lerpColor("#3d7a36", "#0a1a08", dayProgress);
        ctx.fillRect(0, GROUND_Y - 15, 1000, 15);
    }
};