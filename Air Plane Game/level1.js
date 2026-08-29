// ==========================================
// LEVEL 1: CABIN CHAOS LOGIC (UPDATED)
// ==========================================

function initLevelOne() {
    gameState = 'PLAYING';
    currentLevel = 1;
    score = 0;
    passengersRescued = 0;
    planeIntegrity = 100;
    fireTimer = 0;
    fireSpreadProgress = 0;
    passengers = [];
    particles = [];
    flyingNPCs = []; 
    cabinFires = []; 
    extinguisher.isCarried = false;
    extinguisher.onWall = true;
    extinguisher.charges = 25;
    extinguisher.respawnTimer = 0;
    repairKit.active = false;
    repairKit.spawnTimer = 0;
    player.x = 400;
    player.y = 250;
    player.vx = 0;
    player.vy = 0;
    player.carrying = null;
    player.actionCooldown = 0; 
    spawnBatchPassengers();
}

function handleExtinguisher() {
    if (!extinguisher.isCarried) return;
    if (extinguisher.charges <= 0) return;

    extinguisher.charges--;
    playSound('spray');

    let sprayDir = (activeInputs.facingDir === 'left') ? -1 : 1;

    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + 14 + (sprayDir * 15),
            y: player.y + 20 + (Math.random() * 8 - 4),
            vx: sprayDir * (5 + Math.random() * 3),
            vy: (Math.random() - 0.5) * 2,
            life: 40 + Math.random() * 20,
            maxLife: 60,
            size: 12 + Math.random() * 8,
            isSmoke: true
        });
    }

    if (extinguisher.charges <= 0) {
        extinguisher.isCarried = false;
        extinguisher.respawnTimer = 600; 
    }
}

function updateLevelOne() {
    for (let p of passengers) {
        if (p.isBurning) {
            p.burnDuration = (p.burnDuration || 0) + 1;
        }
    }
    if (player.carrying && player.carrying.isBurning) {
        player.carrying.burnDuration = (player.carrying.burnDuration || 0) + 1;
    }

    if (typeof updateInputs === 'function') {
        updateInputs();
    }
    updatePlayer();

    score += 0.05; 

    // Check for Level 2 transition: 30 rescued and player reaches the left edge
    if (passengersRescued >= 30 && currentLevel === 1) {
        if (player.x <= 40) {
            playSound('levelclear');
            initLevelTwo();
            return;
        }
    }

    // Update and check smoke particles for fire collisions
    for (let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;

        if (pt.isSmoke) {
            for (let p of passengers) {
                if (p.isBurning && Math.hypot(pt.x - p.x, pt.y - p.y) < (pt.size + 15)) {
                    p.isBurning = false;
                    p.burnDuration = 0;
                    score += 50;
                    particles.push({
                        x: p.x,
                        y: p.y - 15,
                        vx: 0,
                        vy: -1,
                        life: 40,
                        text: "🧯 Fire Extinguished!"
                    });
                }
            }

            if (typeof cabinFires !== 'undefined') {
                for (let f of cabinFires) {
                    if (f.intensity > 0 && Math.hypot(pt.x - f.x, pt.y - f.y) < (pt.size + pt.size)) {
                        f.intensity -= 1.5;
                        if (f.intensity < 0) f.intensity = 0;
                    }
                }
            }
        }

        if (pt.life <= 0) {
            particles.splice(i, 1);
        }
    }

    if (!extinguisher.isCarried && !extinguisher.onWall && extinguisher.respawnTimer > 0) {
        extinguisher.respawnTimer--;
        if (extinguisher.respawnTimer <= 0) {
            extinguisher.onWall = true;
            extinguisher.charges = 25;
        }
    }

    if (!repairKit.active) {
        repairKit.spawnTimer++;
        if (repairKit.spawnTimer % 900 === 0) { 
            repairKit.active = true;
            repairKit.x = 200 + Math.random() * 500;
            repairKit.y = 100 + Math.random() * 250;
        }
    }

    let emergency = getCurrentEmergency();
    fireTimer++;

    if (activeEmergency === 'fire') {
        if (fireSpreadProgress < 750) {
            fireSpreadProgress += 0.03;
        }
    }

    if (fireTimer % 140 === 0) {
        planeIntegrity -= emergency.damageRate;
        playSound('alarm');
        if (planeIntegrity <= 0) {
            planeIntegrity = 0;
            stopBGM();
            playSound('gameover');
            
            if (checkHighScore(score)) {
                playerName = "";
                gameState = 'NAME_ENTRY';
            } else {
                gameState = 'HIGHSCORES';
            }
        }
    }

    for (let i = flyingNPCs.length - 1; i >= 0; i--) {
        let f = flyingNPCs[i];
        let mult = f.fallMultiplier || 1.0;
        
        if (f.stage === 'hovering') {
            f.rot += f.vRot;
            if (f.life < 220) {
                f.stage = 'sucking'; 
                f.vx = -1.2 * mult;
            }
        } else if (f.stage === 'sucking') {
            f.x += f.vx;
            f.rot += f.vRot;
            if (f.x <= 50) {
                f.stage = 'vacuumed'; 
                f.vx = -4 * mult;
            }
        } else if (f.stage === 'vacuumed') {
            f.x += f.vx;
            f.y += f.vy;
            f.vy += 0.15 * mult; 
            f.rot += f.vRot * 1.1;
            if (f.x <= -20) {
                f.stage = 'falling';
                f.vx = -6 * mult;
                f.vy = 2 * mult; 
            }
        } else {
            f.x += f.vx;
            f.y += f.vy;
            f.vy += 0.25 * mult;
            f.rot += f.vRot;
        }

        f.life--;
        if (f.life <= 0) flyingNPCs.splice(i, 1);
    }
}

function drawLevelOne(ctx) {
    drawPlaneBackground(ctx);

    for (let p of passengers) {
        drawPassenger(ctx, p, false);

        if (p.template && p.template.name) {
            ctx.font = "bold 12px 'Segoe UI'";
            let nameWidth = ctx.measureText(p.template.name).width;
            let badgeX = Math.max(10, Math.min(canvas.width - nameWidth - 14, p.x - nameWidth / 2 - 7));
            
            ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
            ctx.fillRect(badgeX, p.y - 34, nameWidth + 14, 18);

            ctx.fillStyle = "#38bdf8"; 
            ctx.textAlign = "center";
            ctx.fillText(p.template.name, badgeX + (nameWidth + 14) / 2, p.y - 20);
            ctx.textAlign = "left";
        }
    }

    drawPlayer(ctx, drawPassenger);

    for (let f of flyingNPCs) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        drawPassenger(ctx, { x: 0, y: 0, template: f.template }, false);
        ctx.restore();

        if (f.template && f.template.name) {
            ctx.font = "bold 12px 'Segoe UI'";
            let nameWidth = ctx.measureText(f.template.name).width;
            let nameBadgeX = Math.max(10, Math.min(canvas.width - nameWidth - 14, f.x - nameWidth / 2 - 7));

            ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
            ctx.fillRect(nameBadgeX, f.fixedY - 22, nameWidth + 14, 18);

            ctx.fillStyle = "#facc15"; 
            ctx.textAlign = "center";
            ctx.fillText(f.template.name, nameBadgeX + (nameWidth + 14) / 2, f.fixedY - 8);
            ctx.textAlign = "left";
        }

        ctx.font = "bold 13px 'Segoe UI'";
        let textWidth = ctx.measureText(f.scream).width;
        let textBadgeX = Math.max(10, Math.min(canvas.width - textWidth - 16, f.x - textWidth / 2 - 8));
        
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(textBadgeX, f.fixedY, textWidth + 16, 22);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(f.scream, textBadgeX + (textWidth + 16) / 2, f.fixedY + 15);
        ctx.textAlign = "left";
    }

    // Draw Flashing "JUMP!" Sign when 30 passengers are rescued
    if (passengersRescued >= 30 && currentLevel === 1) {
        if (Math.floor(Date.now() / 250) % 2 === 0) { // Flashes every quarter second
            ctx.save();
            ctx.font = "bold 32px 'Segoe UI'";
            ctx.fillStyle = "#ef4444";
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 4;
            ctx.textAlign = "center";
            
            ctx.strokeText("⚠️ RUN TO THE LEFT TO JUMP! ⚠️", canvas.width / 2, 80);
            ctx.fillText("⚠️ RUN TO THE LEFT TO JUMP! ⚠️", canvas.width / 2, 80);
            
            ctx.restore();
        }
    }
}