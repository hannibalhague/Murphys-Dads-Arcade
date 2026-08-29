// ==========================================
// GAME ENGINE LOOP FILE (MODULAR CORE)
// ==========================================
const canvas = document.getElementById("gameCanvas");

canvas.width = 900;
canvas.height = 500;

const ctx = canvas.getContext("2d");

let skyClouds = [];
for (let i = 0; i < 10; i++) {
    skyClouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 80 + Math.random() * 60,
        height: 25 + Math.random() * 15,
        speed: 1.2 + Math.random() * 1.5
    });
}

function startGame() {
    initLevelOne();
    if (typeof startBGM === 'function') {
        startBGM();
    }
}

function getRandomTemplate() {
    let rand = Math.random();
    let candidates = [];
    
    if (rand < 0.2) {
        candidates = npcTemplates.filter(t => t.type === 'baby');
    } else if (rand < 0.4) {
        candidates = npcTemplates.filter(t => t.type === 'wheel');
    } else if (rand < 0.6) {
        candidates = npcTemplates.filter(t => t.type === 'animal');
    } else if (rand < 0.8) {
        candidates = npcTemplates.filter(t => t.type === 'heavy');
    } else {
        candidates = npcTemplates.filter(t => t.type === 'normal');
    }
    
    if (candidates.length === 0) candidates = npcTemplates;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function spawnBatchPassengers() {
    let availableSlots = [...seatSlots];
    availableSlots.sort(() => Math.random() - 0.5);

    let count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count && i < availableSlots.length; i++) {
        let slot = availableSlots[i];
        let template = getRandomTemplate();
        passengers.push({
            x: slot.x,
            y: slot.y,
            width: 28,
            height: 42,
            template: template,
            seated: true
        });
    }
}

// --- LEVEL SELECT CHEAT KEY LISTENER ---
window.addEventListener('keydown', (e) => {
    if (e.key === '1') {
        initLevelOne();
        if (typeof startBGM === 'function') startBGM();
        console.log("CHEAT: Jumped to Level 1");
    }
    else if (e.key === '2') {
        initLevelTwo();
        if (typeof startBGM === 'function') startBGM();
        console.log("CHEAT: Jumped to Level 2");
    }
    else if (e.key === '3') {
        initLevelThree();
        if (typeof startBGM === 'function') startBGM();
        console.log("CHEAT: Jumped to Level 3");
    }
});

function handleAction() {
    if (gameState !== 'PLAYING') return;

    if (player.actionCooldown > 0) return;

    if (repairKit.active && Math.hypot(player.x - repairKit.x, player.y - repairKit.y) < 45) {
        repairKit.active = false;
        planeIntegrity = Math.min(100, planeIntegrity + 25);
        score += 150;
        playSound('grab');
        particles.push({
            x: repairKit.x,
            y: repairKit.y,
            vx: 0,
            vy: -1.5,
            life: 60,
            text: "🔧 +25% Plane Integrity!"
        });
        player.actionCooldown = 15;
        return;
    }

    if (extinguisher.onWall && Math.hypot(player.x - extinguisher.x, player.y - extinguisher.y) < 50) {
        extinguisher.onWall = false;
        extinguisher.isCarried = true;
        extinguisher.charges = 25;
        playSound('grab');
        player.actionCooldown = 15;
        return;
    }

    if (!player.carrying) {
        let closestIdx = -1;
        let minDist = 50;
        for (let i = 0; i < passengers.length; i++) {
            let p = passengers[i];
            let dist = Math.hypot(player.x - p.x, player.y - p.y);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = i;
            }
        }
        if (closestIdx !== -1) {
            player.carrying = passengers.splice(closestIdx, 1)[0];
            player.carrying.seated = false; 

            if (player.carrying.template && player.carrying.template.name) {
                playNpcSound(player.carrying.template.name);
            } else {
                playSound('grab');
            }

            let styles = ['front_hug', 'front_cradle', 'front_slide'];
            player.carrying.carryStyle = styles[Math.floor(Math.random() * styles.length)];

            let carriedType = player.carrying.template && player.carrying.template.type ? player.carrying.template.type : 'normal';
            
            if (carriedType === 'wheel') {
                player.maxSpeed = 3.2; 
            } else if (carriedType === 'heavy') {
                player.maxSpeed = 1.0; 
            } else if (carriedType === 'baby' || carriedType === 'animal') {
                player.maxSpeed = 2.4; 
            } else {
                player.maxSpeed = 1.8; 
            }

            player.actionCooldown = 20;
        }
    } else {
        if (player.x < 110 && player.y > 100 && player.y < 380) {
            playSound('throw');
            
            let thrownPassenger = player.carrying;
            let carriedType = thrownPassenger.template && thrownPassenger.template.type ? thrownPassenger.template.type : 'normal';
            
            let rescuePoints = 100;
            let rewardText = "+100 PTS";
            if (carriedType === 'baby') {
                rescuePoints = 75;
                rewardText = "👶 +75 PTS (Baby Rescue)";
            } else if (carriedType === 'wheel') {
                rescuePoints = 300;
                rewardText = "🦽 +300 PTS (Wheelchair Assist Rescue)";
            } else if (carriedType === 'animal') {
                rescuePoints = 250;
                rewardText = "🐾 +250 PTS (Pet Rescue)";
            } else if (carriedType === 'heavy') {
                rescuePoints = 400;
                rewardText = "🏋️ +400 PTS (Heavyweight Rescue)";
            } else {
                rescuePoints = 200;
                rewardText = "👤 +200 PTS (Passenger Rescue)";
            }

            score += rescuePoints;
            passengersRescued++;
            planeIntegrity = Math.min(100, planeIntegrity + 5);

            if (passengersRescued >= levelTwoThreshold && currentLevel === 1) {
                initLevelTwo();
            }

            particles.push({
                x: player.x,
                y: player.y - 20,
                vx: 0,
                vy: -1.2,
                life: 50,
                text: rewardText
            });
            
            let funnyScreams = [
                "I FORGOT HOW TO FLY", "MY RATING WAS GOING TO BE 5 STARS", 
                "I LOVE YOU SON", "TELL MY CAT I LOVE HIM", "WHEEEEEE"
            ];
            let randomScream = funnyScreams[Math.floor(Math.random() * funnyScreams.length)];

            flyingNPCs.push({
                x: 60,
                y: player.y,
                vx: -0.15, 
                vy: (Math.random() - 0.5) * 0.2,
                rot: 0,
                vRot: (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.04),
                life: 300,  
                stage: 'hovering', 
                template: thrownPassenger.template,
                scream: randomScream,
                fixedY: Math.max(110, player.y - 75),
                fallMultiplier: (carriedType === 'heavy') ? 1.5 : 1.0
            });

            player.carrying = null;
            player.maxSpeed = 2.5;
            player.actionCooldown = 20;

            if (passengers.length < 3 && currentLevel === 1) {
                spawnBatchPassengers();
            }
        } else {
            player.carrying.x = player.x;
            player.carrying.y = player.y;
            passengers.push(player.carrying);
            player.carrying = null;
            player.maxSpeed = 2.5;
            playSound('grab');
            player.actionCooldown = 20;
        }
    }
}

let prevGlobalGamepadState = {};

function update() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let gp of gamepads) {
        if (!gp) continue;
        gp.buttons.forEach((btn, idx) => {
            let isPressed = btn && btn.pressed;
            let wasPressed = prevGlobalGamepadState[idx] || false;
            if (isPressed && !wasPressed) {
                if (typeof initAudio === 'function') initAudio();
                if (gameState === 'START' || gameState === 'HIGHSCORES') {
                    startGame();
                } else if (gameState === 'GAMEOVER') {
                    gameState = 'HIGHSCORES';
                }
            }
            prevGlobalGamepadState[idx] = isPressed;
        });
    }

    if (gameState !== 'PLAYING' && gameState !== 'FALLING' && gameState !== 'LEVEL_THREE') return;

    if (player.actionCooldown > 0) {
        player.actionCooldown--;
    }

    if (currentLevel === 1) {
        updateLevelOne();
        if (passengersRescued >= levelTwoThreshold) {
            initLevelTwo();
        }
    } else if (currentLevel === 2) {
        updateLevelTwo();
        // Changed threshold from score-based to requiring 50 total passengers rescued
        if (passengersRescued >= 50 && currentLevel === 2) {
            initLevelThree();
        }
    } else if (currentLevel === 3) {
        updateLevelThree();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.isSmoke) {
            pt.size += 0.3;
        }
        if (pt.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentLevel === 1 && gameState === 'PLAYING') {
        drawLevelOne(ctx);
    } else if (currentLevel === 2 && gameState === 'FALLING') {
        drawLevelTwo(ctx);
    } else if (currentLevel === 3 && gameState === 'LEVEL_THREE') {
        drawLevelThree(ctx);
    }

    for (let pt of particles) {
        if (pt.isSmoke) {
            ctx.save();
            ctx.fillStyle = `rgba(226, 232, 240, ${pt.life / 40})`;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            ctx.fillStyle = currentLevel === 2 ? "#facc15" : "#38bdf8";
            ctx.font = "bold 14px 'Segoe UI'";
            ctx.fillText(pt.text, pt.x, pt.y);
        }
    }

    if (currentLevel === 2 && gameState === 'FALLING') {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, 50);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 14px 'Segoe UI'";
        ctx.fillText("🌪️ LEVEL 2: FREEFALL RESCUE", 20, 30);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("SCORE: " + Math.floor(score), 260, 30);
        ctx.fillText("RESCUED: " + passengersRescued + "/50", 410, 30);

        ctx.fillStyle = "INTEGRITY:";
        ctx.fillText("INTEGRITY:", 620, 30);
        ctx.fillStyle = "#555555";
        ctx.fillRect(700, 16, 120, 18);
        ctx.fillStyle = planeIntegrity > 30 ? "#00ff66" : "#ff0000";
        ctx.fillRect(700, 16, (planeIntegrity / 100) * 120, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.floor(planeIntegrity) + "%", 740, 30);
    } else if (currentLevel === 1 && gameState === 'PLAYING') {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, 50);

        let emergency = getCurrentEmergency();
        ctx.fillStyle = emergency.color;
        ctx.font = "bold 14px 'Segoe UI'";
        ctx.fillText(emergency.name, 20, 30);

        ctx.fillStyle = "#ffffff";
        ctx.fillText("SCORE: " + Math.floor(score), 180, 30);
        ctx.fillText("RESCUED: " + passengersRescued, 310, 30);

        ctx.fillText("INTEGRITY:", 450, 30);
        ctx.fillStyle = "#555555";
        ctx.fillRect(530, 16, 130, 18);
        ctx.fillStyle = planeIntegrity > 30 ? "#00ff66" : "#ff0000";
        ctx.fillRect(530, 16, (planeIntegrity / 100) * 130, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(Math.floor(planeIntegrity) + "%", 575, 30);

        if (extinguisher.isCarried) {
            ctx.fillStyle = "#ff5500";
            ctx.fillText("EXT [SPACE: " + extinguisher.charges + "]", 680, 30);
        } else if (!extinguisher.onWall) {
            ctx.fillStyle = "#94a3b8";
            ctx.fillText("EXT (Respawning)", 680, 30);
        }

        ctx.fillStyle = "#00f3ff";
        ctx.fillText("[C] Wardrobe", 790, 30);
    } else if (currentLevel === 3 && gameState === 'LEVEL_THREE') {
        // Handled completely in level3.js draw function
    }

    if (gameState === 'START') {
        ctx.fillStyle = "rgba(10, 5, 5, 0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff3300";
        ctx.font = "bold 36px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("PANIC AT 30,000 FEET", canvas.width / 2, canvas.height / 2 - 40);

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px 'Segoe UI'";
        ctx.fillText("Guide passengers calmly and secure the cabin!", canvas.width / 2, canvas.height / 2 + 5);
        ctx.fillText("Press Any Key or Gamepad Button to Play", canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText("CHEATS: Press [1], [2], or [3] anytime to jump levels!", canvas.width / 2, canvas.height / 2 + 85);
        ctx.textAlign = "left";
    } else if (gameState === 'CUSTOMIZE') {
        ctx.fillStyle = "rgba(15, 15, 25, 0.95)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00f3ff";
        ctx.font = "bold 30px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("CHARACTER WARDROBE", canvas.width / 2, 100);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px 'Segoe UI'";
        ctx.fillText("[1] Change Shirt Color: " + player.shirtColor, canvas.width / 2, 200);
        ctx.fillText("[2] Change Hat Style: " + player.hatType, canvas.width / 2, 250);
        
        ctx.fillStyle = "#ffaa00";
        ctx.fillText("Press [ENTER] or [ESC] to Return", canvas.width / 2, 380);
        ctx.textAlign = "left";
    } else if (gameState === 'GAMEOVER') {
        ctx.fillStyle = "rgba(20, 0, 0, 0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 40px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("DISASTER OVERWHELMED!", canvas.width / 2, canvas.height / 2 - 40);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px 'Segoe UI'";
        ctx.fillText("Passengers Rescued: " + passengersRescued, canvas.width / 2, canvas.height / 2 + 5);
        ctx.fillText("Final Score: " + Math.floor(score), canvas.width / 2, canvas.height / 2 + 35);
        ctx.fillText("Press Any Key / Button to View High Scores", canvas.width / 2, canvas.height / 2 + 80);
        ctx.textAlign = "left";
    } else if (gameState === 'NAME_ENTRY') {
        ctx.fillStyle = "rgba(10, 10, 25, 0.95)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 32px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("NEW HIGH SCORE!", canvas.width / 2, 110);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px 'Segoe UI'";
        ctx.fillText("Score: " + Math.floor(score) + " | Rescued: " + passengersRescued, canvas.width / 2, 160);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "16px 'Segoe UI'";
        ctx.fillText("ENTER YOUR NAME:", canvas.width / 2, 220);

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(canvas.width / 2 - 120, 245, 240, 50);
        ctx.strokeStyle = "#00f3ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 120, 245, 240, 50);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px 'Segoe UI'";
        ctx.fillText(playerName + "_", canvas.width / 2, 280);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "14px 'Segoe UI'";
        ctx.fillText("Type Name & Press [ENTER] to Save", canvas.width / 2, 360);
        ctx.textAlign = "left";
    } else if (gameState === 'HIGHSCORES') {
        ctx.fillStyle = "rgba(10, 10, 20, 0.96)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 28px 'Segoe UI'";
        ctx.textAlign = "center";
        ctx.fillText("TOP 10 HIGH SCORES", canvas.width / 2, 55);

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 13px 'Segoe UI'";
        ctx.fillText("RANK     NAME     SCORE     RESCUED", canvas.width / 2, 90);

        for (let i = 0; i < highScores.length; i++) {
            let hs = highScores[i];
            let yPos = 120 + (i * 26);

            ctx.fillStyle = i === 0 ? "#facc15" : (i === 1 ? "#cbd5e1" : (i === 2 ? "#b45309" : "#ffffff"));
            ctx.font = "15px 'Segoe UI'";
            
            let rankStr = "#" + (i + 1);
            if (i < 9) rankStr = "  " + rankStr;
            
            let rowText = rankStr + "       " + hs.name.padEnd(8, ' ') + "   " + String(hs.score).padStart(6, '0') + "         " + hs.rescued;
            ctx.fillText(rowText, canvas.width / 2, yPos);
        }

        ctx.fillStyle = "#ffaa00";
        ctx.font = "15px 'Segoe UI'";
        ctx.fillText("Press Any Key or Button to Play Again", canvas.width / 2, 455);
        ctx.textAlign = "left";
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();