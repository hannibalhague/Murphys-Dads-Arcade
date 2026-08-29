// ==========================================
// LEVEL 3: SKYDIVE DEBRIS DODGE & SURVIVAL
// ==========================================

let debrisSpawnTimer = 0;
let splashBloodMarks = [];
let groundCraters = []; // Tracks ground indentation pits/craters from falling debris

function initLevelThree() {
    gameState = 'LEVEL_THREE';
    currentLevel = 3;
    passengers = [];
    particles = [];
    planeDebris = [];
    splashBloodMarks = [];
    groundCraters = [];
    debrisSpawnTimer = 0;
    
    // Position player on the sidewalk
    player.x = canvas.width / 2;
    player.y = canvas.height - 120;
    player.vx = 0;
    player.vy = 0;
    player.isJumping = false;
    player.jumpVy = 0;
    player.jumpCount = 0; // Tracks triple jumps (up to 3) with enhanced height/distance
    player.carrying = null;

    spawnDebrisPiece(true);
}

function spawnDebrisPiece(staggered = false) {
    let size = 35 + Math.random() * 45;
    let targetX = 60 + Math.random() * (canvas.width - 120);
    let startY = staggered ? -40 - Math.random() * 200 : -80;
    
    const types = ['wing', 'engine', 'fuselage', 'tail_fin', 'landing_gear'];
    let chosenType = types[Math.floor(Math.random() * types.length)];

    planeDebris.push({
        x: targetX,
        y: startY,
        targetX: targetX,
        size: size,
        vy: 2.0 + Math.random() * 2.5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        type: chosenType,
        hasBlood: false
    });
}

function updateLevelThree() {
    if (typeof updateInputs === 'function') {
        updateInputs();
    }

    // --- SIDEWALK RESTRICTIONS & ENHANCED TRIPLE JUMP PHYSICS ---
    let groundLevelY = canvas.height - 80;
    
    // Horizontal movement from inputs (boosted air momentum when triple jumping further)
    let targetVx = activeInputs.xDir * player.maxSpeed * (player.isJumping ? 1.35 : 1.0);
    if (activeInputs.shiftPressed) {
        targetVx *= 1.4;
    }
    player.vx += (targetVx - player.vx) * 0.2;
    player.x += player.vx;

    // Strict sidewalk boundaries
    if (player.x < 30) player.x = 30;
    if (player.x > canvas.width - 30) player.x = canvas.width - 30;

    // Triple Jump mechanics (Up, W, Space, or action trigger) - much higher and further jumps without flipping
    let jumpPressed = (activeInputs.yDir === -1 || activeInputs.spacePressed || activeInputs.actionTriggered);
    if (jumpPressed) {
        if (!player.isJumping) {
            // First jump from ground (higher and stronger)
            player.isJumping = true;
            player.jumpVy = -11.0; 
            player.jumpCount = 1;
            activeInputs.actionTriggered = false;
            playSound('throw');
        } else if (player.jumpCount < 3) {
            // Mid-air triple jump stages (2nd and 3rd jump) - soaring higher and further forward!
            player.jumpVy = -10.0;
            player.jumpCount++;
            activeInputs.actionTriggered = false;
            playSound('throw');

            particles.push({
                x: player.x,
                y: player.y - 10,
                vx: (Math.random() - 0.5) * 4,
                vy: -3,
                life: 30,
                text: player.jumpCount === 2 ? "🚀 HIGH DOUBLE JUMP!" : "🦅 MEGA TRIPLE JUMP!"
            });
        }
    }

    if (player.isJumping) {
        player.jumpVy += 0.42; // Lighter gravity for higher, floatier jumps
        player.y += player.jumpVy;

        // Land back down onto the sidewalk surface
        if (player.y >= groundLevelY - 42) {
            player.y = groundLevelY - 42;
            player.isJumping = false;
            player.jumpVy = 0;
            player.jumpCount = 0;
        }
    } else {
        player.y = groundLevelY - 42;
    }

    // --- HOLE & PIT COLLISION DETECTION ---
    // If player is on the ground, check if they fall into any jagged polygonal sidewalk pits
    if (!player.isJumping) {
        for (let crater of groundCraters) {
            let distToCraterCenter = Math.abs(player.x - crater.x);
            // If walking into the jagged polygon pit opening
            if (distToCraterCenter < crater.halfWidth * 0.75) {
                planeIntegrity -= 15;
                score = Math.max(0, score - 100);
                playSound('throw');

                particles.push({
                    x: player.x,
                    y: player.y - 20,
                    vx: 0,
                    vy: -2,
                    life: 50,
                    text: "🕳️ FELL IN SIDEWALK PIT! -15% Integrity!"
                });

                player.x += (player.x > crater.x) ? 30 : -30;

                if (planeIntegrity <= 0) {
                    planeIntegrity = 0;
                    gameState = 'GAMEOVER';
                }
                break;
            }
        }
    }

    // Spawn timer interval (few holes / sparse debris)
    debrisSpawnTimer++;
    if (debrisSpawnTimer > 220) {
        debrisSpawnTimer = 0;
        if (planeDebris.length < 1) {
            spawnDebrisPiece(false);
        }
    }

    // Update falling plane pieces and generate actual background sidewalk alterations (jagged pits)
    for (let i = planeDebris.length - 1; i >= 0; i--) {
        let piece = planeDebris[i];
        piece.y += piece.vy;
        piece.rot += piece.vRot;

        if (piece.y >= groundLevelY) {
            // Carve an actual permanent jagged pit into the sidewalk geometry!
            let pitWidth = piece.size * 0.85;
            let pitDepth = 18 + piece.size * 0.3;
            
            let jaggedPoints = [];
            let steps = 6;
            for (let s = 0; s <= steps; s++) {
                let px = (piece.targetX - pitWidth/2) + (pitWidth / steps) * s;
                let pyOffset = (s === 0 || s === steps) ? 0 : (Math.sin(s * 17.5) * 8 + Math.random() * 6);
                jaggedPoints.push({ x: px, y: pyOffset });
            }

            groundCraters.push({
                x: piece.targetX,
                halfWidth: pitWidth / 2,
                depth: pitDepth,
                points: jaggedPoints
            });

            // Check if player is standing in the impact zone and NOT jumping over it
            let distanceToImpact = Math.abs(player.x - piece.targetX);
            
            if (distanceToImpact < pitWidth * 0.5 && !player.isJumping) {
                planeIntegrity -= 25;
                score = Math.max(0, score - 200);
                playSound('throw'); 
                
                piece.hasBlood = true;

                splashBloodMarks.push({
                    x: piece.targetX + (Math.random() - 0.5) * 24,
                    y: groundLevelY + (Math.random() - 0.5) * 6,
                    radius: 12 + Math.random() * 10
                });
                
                particles.push({
                    x: player.x,
                    y: player.y - 20,
                    vx: 0,
                    vy: -2,
                    life: 60,
                    text: "💥 CRUSHED! -25% Integrity!"
                });

                if (planeIntegrity <= 0) {
                    planeIntegrity = 0;
                    gameState = 'GAMEOVER';
                }
            }

            planeDebris.splice(i, 1);
            spawnDebrisPiece(false);
        }
    }

    if (Math.random() < 0.1) {
        score += 5;
    }
}

function drawLevelThree(ctx) {
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#09090b");
    skyGradient.addColorStop(0.5, "#1e1b4b");
    skyGradient.addColorStop(1, "#311033");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let groundLevelY = canvas.height - 80;

    // ==========================================
    // BIG CITY BACKGROUND BACKDROP
    // ==========================================
    ctx.save();
    ctx.fillStyle = "#111827";
    let farBuildingWidth = 50;
    let farTotalBuildings = Math.ceil(canvas.width / farBuildingWidth) + 1;
    for (let i = 0; i < farTotalBuildings; i++) {
        let bx = i * (farBuildingWidth + 10) - 20;
        let bHeight = 180 + Math.sin(i * 123.45) * 60;
        ctx.fillRect(bx, groundLevelY - bHeight, farBuildingWidth, bHeight);
    }

    ctx.fillStyle = "#1f2937";
    let buildingWidth = 70;
    let totalBuildings = Math.ceil(canvas.width / buildingWidth) + 2;
    for (let i = 0; i < totalBuildings; i++) {
        let bx = i * buildingWidth - 10;
        let bHeight = 240 + Math.cos(i * 67.89) * 80;
        
        ctx.fillRect(bx, groundLevelY - bHeight, buildingWidth - 5, bHeight);

        ctx.fillStyle = "#facc15";
        let windowCols = 3;
        let windowRows = Math.floor(bHeight / 25);
        for (let r = 2; r < windowRows - 1; r++) {
            for (let c = 0; c < windowCols; c++) {
                if ((i + r + c) % 5 !== 0) {
                    let wx = bx + 10 + c * 16;
                    let wy = groundLevelY - bHeight + r * 22;
                    ctx.fillRect(wx, wy, 8, 12);
                }
            }
        }
        ctx.fillStyle = "#1f2937";
    }
    ctx.restore();

    // ==========================================
    // CONCRETE SIDEWALK WITH PERMANENT JAGGED PITS
    // ==========================================
    ctx.save();
    
    // Draw base sidewalk background surface
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, groundLevelY, canvas.width, canvas.height - groundLevelY);

    // Carve out actual jagged pits from the sidewalk geometry
    for (let crater of groundCraters) {
        ctx.save();
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.moveTo(crater.points[0].x, groundLevelY);
        for (let pt of crater.points) {
            ctx.lineTo(pt.x, groundLevelY + crater.depth + pt.y);
        }
        ctx.lineTo(crater.points[crater.points.length - 1].x, groundLevelY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.fillRect(crater.x - 10, groundLevelY + crater.depth - 6, 8, 6);
        ctx.fillRect(crater.x + 4, groundLevelY + crater.depth - 8, 10, 8);
        ctx.restore();
    }

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundLevelY);
    ctx.lineTo(canvas.width, groundLevelY);
    ctx.stroke();

    ctx.lineWidth = 2;
    for (let xPos = 0; xPos < canvas.width; xPos += 80) {
        let insidePit = false;
        for (let crater of groundCraters) {
            if (xPos > crater.x - crater.halfWidth && xPos < crater.x + crater.halfWidth) {
                insidePit = true;
                break;
            }
        }
        if (!insidePit) {
            ctx.beginPath();
            ctx.moveTo(xPos, groundLevelY);
            ctx.lineTo(xPos, canvas.height);
            ctx.stroke();
        }
    }

    ctx.fillStyle = "#334155";
    ctx.fillRect(0, groundLevelY, canvas.width, 10);

    ctx.restore();

    // Draw ground shadow warning markers for incoming debris
    for (let piece of planeDebris) {
        let warningScale = Math.max(0, Math.min(1.0, piece.y / groundLevelY));
        let shadowWidth = Math.max(1, (piece.size * 0.75) * warningScale);
        let shadowHeight = Math.max(1, shadowWidth * 0.28);

        ctx.fillStyle = `rgba(0, 0, 0, ${0.4 + warningScale * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(piece.targetX, groundLevelY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        if (piece.y > groundLevelY - 280) {
            ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(piece.targetX, groundLevelY, shadowWidth * 0.75, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    for (let blood of splashBloodMarks) {
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.arc(blood.x, blood.y, blood.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#450a0a";
        ctx.beginPath();
        ctx.arc(blood.x - 2, blood.y - 1, blood.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let piece of planeDebris) {
        ctx.save();
        ctx.translate(piece.targetX, piece.y);
        ctx.rotate(piece.rot);

        const s = piece.size;

        if (piece.type === 'wing') {
            ctx.fillStyle = "#64748b";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-s / 2, -s / 4);
            ctx.lineTo(s / 2, -s / 6);
            ctx.lineTo(s / 3, s / 3);
            ctx.lineTo(-s / 2, s / 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = (Date.now() % 350 < 175) ? "#ef4444" : "#991b1b";
            ctx.beginPath();
            ctx.arc(-s / 2 + 6, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();

        } else if (piece.type === 'engine') {
            ctx.fillStyle = "#475569";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-s / 2, -s / 3, s, s / 1.5, [8]);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(0, 0, s / 3.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#eab308";
            ctx.fillRect(-4, -s / 3 + 2, 8, s / 1.5 - 4);

        } else if (piece.type === 'tail_fin') {
            ctx.fillStyle = "#cbd5e1";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-s / 3, s / 2);
            ctx.lineTo(s / 4, -s / 2);
            ctx.lineTo(s / 3, -s / 2);
            ctx.lineTo(s / 3, s / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#2563eb";
            ctx.fillRect(-s / 6, -s / 4, s / 3, s / 2);

        } else if (piece.type === 'landing_gear') {
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, -s / 2);
            ctx.lineTo(0, s / 4);
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(0, s / 4, s / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 2;
            ctx.stroke();

        } else {
            ctx.fillStyle = "#94a3b8";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.5;
            ctx.fillRect(-s / 2.5, -s / 2, s / 1.25, s);
            ctx.strokeRect(-s / 2.5, -s / 2, s / 1.25, s);

            ctx.fillStyle = "#0284c7";
            ctx.fillRect(-s / 6, -s / 3, s / 3, s / 5);
            ctx.fillRect(-s / 6, 2, s / 3, s / 5);

            ctx.fillStyle = "#334155";
            ctx.fillRect(-s / 2.5 + 3, -s / 2 + 3, 3, 3);
            ctx.fillRect(s / 2.5 - 6, -s / 2 + 3, 3, 3);
            ctx.fillRect(-s / 2.5 + 3, s / 2 - 6, 3, 3);
            ctx.fillRect(s / 2.5 - 6, s / 2 - 6, 3, 3);
        }

        if (piece.hasBlood) {
            ctx.fillStyle = "#dc2626";
            ctx.beginPath();
            ctx.arc(4, -4, 8, 0, Math.PI * 2);
            ctx.arc(-5, 5, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#7f1d1d";
            ctx.beginPath();
            ctx.arc(2, -2, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Draw player upright (no flipping), with high/far triple jump action
    drawPlayer(ctx, drawPassenger);

    // Draw HUD for Level 3
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, canvas.width, 50);

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 14px 'Segoe UI'";
    ctx.fillText("⚠️ LEVEL 3: HIGH & FAR TRIPLE JUMP (SPACE / UP)", 20, 30);

    ctx.fillStyle = "#ffffff";
    ctx.fillText("SCORE: " + Math.floor(score), 340, 30);

    ctx.fillText("INTEGRITY:", 500, 30);
    ctx.fillStyle = "#555555";
    ctx.fillRect(580, 16, 130, 18);
    ctx.fillStyle = planeIntegrity > 30 ? "#00ff66" : "#ff0000";
    ctx.fillRect(580, 16, (planeIntegrity / 100) * 130, 18);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(Math.floor(planeIntegrity) + "%", 625, 30);
}