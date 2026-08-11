// =======================
// js/npcs.js - CAR DRIVES THROUGH EVERYTHING
// =======================
window.NPCs = {
    list: [],

    types: {
        civilian:        { w: 30, h: 46, speed: 1.2, yOffset: 46, role: "civilian" },
        girl:            { w: 30, h: 46, speed: 1.3, yOffset: 46, role: "girl" },
        worker:          { w: 30, h: 46, speed: 1.1, yOffset: 46, role: "worker" },
        zombie:          { w: 30, h: 46, speed: 0.7, yOffset: 46, role: "zombie" },
        dog:             { w: 34, h: 30, speed: 2.2, yOffset: 30, role: "dog" },
        kitty:           { w: 24, h: 22, speed: 1.5, yOffset: 22, role: "kitty" },
        baby:            { w: 26, h: 32, speed: 0.4, yOffset: 32, role: "baby" },
        police:          { w: 30, h: 46, speed: 1.3, yOffset: 46, role: "police" },
        policeBoss:      { w: 40, h: 60, speed: 0.9, yOffset: 60, role: "policeBoss" },
        karate:          { w: 30, h: 46, speed: 1.6, yOffset: 46, role: "karate" },
        vampire:         { w: 32, h: 50, speed: 1.8, yOffset: 50, role: "vampire" },
        monster:         { w: 50, h: 60, speed: 1.0, yOffset: 60, role: "monster" },
        headlessMonster: { w: 40, h: 60, speed: 1.4, yOffset: 60, role: "headlessMonster" },
        ghost:           { w: 36, h: 56, speed: 0.7, yOffset: 55, role: "ghost" },
        turtle:          { w: 36, h: 46, speed: 1.4, yOffset: 46, role: "turtle" }, 
        ghostbuster:     { w: 30, h: 46, speed: 1.2, yOffset: 46, role: "ghostbuster" },
        skeleton:        { w: 30, h: 46, speed: 1.1, yOffset: 46, role: "skeleton" },
        angel:           { w: 30, h: 46, speed: 1.2, yOffset: 46, role: "angel" },
        devil:           { w: 30, h: 46, speed: 1.3, yOffset: 46, role: "devil" },
        alien:           { w: 30, h: 46, speed: 1.4, yOffset: 46, role: "alien" },
        pirate:          { w: 30, h: 46, speed: 1.2, yOffset: 46, role: "pirate" },
        dinosaur:        { w: 45, h: 55, speed: 1.1, yOffset: 55, role: "dinosaur" },
        redCar:          { w: 160, h: 65, speed: 5.2, yOffset: 65, role: "redCar" },
        star:            { w: 32, h: 32, speed: 1.0, yOffset: 200, role: "star" }
    },

    carSpawnTimer: 0,
    carSpawnInterval: 1800,

    reset() {
        this.list = [];
        this.carSpawnTimer = 0;
    },

    drawRoundedRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    },

    drawFace(ctx, npc, h, blink, isCop) {
        const headY = -h / 2;
        ctx.fillStyle = npc.skin;
        this.drawRoundedRect(ctx, -14, headY + 7, 4, 8, 2);
        this.drawRoundedRect(ctx, 10, headY + 7, 4, 8, 2);

        if (isCop) {
            ctx.fillStyle = "#111"; 
            ctx.fillRect(-9, headY + 7, 7, 4); ctx.fillRect(2, headY + 7, 7, 4);
        } else {
            ctx.fillStyle = (npc.role === "zombie" || npc.role === "devil") ? "#ff0000" : "white";
            ctx.fillRect(-8, headY + 8, 5, 5 * blink); ctx.fillRect(3, headY + 8, 5, 5 * blink);
            if (blink > 0.3) {
                ctx.fillStyle = (npc.role === "zombie" || npc.role === "devil") ? "#4a0000" : "black";
                ctx.fillRect(-6.5, headY + 9.5, 2.5, 2.5); ctx.fillRect(4.5, headY + 9.5, 2.5, 2.5);
            }
        }
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(-1.5, headY + 12, 3, 4); 

        if (npc.role === "zombie") {
            ctx.fillStyle = "#4a0000";
            ctx.fillRect(-5, headY + 18, 10, 3);
        } else if (npc.role === "girl" || npc.role === "civilian" || npc.role === "angel") {
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, headY + 17, 4, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else {
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.fillRect(-3, headY + 19, 6, 1.5);
        }
    },

    spawnRandom(worldOffset, canvasWidth, GROUND_Y, score, currentLevel = "default") {
        if (Math.random() < 0.003) {
            const def = this.types["star"];
            const starNpc = {
                type: "star",
                x: worldOffset + canvasWidth + 80,
                y: GROUND_Y - (170 + Math.random() * 50),
                w: def.w,
                h: def.h,
                speed: def.speed,
                role: "star",
                hp: 1,
                animOffset: Math.random() * 1000
            };
            this.list.push(starNpc);
        }

        this.carSpawnTimer++;
        if (this.carSpawnTimer >= this.carSpawnInterval) {
            this.carSpawnTimer = 0;
            this.carSpawnInterval = 800 + Math.random() * 500;

            const def = this.types["redCar"];
            const carNpc = {
                type: "redCar",
                x: worldOffset + canvasWidth + 200, 
                y: GROUND_Y - def.yOffset,
                w: def.w,
                h: def.h,
                speed: def.speed,
                role: "redCar"
            };
            this.list.push(carNpc);
        }

        if (Math.random() > 0.0117) return; 

        let type;
        const rand = Math.random();
        const isCemeteryLevel = (currentLevel === "cemetery" || score >= 2000);

        if (isCemeteryLevel) {
            const cemeteryPool = ["skeleton", "skeleton", "zombie", "zombie", "angel", "angel", "devil", "devil", "pirate", "ghost", "vampire", "headlessMonster"];
            type = cemeteryPool[Math.floor(Math.random() * cemeteryPool.length)];
        } else {
            if (score >= 800 && Math.random() < 0.015) {
                type = "policeBoss";
            } 
            else if (score >= 300 && score < 800 && rand < 0.55) {
                type = Math.random() < 0.5 ? "zombie" : "skeleton";
            } 
            else if (score >= 100 && score < 600 && rand < 0.50) {
                const pool = ["vampire", "monster", "ghost", "headlessMonster", "skeleton", "skeleton", "angel", "devil", "pirate", "zombie"];
                type = pool[Math.floor(Math.random() * pool.length)];
            }
            else if (score >= 50 && score < 300 && rand < 0.65) {
                const pool = ["vampire", "monster", "ghost", "headlessMonster", "skeleton", "skeleton", "angel", "devil", "pirate", "zombie"];
                type = pool[Math.floor(Math.random() * pool.length)];
            } 
            else if (score < 100 && rand < 0.30) {
                type = Math.random() < 0.5 ? "zombie" : "skeleton";
            }
            else if (score < 100) {
                const pool = ["civilian", "girl", "worker", "dog", "kitty", "police", "skeleton", "zombie", "angel"];
                type = pool[Math.floor(Math.random() * pool.length)];
            }
            else {
                const pool = ["civilian", "girl", "skeleton", "skeleton", "zombie", "zombie", "angel", "devil", "pirate", "vampire", "monster", "headlessMonster"];
                type = pool[Math.floor(Math.random() * pool.length)];
            }
        }

        const def = this.types[type];
        if (!def) return;

        const skinColors = ["#FFDBAC", "#F1C27D", "#E0AC69", "#C68642", "#8D5524"];
        const hairColors = ["#2E1A09", "#4E342E", "#6D4C41", "#A1887F", "#000000", "#FBC02D"];
        const shirtColors = ["#4CAF50", "#2196F3", "#E91E63", "#FF9800", "#9C27B0", "#607D8B"];
        const turtleColors = ["#1976D2", "#D32F2F", "#9C27B0", "#FF9800"];

        let speedMultiplier = 0.8 + Math.random() * 0.2;
        if (type === "zombie") {
            speedMultiplier = 0.4 + Math.random() * 0.5; 
        }

        let assignedZombieStyle = "zombieSwingForward";
        if (type === "zombie") {
            const styleRoll = Math.random();
            if (styleRoll < 0.33) {
                assignedZombieStyle = "zombieSwingUp";     
            } else if (styleRoll < 0.66) {
                assignedZombieStyle = "zombieSwingDown";   
            } else {
                assignedZombieStyle = "zombieSwingForward";
            }
        }

        const npc = {
            type,
            x: worldOffset + canvasWidth + 80,
            y: GROUND_Y - def.yOffset,
            w: def.w,
            h: def.h,
            speed: def.speed * speedMultiplier, 
            role: def.role,
            skin: (type === "turtle") ? "#4CAF50" : skinColors[Math.floor(Math.random() * skinColors.length)],
            hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
            shirt: shirtColors[Math.floor(Math.random() * shirtColors.length)],
            pants: (type === "police" || type === "policeBoss" ? "#000a12" : "#263238"),
            hp: (type === "policeBoss") ? 6 : (type === "monster" || type === "headlessMonster" ? 4 : 1),
            animOffset: Math.random() * 1000,
            zombieStyle: assignedZombieStyle,
            isLunging: false,
            jumping: false,
            vy: 0,
            shootTimer: 0,
            aimAngle: 0,
            facing: -1,
            hairStyle: Math.floor(Math.random() * 3),
            bandana: (type === "turtle") ? turtleColors[Math.floor(Math.random() * turtleColors.length)] : null,
            state: (type === "turtle") ? "walking" : "default" 
        };

        if (type === "ghost") npc.skin = "#FFFFFF"; 
        if (type === "monster") npc.skin = "#1b3b36";
        if (type === "headlessMonster") { npc.shirt = "#1a1a1a"; npc.pants = "#111111"; }
        if (type === "vampire") { npc.shirt = "#111111"; npc.pants = "#1a1a1a"; }
        if (type === "ghostbuster") npc.shirt = "#d2b48c"; 
        if (type === "karate") { npc.shirt = "#FFFFFF"; npc.pants = "#FFFFFF"; }
        if (type === "skeleton") { npc.skin = "#E0E0E0"; npc.shirt = "#111111"; npc.pants = "#111111"; }
        if (type === "angel") { npc.skin = skinColors[Math.floor(Math.random() * skinColors.length)]; npc.shirt = "#FFFFFF"; npc.pants = "#E0F7FA"; }
        if (type === "devil") { npc.skin = "#D32F2F"; npc.shirt = "#B71C1C"; npc.pants = "#7F0000"; }
        if (type === "alien") { npc.skin = "#81C784"; npc.shirt = "#004D40"; npc.pants = "#00251A"; }
        if (type === "pirate") { npc.shirt = "#FFFFFF"; npc.pants = "#4E342E"; }
        if (type === "dinosaur") { npc.skin = "#66BB6A"; npc.shirt = "#388E3C"; npc.pants = "#2E7D32"; }
        if (type === "zombie") { 
            npc.skin = "#7d9d7d"; 
            npc.shirt = "#455a64"; 
            npc.bloodSpots = Array.from({length: 4}, () => ({x: Math.random()*24-12, y: Math.random()*24-12}));
        }

        this.list.push(npc);
    },

    update(dt, worldOffset, canvasWidth, GROUND_Y) {
        const player = window.Player.data;
        this.list = this.list.filter(npc => !npc.dead);

        for (let i = 0; i < this.list.length; i++) {
            const npc = this.list[i];
            const npcScreenX = npc.x - worldOffset;

            if (npc.role === "star") {
                npc.x -= npc.speed * dt * 2.0;
                if (npcScreenX < -50) npc.dead = true;
                continue;
            }

            if (npc.role === "redCar") {
                npc.x -= npc.speed * dt * 2.0;

                const playerScreenX = player.x;
                const hitBoxMargin = 15;
                if (
                    playerScreenX + player.w - hitBoxMargin > npcScreenX &&
                    playerScreenX + hitBoxMargin < npcScreenX + npc.w &&
                    player.y + player.h > npc.y + 10
                ) {
                    window.GameAPI.triggerDamage();
                }

                for (let j = 0; j < this.list.length; j++) {
                    const other = this.list[j];
                    if (other !== npc && !other.dead) {
                        const otherScreenX = other.x - worldOffset;
                        if (
                            otherScreenX + other.w > npcScreenX &&
                            otherScreenX < npcScreenX + npc.w &&
                            other.y + other.h > npc.y
                        ) {
                            other.dead = true;
                        }
                    }
                }

                if (npcScreenX < -300) {
                    npc.dead = true;
                }
                continue;
            }

            const dx = player.x - npcScreenX;
            const dy = (player.y + 20) - (npc.y + 20);
            const dist = Math.sqrt(dx * dx + dy * dy);

            let moveSpeed = npc.speed;

            if (npc.role === "turtle") {
                if (npc.state === "walking" && Math.abs(dx) < 220) {
                    npc.state = "spinning";
                }
                if (npc.state === "spinning") moveSpeed *= 2.5;
            }

            if (npc.role === "police" || npc.role === "policeBoss" || npc.role === "ghostbuster") {
                npc.aimAngle = Math.atan2(dy, dx);
                npc.shootTimer += dt;
                if (npc.shootTimer > 80) npc.shootTimer = 0;
                if (dist < 35) {
                    window.GameAPI.triggerDamage();
                    npc.dead = true;
                }
            }

            if (npc.role === "ghost") {
                npc.y = (GROUND_Y - 110) + Math.sin(Date.now() * 0.003) * 25;
            }

            if ((npc.role === "karate" || npc.role === "dog" || npc.role === "dinosaur") && !npc.jumping && Math.abs(dx) < 160) {
                npc.jumping = true; 
                npc.vy = (npc.role === "dog") ? -4.5 : -7.5; 
            }

            if (npc.jumping) {
                npc.y += npc.vy * dt;
                npc.vy += 0.4 * dt;
                const landY = GROUND_Y - this.types[npc.type].yOffset;
                if (npc.y >= landY) { npc.y = landY; npc.jumping = false; npc.vy = 0; }
            }

            npc.x -= moveSpeed * dt * 2.0;
        }
    },

    draw(ctx, worldOffset, time) {
        for (let i = 0; i < this.list.length; i++) {
            const npc = this.list[i];
            const def = this.types[npc.type];
            if (!def) continue;
            
            const x = npc.x - worldOffset, y = npc.y, w = def.w, h = def.h;
            const bob = Math.sin((time * 0.01) + npc.animOffset) * 2;
            const step = Math.sin((time * 0.06) + npc.animOffset) * 4;
            const blink = Math.sin((time * 0.008) + npc.animOffset) > 0.95 ? 0.1 : 1;

            ctx.save();
            
            if (npc.role === "star") {
                ctx.translate(x + w / 2, y + h / 2 + Math.sin(time * 0.008 + npc.animOffset) * 6);
                ctx.rotate(time * 0.004);

                ctx.fillStyle = "#FFD700";
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 2;

                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
                    const outerRadius = 16;
                    const innerRadius = 7;
                    const ox = Math.cos(angle) * outerRadius;
                    const oy = Math.sin(angle) * outerRadius;
                    if (j === 0) ctx.moveTo(ox, oy);
                    else ctx.lineTo(ox, oy);

                    const innerAngle = angle + (2 * Math.PI) / 10;
                    const ix = Math.cos(innerAngle) * innerRadius;
                    const iy = Math.sin(innerAngle) * innerRadius;
                    ctx.lineTo(ix, iy);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            else if (npc.role === "redCar") {
                ctx.translate(x, y);

                ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                ctx.beginPath();
                ctx.ellipse(80, 60, 75, 8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#D32F2F";
                ctx.beginPath();
                ctx.roundRect(0, 20, 160, 32, [6, 12, 8, 8]);
                ctx.fill();

                ctx.fillStyle = "#B71C1C";
                ctx.fillRect(0, 32, 160, 4);

                ctx.fillStyle = "#C62828";
                ctx.beginPath();
                ctx.roundRect(45, -2, 75, 24, [12, 12, 4, 4]);
                ctx.fill();

                ctx.fillStyle = "#CFD8DC";
                ctx.beginPath();
                ctx.moveTo(50, 20); ctx.lineTo(62, 2); ctx.lineTo(88, 2); ctx.lineTo(90, 20); ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(96, 20); ctx.lineTo(98, 2); ctx.lineTo(112, 2); ctx.lineTo(124, 20); ctx.closePath(); ctx.fill();

                ctx.fillStyle = "#B71C1C";
                ctx.fillRect(42, 16, 5, 4);

                ctx.fillStyle = "#FFEE58";
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#FFEE58";
                ctx.fillRect(0, 26, 6, 10);
                ctx.shadowBlur = 0;

                ctx.fillStyle = "#FF1744";
                ctx.fillRect(156, 26, 4, 10);

                ctx.fillStyle = "#37474F";
                ctx.fillRect(0, 48, 160, 4);
                ctx.fillRect(156, 20, 4, 28);

                ctx.fillStyle = "#212121";
                ctx.beginPath();
                ctx.arc(35, 52, 14, 0, Math.PI * 2);
                ctx.arc(125, 52, 14, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#CFD8DC";
                ctx.beginPath();
                ctx.arc(35, 52, 6, 0, Math.PI * 2);
                ctx.arc(125, 52, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#37474F";
                ctx.fillRect(34, 47, 2, 10);
                ctx.fillRect(30, 51, 10, 2);
                ctx.fillRect(124, 47, 2, 10);
                ctx.fillRect(120, 51, 10, 2);
            }
            else if (npc.role === "turtle" && npc.state === "spinning") {
                ctx.translate(x + w / 2, y + h / 2 + 15);
                ctx.rotate(time * 0.008); 
                ctx.fillStyle = "#1B5E20"; 
                this.drawRoundedRect(ctx, -20, -14, 40, 28, 12);
                ctx.strokeStyle = "rgba(0,0,0,0.3)";
                ctx.lineWidth = 1;
                for(let j=0; j<3; j++) ctx.strokeRect(-12 + (j*8), -5, 6, 10);
                ctx.fillStyle = npc.bandana; 
                ctx.fillRect(-20, -4, 40, 6);
                ctx.fillStyle = "white"; 
                ctx.fillRect(-12, -3, 6, 4); ctx.fillRect(6, -3, 6, 4);
            } 
            else {
                ctx.translate(x + w / 2, y + h / 2 + (npc.jumping ? 0 : bob));

                if (npc.role === "dog") {
                    ctx.scale(-1, 1);
                    ctx.fillStyle = "#5D4037"; this.drawRoundedRect(ctx, -17, 0, 34, 15, 5);
                    ctx.fillStyle = "#0D47A1"; ctx.fillRect(-12, -2, 22, 12); 
                    ctx.fillStyle = "#FFD700"; ctx.fillRect(2, 2, 4, 4); 
                    ctx.fillStyle = "white"; ctx.font = "bold 6px Arial"; ctx.fillText("K9", -6, 8);
                    ctx.fillStyle = "#5D4037"; this.drawRoundedRect(ctx, 10, -12, 14, 14, 4); 
                    ctx.fillRect(18, -6, 8, 6); ctx.fillStyle = "#3E2723"; 
                    ctx.fillRect(8, -14, 4, 6); ctx.fillStyle = "white"; ctx.fillRect(18, -10, 3, 3 * blink);
                    ctx.fillStyle = "black"; ctx.fillRect(24, -6, 2, 2);
                    ctx.fillRect(-15, 15 + step, 7, 7); ctx.fillRect(8, 15 - step, 7, 7);
                    ctx.save(); ctx.translate(-17, 5); ctx.rotate(Math.sin(time*0.1)*0.5);
                    ctx.fillStyle = "#5D4037"; ctx.fillRect(-8, -2, 10, 4); ctx.restore();
                } 
                else if (npc.role === "kitty") {
                    ctx.scale(-1, 1);
                    ctx.save(); ctx.translate(-12, 4); ctx.rotate(Math.sin(time * 0.05) * 0.4);
                    ctx.fillStyle = "#FB8C00"; this.drawRoundedRect(ctx, -8, -2, 10, 4, 2); ctx.restore();
                    ctx.fillStyle = "#FB8C00"; this.drawRoundedRect(ctx, -12, 0, 24, 12, 4);
                    ctx.fillStyle = "white"; this.drawRoundedRect(ctx, -6, 6, 14, 6, 2);
                    ctx.fillStyle = "#D32F2F"; ctx.fillRect(4, 0, 2, 12); 
                    ctx.fillStyle = "#FB8C00"; this.drawRoundedRect(ctx, 6, -10, 12, 12, 4);
                    ctx.fillStyle = "white"; this.drawRoundedRect(ctx, 12, -4, 6, 5, 2);
                    ctx.fillStyle = "#E65100";
                    ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(10, -16); ctx.lineTo(13, -10); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(13, -10); ctx.lineTo(15, -16); ctx.lineTo(18, -10); ctx.fill();
                    ctx.fillStyle = "#76FF03"; ctx.fillRect(10, -8, 3, 3 * blink); ctx.fillRect(15, -8, 3, 3 * blink);
                    ctx.fillStyle = "#FF80AB"; ctx.fillRect(17, -3, 2, 2);
                    ctx.fillStyle = "#111"; ctx.fillRect(-10, 10 + step, 5, 5); ctx.fillRect(8, 10 - step, 5, 5);
                }
                else if (npc.role === "baby") {
                    ctx.save(); ctx.translate(0, 10);
                    ctx.fillStyle = "#FF80AB"; this.drawRoundedRect(ctx, -14, -6, 22, 12, 4);
                    ctx.fillStyle = "white"; ctx.fillRect(-14, 0, 8, 8); 
                    ctx.fillStyle = npc.skin; ctx.beginPath(); ctx.arc(12, -8, 11, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "black"; ctx.fillRect(9, -10, 3, 3 * blink); ctx.fillRect(15, -10, 3, 3 * blink);
                    ctx.strokeStyle = npc.hairColor; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(12, -19); ctx.quadraticCurveTo(15, -25, 18, -19); ctx.stroke();
                    ctx.fillStyle = npc.skin; ctx.fillRect(-16, 2 + step, 6, 6); ctx.fillRect(4, 2 - step, 6, 6);
                    ctx.restore();
                }
                else if (npc.role === "ghost") {
                    // Styled after ghost.jpg reference: flowing smoky white shroud, dark hollow eyes, and a howling dark mouth
                    ctx.fillStyle = "rgba(240, 245, 255, 0.92)";
                    ctx.beginPath(); 
                    ctx.arc(0, -20, 20, Math.PI, 0); 
                    ctx.lineTo(22, 26);
                    const wave = Math.sin(time * 0.008 + npc.animOffset) * 6;
                    ctx.quadraticCurveTo(12, 32 + wave, 2, 26);
                    ctx.quadraticCurveTo(-8, 32 - wave, -18, 26);
                    ctx.lineTo(-22, -20); 
                    ctx.fill();

                    // Waving wispy side trails
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.beginPath();
                    ctx.moveTo(18, -5);
                    ctx.quadraticCurveTo(32 + wave, 5, 38, -2);
                    ctx.quadraticCurveTo(28, 12, 20, 18);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(-18, -5);
                    ctx.quadraticCurveTo(-32 - wave, 5, -38, -2);
                    ctx.quadraticCurveTo(-28, 12, -20, 18);
                    ctx.fill();

                    // Dark hollow ghostly eyes
                    ctx.fillStyle = "#0c1017"; 
                    ctx.beginPath(); ctx.ellipse(-7, -22, 3.5, 5.5, 0.2, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.ellipse(7, -22, 3.5, 5.5, -0.2, 0, Math.PI * 2); ctx.fill();

                    // Dark eerie open mouth (howling expression)
                    ctx.beginPath(); 
                    ctx.ellipse(0, -9, 4, 7, 0, 0, Math.PI * 2); 
                    ctx.fill();
                }
                else if (npc.role === "headlessMonster") {
                    // Styled after headless monster.jpg reference: Dark armored torso, glowing ruff collar, holding a glowing jack-o'-lantern head
                    ctx.save();
                    // Body / Torso & Cloak
                    ctx.fillStyle = "#1c242b";
                    this.drawRoundedRect(ctx, -16, -10, 32, 32, 6);
                    ctx.fillStyle = "#2d3748";
                    ctx.fillRect(-12, -2, 24, 20);

                    // Glowing eerie ruff collar at the neck opening
                    ctx.fillStyle = "#ffe552";
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = "#ff9900";
                    ctx.beginPath();
                    ctx.moveTo(-12, -10);
                    ctx.lineTo(0, -18);
                    ctx.lineTo(12, -10);
                    ctx.lineTo(6, -6);
                    ctx.lineTo(0, -12);
                    ctx.lineTo(-6, -6);
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Arm holding up the glowing jack-o'-lantern head
                    ctx.fillStyle = "#1c242b";
                    ctx.beginPath();
                    ctx.moveTo(8, -4);
                    ctx.lineTo(22, -22);
                    ctx.lineTo(26, -18);
                    ctx.lineTo(12, 2);
                    ctx.closePath();
                    ctx.fill();

                    // Glowing Pumpkin Head
                    const floatBob = Math.sin(time * 0.01) * 3;
                    ctx.translate(22, -32 + floatBob);
                    
                    ctx.fillStyle = "#ff7700";
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "#ff5500";
                    ctx.beginPath();
                    ctx.arc(0, 0, 14, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Jack-o'-lantern glowing eyes and smile
                    ctx.fillStyle = "#fff5cc";
                    ctx.beginPath();
                    ctx.moveTo(-6, -4); ctx.lineTo(-2, -8); ctx.lineTo(-2, -2); ctx.closePath();
                    ctx.moveTo(6, -4); ctx.lineTo(2, -8); ctx.lineTo(2, -2); ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(0, 3, 7, 0, Math.PI, false);
                    ctx.fill();
                    
                    // Pumpkin stem
                    ctx.fillStyle = "#2e5c1e";
                    ctx.fillRect(-2, -17, 4, 4);
                    ctx.restore();
                }
                else if (npc.role === "monster") {
                    // Styled after monster.jpg reference: dark spiky deep-sea/swamp creature with large glowing cyan eyes & massive jagged toothy grin
                    ctx.fillStyle = "#142629"; 
                    this.drawRoundedRect(ctx, -26, -22, 52, 44, 12); 
                    
                    // Spikes along the body/head
                    ctx.fillStyle = "#0b1517";
                    ctx.beginPath();
                    ctx.moveTo(-22, -15); ctx.lineTo(-32, -20); ctx.lineTo(-18, -25); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(22, -15); ctx.lineTo(32, -20); ctx.lineTo(18, -25); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(-10, -22); ctx.lineTo(-12, -32); ctx.lineTo(-4, -24); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(10, -22); ctx.lineTo(12, -32); ctx.lineTo(4, -24); ctx.fill();

                    // Glowing cyan hypnotic eyes
                    ctx.fillStyle = "#00ffff";
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = "#00ffff";
                    ctx.beginPath(); ctx.arc(-11, -8, 7, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(11, -8, 7, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;

                    // Inner bright pupils
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(-13, -10, 4, 4); ctx.fillRect(9, -10, 4, 4);

                    // Massive wide jagged toothy grin
                    ctx.fillStyle = "#0a1417";
                    this.drawRoundedRect(ctx, -22, 2, 44, 18, 4);
                    
                    ctx.fillStyle = "#ffffff";
                    // Top sharp teeth
                    for(let j = 0; j < 7; j++) {
                        ctx.beginPath();
                        ctx.moveTo(-19 + (j * 6), 2);
                        ctx.lineTo(-16 + (j * 6), 11);
                        ctx.lineTo(-13 + (j * 6), 2);
                        ctx.fill();
                    }
                    // Bottom sharp teeth
                    for(let j = 0; j < 7; j++) {
                        ctx.beginPath();
                        ctx.moveTo(-19 + (j * 6), 20);
                        ctx.lineTo(-16 + (j * 6), 11);
                        ctx.lineTo(-13 + (j * 6), 20);
                        ctx.fill();
                    }
                }
                else {
                    const isCop = npc.role === "police" || npc.role === "policeBoss";
                    const isBuster = npc.role === "ghostbuster";
                    const isTurtle = npc.role === "turtle";
                    const isKarate = npc.role === "karate";
                    const isZombie = npc.role === "zombie";
                    const isSkeleton = npc.role === "skeleton";
                    const isAngel = npc.role === "angel";
                    const isDevil = npc.role === "devil";
                    const isAlien = npc.role === "alien";
                    const isPirate = npc.role === "pirate";
                    const isDinosaur = npc.role === "dinosaur";
                    const isVampire = npc.role === "vampire";
                    const isHuman = !isTurtle && !isZombie && !isKarate && !isSkeleton && !isAngel && !isDevil && !isAlien && !isPirate && !isDinosaur && !isVampire;

                    ctx.fillStyle = npc.skin;
                    this.drawRoundedRect(ctx, -12, -h/2, 24, 22, 6); 
                    
                    if (isTurtle) {
                        ctx.fillStyle = npc.bandana; ctx.fillRect(-13, -h/2 + 5, 26, 6);
                        ctx.save(); ctx.translate(13, -h/2 + 8); ctx.rotate(Math.sin(time * 0.05) * 0.3);
                        ctx.fillRect(0, -2, 10, 4); ctx.rotate(0.5); ctx.fillRect(0, -2, 8, 4); ctx.restore();
                        ctx.fillStyle = "white"; ctx.fillRect(-8, -h/2 + 6, 4, 4 * blink); ctx.fillRect(4, -h/2 + 6, 4, 4 * blink);
                    } else if (isSkeleton) {
                        // Styled after skeleton.jpg reference: clean realistic skull structure and proportions
                        ctx.fillStyle = "#EAEAEA";
                        this.drawRoundedRect(ctx, -11, -h/2 - 4, 22, 20, 8);
                        ctx.fillStyle = "#111111";
                        // Eye sockets
                        ctx.fillRect(-7, -h/2 + 2, 4, 6); ctx.fillRect(3, -h/2 + 2, 4, 6);
                        // Nasal cavity
                        ctx.beginPath(); ctx.moveTo(0, -h/2 + 9); ctx.lineTo(-1.5, -h/2 + 13); ctx.lineTo(1.5, -h/2 + 13); ctx.fill();
                        // Jaw line / teeth dashes
                        ctx.fillStyle = "#EAEAEA";
                        ctx.fillRect(-8, -h/2 + 15, 16, 3);
                        ctx.fillStyle = "#111111";
                        for(let j = 0; j < 4; j++) ctx.fillRect(-6 + (j * 4), -h/2 + 15, 2, 3);
                    } else if (isVampire) {
                        // Styled after vampire.jpg reference: sleek dark slicked-back hair, intense piercing gaze, tall dramatic high-collar cape
                        ctx.fillStyle = npc.skin;
                        this.drawRoundedRect(ctx, -12, -h/2, 24, 22, 6);
                        
                        // Piercing eyes & subtle fangs
                        ctx.fillStyle = "#050505";
                        ctx.fillRect(-7, -h/2 + 7, 4, 4); ctx.fillRect(3, -h/2 + 7, 4, 4);
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(-5, -h/2 + 13, 2, 3); ctx.fillRect(3, -h/2 + 13, 2, 3);

                        // Slicked-back dark vampire hair
                        ctx.fillStyle = "#111111";
                        this.drawRoundedRect(ctx, -13, -h/2 - 4, 26, 10, 5);
                        ctx.fillRect(-14, -h/2, 4, 8); ctx.fillRect(10, -h/2, 4, 8);

                        // Dramatic tall upright collar framing the head
                        ctx.fillStyle = "#111111";
                        ctx.beginPath();
                        ctx.moveTo(-16, -h/2 + 6); ctx.lineTo(-24, -h/2 - 8); ctx.lineTo(-10, -h/2 + 2); ctx.closePath(); ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(16, -h/2 + 6); ctx.lineTo(24, -h/2 - 8); ctx.lineTo(10, -h/2 + 2); ctx.closePath(); ctx.fill();
                    } else if (isDevil) {
                        this.drawFace(ctx, npc, h, blink, isCop);
                        ctx.fillStyle = "#B71C1C";
                        ctx.beginPath(); ctx.moveTo(-10, -h/2 - 2); ctx.lineTo(-16, -h/2 - 14); ctx.lineTo(-4, -h/2 - 6); ctx.closePath(); ctx.fill();
                        ctx.fillStyle = "#FF5252"; 
                        ctx.beginPath(); ctx.moveTo(-11, -h/2 - 6); ctx.lineTo(-14, -h/2 - 12); ctx.lineTo(-8, -h/2 - 7); ctx.closePath(); ctx.fill();

                        ctx.fillStyle = "#B71C1C";
                        ctx.beginPath(); ctx.moveTo(10, -h/2 - 2); ctx.lineTo(16, -h/2 - 14); ctx.lineTo(4, -h/2 - 6); ctx.closePath(); ctx.fill();
                        ctx.fillStyle = "#FF5252";
                        ctx.beginPath(); ctx.moveTo(11, -h/2 - 6); ctx.lineTo(14, -h/2 - 12); ctx.lineTo(8, -h/2 - 7); ctx.closePath(); ctx.fill();

                        ctx.fillStyle = "#000000";
                        ctx.beginPath(); ctx.moveTo(-2, -h/2 + 19); ctx.lineTo(2, -h/2 + 19); ctx.lineTo(0, -h/2 + 23); ctx.fill();
                    } else if (isAlien) {
                        ctx.fillStyle = "#81C784";
                        this.drawRoundedRect(ctx, -16, -h/2 - 2, 32, 24, 10);
                        ctx.fillStyle = "black";
                        ctx.beginPath(); ctx.ellipse(-6, -h/2 + 8, 4, 7, 0.3, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(6, -h/2 + 8, 4, 7, -0.3, 0, Math.PI * 2); ctx.fill();
                    } else if (isDinosaur) {
                        ctx.fillStyle = "#66BB6A";
                        this.drawRoundedRect(ctx, -18, -h/2 - 4, 36, 26, 10);
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(-8, -h/2 + 4, 5, 5); ctx.fillRect(3, -h/2 + 4, 5, 5);
                        ctx.fillStyle = "#000000";
                        ctx.fillRect(-6, -h/2 + 6, 2, 2); ctx.fillRect(5, -h/2 + 6, 2, 2);
                        ctx.fillStyle = "#2E7D32";
                        ctx.beginPath(); ctx.moveTo(-10, -h/2 - 4); ctx.lineTo(-14, -h/2 - 10); ctx.lineTo(-6, -h/2 - 4); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(0, -h/2 - 4); ctx.lineTo(-2, -h/2 - 12); ctx.lineTo(4, -h/2 - 4); ctx.fill();
                    } else if (isAngel) {
                        this.drawFace(ctx, npc, h, blink, isCop);
                        ctx.strokeStyle = "#FFF176";
                        ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.arc(0, -h/2 - 9, 9, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = "#FFEE58";
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.arc(0, -h/2 - 9, 7, 0, Math.PI * 2); ctx.stroke();
                    } else {
                        this.drawFace(ctx, npc, h, blink, isCop);
                    }
                    
                    if (isKarate) {
                        ctx.fillStyle = "black"; ctx.fillRect(-13, -h/2 + 4, 26, 4); 
                        ctx.save(); ctx.translate(12, -h/2 + 6); ctx.rotate(Math.sin(time*0.1)*0.4);
                        ctx.fillRect(0, -1, 8, 2); ctx.rotate(0.6); ctx.fillRect(0, -1, 6, 2); ctx.restore();
                    } else if (isBuster) {
                        ctx.fillStyle = "#2E1A09"; this.drawRoundedRect(ctx, -14, -h/2 - 6, 28, 10, 5); 
                        this.drawRoundedRect(ctx, -16, -h/2 - 2, 8, 12, 3); this.drawRoundedRect(ctx, 8, -h/2 - 2, 8, 12, 3);    
                    } else if (npc.role === "girl") {
                        ctx.fillStyle = npc.hairColor;
                        if (npc.hairStyle === 0) { this.drawRoundedRect(ctx, -14, -h/2 - 4, 28, 24, 8); this.drawRoundedRect(ctx, 8, -h/2 + 4, 10, 18, 4); }
                        else if (npc.hairStyle === 1) { this.drawRoundedRect(ctx, -15, -h/2 - 4, 30, 12, 5); ctx.fillRect(-18, -h/2, 8, 15); ctx.fillRect(10, -h/2, 8, 15); }
                        else { this.drawRoundedRect(ctx, -14, -h/2 - 4, 28, 32, 6); }
                    } else if (npc.role === "worker") {
                        ctx.fillStyle = "#ffd600"; ctx.beginPath(); ctx.arc(0, -h/2 - 2, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(-18, -h/2 - 2, 36, 4); 
                    } else if (isCop) {
                        ctx.fillStyle = "#00123a"; ctx.fillRect(-16, -h/2 - 6, 32, 8); 
                        ctx.fillStyle = "#ffd700"; ctx.fillRect(-2, -h/2 - 5, 4, 3); 
                    } else if (isSkeleton) {
                        ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-14, -h/2 + 18, 28, 4);
                    } else if (isAngel) {
                        ctx.fillStyle = npc.hairColor; this.drawRoundedRect(ctx, -13, -h/2 - 2, 26, 8, 4);
                        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                        ctx.beginPath(); ctx.ellipse(-16, -h/2 + 25, 12, 6, -0.6, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(-12, -h/2 + 31, 9, 4, -0.4, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(16, -h/2 + 25, 12, 6, 0.6, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(12, -h/2 + 31, 9, 4, 0.4, 0, Math.PI * 2); ctx.fill();
                    } else if (isPirate) {
                        ctx.fillStyle = "#111111";
                        ctx.beginPath(); ctx.moveTo(-18, -h/2 + 3); ctx.lineTo(18, -h/2 + 3); ctx.lineTo(12, -h/2 - 8); ctx.lineTo(-12, -h/2 - 8); ctx.closePath(); ctx.fill();
                        ctx.fillStyle = "#FFD700"; 
                        ctx.fillRect(-10, -h/2 - 2, 20, 2);
                        ctx.fillRect(-2, -h/2 - 3, 4, 4);

                        ctx.fillStyle = "#000000";
                        ctx.beginPath(); ctx.arc(-5, -h/2 + 8, 4.5, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = "#795548"; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(-10, -h/2 + 3); ctx.lineTo(-1, -h/2 + 12); ctx.stroke();

                        ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.arc(-13, -h/2 + 11, 2.5, 0, Math.PI); ctx.stroke();
                    } else if (!isTurtle && !isZombie && !isAlien && !isDinosaur && !isVampire) {
                        ctx.fillStyle = npc.hairColor; this.drawRoundedRect(ctx, -13, -h/2 - 2, 26, 8, 4);
                    }

                    ctx.fillStyle = isCop ? "#0d47a1" : (isBuster ? "#d2b48c" : (isSkeleton ? "#111111" : (isDevil ? "#B71C1C" : (isVampire ? "#1a1a1a" : npc.shirt))));
                    if (isTurtle) ctx.fillStyle = "#A5D6A7"; 
                    if (isPirate) ctx.fillStyle = "#D32F2F";
                    this.drawRoundedRect(ctx, -14, -h/2 + 20, 28, 18, 5);

                    // Vampire red inner vest lining matching reference cape
                    if (isVampire) {
                        ctx.fillStyle = "#990000";
                        ctx.beginPath();
                        ctx.moveTo(-6, -h/2 + 20); ctx.lineTo(0, -h/2 + 32); ctx.lineTo(6, -h/2 + 20); ctx.fill();
                    }

                    if (isHuman || isBuster || isCop || isKarate || isAngel) {
                        ctx.fillStyle = "rgba(0,0,0,0.15)";
                        ctx.beginPath(); ctx.moveTo(-6, -h/2 + 20); ctx.lineTo(0, -h/2 + 26); ctx.lineTo(6, -h/2 + 20); ctx.fill();
                        ctx.fillStyle = "rgba(0,0,0,0.3)";
                        for(let j=0; j<3; j++) ctx.fillRect(-1, -h/2 + 28 + (j*4), 2, 2);
                    }

                    if (isCop) {
                        ctx.fillStyle = "#FFD700"; ctx.fillRect(4, -h/2 + 23, 5, 5); 
                    } else if (isBuster) {
                        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(-14, -h/2 + 25, 4.5, 0, Math.PI*2); ctx.fill();
                        ctx.strokeStyle = "red"; ctx.lineWidth = 1.2; ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(-17, -h/2 + 22); ctx.lineTo(-11, -h/2 + 28); ctx.stroke();
                    } else if (isKarate) {
                        ctx.fillStyle = "black"; ctx.fillRect(-15, -h/2 + 34, 30, 4); ctx.fillRect(-2, -h/2 + 34, 4, 8); 
                    } else if (isTurtle) {
                        ctx.fillStyle = "#FBC02D"; this.drawRoundedRect(ctx, -8, -h/2 + 22, 16, 14, 4); 
                        ctx.fillStyle = "#2E7D32"; this.drawRoundedRect(ctx, 8, -h/2 + 15, 12, 26, 8); 
                    } else if (isSkeleton) {
                        ctx.fillStyle = "#E0E0E0";
                        // Ribcage structure matching skeleton.jpg
                        for(let j=0; j<4; j++) {
                            ctx.fillRect(-6, -h/2 + 22 + (j*3.5), 12, 1.5);
                        }
                        ctx.fillRect(-1.5, -h/2 + 21, 3, 14); 
                    } else if (isPirate) {
                        ctx.fillStyle = "#212121";
                        ctx.fillRect(-14, -h/2 + 30, 28, 4);
                        ctx.fillStyle = "#FFD700";
                        ctx.fillRect(-3, -h/2 + 29, 6, 6);
                    } else if (isZombie) {
                        if(npc.bloodSpots) {
                            npc.bloodSpots.forEach(s => { ctx.fillStyle = "#4a0000"; ctx.beginPath(); ctx.arc(s.x, -h/2 + 30 + s.y, 2, 0, Math.PI*2); ctx.fill(); });
                        }
                    }

                    const ay = -h / 2 + 24;
                    ctx.fillStyle = npc.skin;
                    if (isCop || isBuster) {
                        ctx.save(); ctx.translate(npc.facing === 1 ? 12 : -12, ay); ctx.rotate(npc.aimAngle);
                        this.drawRoundedRect(ctx, 0, -4, 20, 8, 3);
                        if (isBuster) {
                            ctx.fillStyle = "#222"; ctx.fillRect(15, -3, 15, 6); 
                            if (npc.shootTimer < 10) { 
                                ctx.shadowBlur = 10; ctx.shadowColor = "#40c4ff";
                                ctx.strokeStyle = "#40c4ff"; ctx.lineWidth = 6;
                                ctx.beginPath(); ctx.moveTo(30, 0);
                                for(let j=0; j<8; j++) ctx.lineTo(30 + j * 15, (Math.random() - 0.5) * 20);
                                ctx.stroke(); 
                                ctx.strokeStyle = "white"; ctx.lineWidth = 2;
                                ctx.stroke();
                                ctx.shadowBlur = 0;
                            }
                        } else {
                            ctx.fillStyle = "#222"; ctx.fillRect(16, -3, 12, 7); 
                            if (npc.shootTimer < 3) { ctx.fillStyle = "#FFF700"; ctx.beginPath(); ctx.arc(30, 0, 10, 0, Math.PI * 2); ctx.fill(); }
                        }
                        ctx.restore();
                    } else if (isKarate) {
                        this.drawRoundedRect(ctx, -20, ay - 5, 12, 6, 2); this.drawRoundedRect(ctx, 8, ay + 5, 12, 6, 2); 
                    } else if (isSkeleton) {
                        ctx.fillStyle = "#E0E0E0";
                        this.drawRoundedRect(ctx, -19, ay - 2, 4, 20, 2); 
                        this.drawRoundedRect(ctx, 15, ay - 2, 4, 20, 2);
                    } else if (isZombie) {
                        if (npc.zombieStyle === "zombieSwingUp") {
                            const waveAngle1 = Math.sin((time * 0.008) + npc.animOffset) * 0.4 - 1.8; 
                            const waveAngle2 = Math.cos((time * 0.008) + npc.animOffset) * 0.4 - 1.8;

                            ctx.save(); ctx.translate(-10, ay); ctx.rotate(waveAngle1);
                            this.drawRoundedRect(ctx, -3, -28, 7, 28, 3); ctx.restore();

                            ctx.save(); ctx.translate(10, ay); ctx.rotate(waveAngle2);
                            this.drawRoundedRect(ctx, -4, -28, 7, 28, 3); ctx.restore();
                        } else if (npc.zombieStyle === "zombieSwingDown") {
                            const downAngle1 = Math.sin((time * 0.008) + npc.animOffset) * 0.4 + 1.2; 
                            const downAngle2 = Math.cos((time * 0.008) + npc.animOffset) * 0.4 + 1.2;

                            ctx.save(); ctx.translate(-10, ay); ctx.rotate(downAngle1);
                            this.drawRoundedRect(ctx, -3, 0, 7, 28, 3); ctx.restore();

                            ctx.save(); ctx.translate(10, ay); ctx.rotate(downAngle2);
                            this.drawRoundedRect(ctx, -4, 0, 7, 28, 3); ctx.restore();
                        } else {
                            const forwardAngle1 = Math.sin((time * 0.008) + npc.animOffset) * 0.3 - 0.1; 
                            const forwardAngle2 = Math.cos((time * 0.008) + npc.animOffset) * 0.3 - 0.1;

                            ctx.save(); ctx.translate(-12, ay); ctx.rotate(forwardAngle1);
                            this.drawRoundedRect(ctx, -26, -3, 26, 7, 3); ctx.restore();

                            ctx.save(); ctx.translate(12, ay); ctx.rotate(forwardAngle2);
                            this.drawRoundedRect(ctx, 0, -3, 26, 7, 3); ctx.restore();
                        }
                    } else {
                        this.drawRoundedRect(ctx, -18, ay + (step / 2), 7, 14, 3); this.drawRoundedRect(ctx, 11, ay - (step / 2), 7, 14, 3);
                    }

                    ctx.fillStyle = (isBuster || isKarate) ? npc.shirt : (isTurtle ? "#2E7D32" : (isSkeleton ? "#111111" : (isDevil ? "#7F0000" : (isVampire ? "#111111" : npc.pants))));
                    if (isKarate && npc.jumping) {
                        this.drawRoundedRect(ctx, -28, -h/2 + 36, 24, 10, 4); 
                        this.drawRoundedRect(ctx, 2, -h/2 + 36, 10, 14, 4); 
                        ctx.fillStyle = "#111"; ctx.fillRect(-28, -h/2 + 42, 6, 4); 
                    } else {
                        this.drawRoundedRect(ctx, -11, -h / 2 + 36 + step, 10, 12, 4); 
                        this.drawRoundedRect(ctx, 1, -h / 2 + 36 - step, 10, 12, 4);
                        ctx.fillStyle = isSkeleton ? "#E0E0E0" : "#111"; 
                        ctx.fillRect(-11, -h/2 + 46 + step, 10, 4); ctx.fillRect(1, -h/2 + 46 - step, 10, 4);
                    }
                }
            }
            ctx.restore(); 
        }
    }
};