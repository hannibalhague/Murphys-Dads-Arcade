// --- PLAYER FILE (With Bendable Human Limbs) ---
const player = {
    x: 400,
    y: 250,
    width: 28,
    height: 42,
    vx: 0,
    vy: 0,
    speed: 2.2,
    maxSpeed: 2.5,
    carrying: null,
    shirtColor: "#1e293b", // Navy blue captain shirt
    hatType: "PilotCap"
};

function updatePlayer() {
    if (gameState === 'FALLING') {
        // Skydiving freefall physics
        let targetVx = activeInputs.xDir * 4.5;
        let targetVy = activeInputs.yDir * 3.5;

        if (activeInputs.shiftPressed) {
            targetVx *= 1.4;
            targetVy *= 1.4;
        }

        player.vx += (targetVx - player.vx) * 0.2;
        player.vy += (targetVy - player.vy) * 0.2;

        player.x += player.vx;
        player.y += player.vy;

        // Screen boundaries for skydiving level
        if (player.x < 30) player.x = 30;
        if (player.x > canvas.width - 50) player.x = canvas.width - 50;
        if (player.y < 40) player.y = 40;
        if (player.y > canvas.height - 60) player.y = canvas.height - 60;
        return;
    }

    let targetVx = activeInputs.xDir * player.maxSpeed;
    let targetVy = activeInputs.yDir * player.maxSpeed;

    if (activeInputs.shiftPressed) {
        targetVx *= 1.4;
        targetVy *= 1.4;
    }

    player.vx += (targetVx - player.vx) * 0.2;
    player.vy += (targetVy - player.vy) * 0.2;

    player.x += player.vx;
    player.y += player.vy;

    // Cabin boundary restrictions
    if (player.x < 100) player.x = 100;
    if (player.x > 810) player.x = 810;
    if (player.y < 70) player.y = 70;
    if (player.y > 400) player.y = 400;

    // --- CHECK IF CARRIED NPC TOUCHES FIRE ---
    if (player.carrying && typeof cabinFires !== 'undefined') {
        for (let f of cabinFires) {
            if (f.intensity > 0) {
                let dist = Math.hypot(player.x - f.x, player.y - f.y);
                if (dist < f.size + 10) {
                    if (!player.carrying.isBurning) {
                        player.carrying.isBurning = true;
                        player.carrying.burnDuration = 0; 
                        playSound('extinguish'); 
                        particles.push({
                            x: player.x,
                            y: player.y - 25,
                            vx: 0,
                            vy: -1.5,
                            life: 45,
                            text: "🔥 HEAD ON FIRE!"
                        });
                    }
                }
            }
        }
    }
}

// Helper function to render a bendable 2-segment human limb (Arm or Leg)
function drawHumanLimb(ctx, x1, y1, x2, y2, bendDir = 1, thickness = 4, color = "#ffdbac") {
    let midX = (x1 + x2) / 2 + (bendDir * 6);
    let midY = (y1 + y2) / 2 + 4;

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();
}

function drawPlayer(ctx, drawPassengerFunc) {
    let px = player.x;
    let py = player.y;

    // Shadow underneath player
    ctx.fillStyle = gameState === 'FALLING' ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.arc(px + 14, py + 42, 10, 0, Math.PI * 2);
    ctx.fill();

    // Calculate movement cycle for smooth walking limb bends
    let isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1;
    let walkCycle = isMoving ? performance.now() * 0.015 : 0;
    let leftLegOffset = Math.sin(walkCycle) * 8;
    let rightLegOffset = Math.cos(walkCycle) * 8;

    // --- BENDABLE LEGS ---
    let hipLeftX = px + 8, hipY = py + 28;
    let hipRightX = px + 20;
    
    // Left Leg (Thigh to Knee to Foot)
    drawHumanLimb(ctx, hipLeftX, hipY, hipLeftX + leftLegOffset, py + 40, -1, 5, "#0f172a");
    // Right Leg
    drawHumanLimb(ctx, hipRightX, hipY, hipRightX + rightLegOffset, py + 40, 1, 5, "#0f172a");

    // Shoes
    ctx.fillStyle = "#111111";
    ctx.fillRect(hipLeftX + leftLegOffset - 3, py + 38, 6, 4);
    ctx.fillRect(hipRightX + rightLegOffset - 3, py + 38, 6, 4);

    // Shirt / Uniform Body (Navy Blue) with Long Sleeves
    ctx.fillStyle = player.shirtColor;
    ctx.fillRect(px + 5, py + 14, 18, 14);
    
    // Left & Right Shirt Sleeves (Navy Blue matching uniform)
    ctx.fillRect(px + 2, py + 14, 4, 10);
    ctx.fillRect(px + 22, py + 14, 4, 10);

    // Captain Gold Epaulets / Stripe Detail
    ctx.fillStyle = "#eab308";
    ctx.fillRect(px + 5, py + 15, 4, 2);
    ctx.fillRect(px + 19, py + 15, 4, 2);

    // Gold Buttons Down the Uniform Front
    ctx.fillStyle = "#eab308";
    ctx.fillRect(px + 13, py + 17, 2, 2);
    ctx.fillRect(px + 13, py + 21, 2, 2);
    ctx.fillRect(px + 13, py + 25, 2, 2);

    // --- BENDABLE ARMS & HOLDING RENDERING ---
    let shoulderLeftX = px + 4, shoulderY = py + 16;
    let shoulderRightX = px + 24;

    if (player.carrying) {
        // Holding passenger securely with curved arms wrapping around
        drawHumanLimb(ctx, shoulderLeftX, shoulderY, px + 2, py + 22, -1, 4, "#ffdbac");
        drawHumanLimb(ctx, shoulderRightX, shoulderY, px + 22, py + 22, 1, 4, "#ffdbac");
    } else if (gameState === 'FALLING') {
        // Falling mode: Arms pointing straight up into the air with a wiggling motion
        let armWiggle = Math.sin(performance.now() * 0.025) * 4;
        drawHumanLimb(ctx, shoulderLeftX, shoulderY, px + 6 + armWiggle, py - 6, -1, 4, "#ffdbac");
        drawHumanLimb(ctx, shoulderRightX, shoulderY, px + 22 - armWiggle, py - 6, 1, 4, "#ffdbac");
    } else {
        let armSwing = Math.sin(walkCycle) * 6;
        // Normal walking or holding extinguisher arms
        drawHumanLimb(ctx, shoulderLeftX, shoulderY, shoulderLeftX - 4 + armSwing, py + 26, -1, 4, "#ffdbac");
        
        let holdingExtinguisher = true; 
        if (holdingExtinguisher) {
            drawHumanLimb(ctx, shoulderRightX, shoulderY, shoulderRightX + 4, py + 26, 1, 4, "#ffdbac");
            
            // Extinguisher object
            ctx.fillStyle = "#dc2626"; 
            ctx.fillRect(px + 23, py + 14, 6, 12);
            ctx.fillStyle = "#ffffff"; 
            ctx.fillRect(px + 24, py + 17, 4, 3);
            ctx.fillStyle = "#334155"; 
            ctx.fillRect(px + 24, py + 12, 4, 2);
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 23, py + 14, 6, 12);
        } else {
            drawHumanLimb(ctx, shoulderRightX, shoulderY, shoulderRightX + 4 - armSwing, py + 26, 1, 4, "#ffdbac");
        }
    }

    // Head
    ctx.fillStyle = "#ffdbac";
    ctx.beginPath();
    ctx.arc(px + 14, py + 11, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#000000";
    ctx.fillRect(px + 11, py + 9, 2, 2);
    ctx.fillRect(px + 15, py + 9, 2, 2);

    // Nose
    ctx.fillStyle = "#e0ac69";
    ctx.fillRect(px + 13, py + 11, 2, 2);

    // Mouth (Wacky open mouth expression when falling)
    if (gameState === 'FALLING') {
        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(px + 12, py + 13, 4, 3);
    } else {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px + 14, py + 12, 3, 0, Math.PI, false);
        ctx.stroke();
    }

    // Pilot Hat & Gold Badge
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(px + 6, py + 3, 16, 5);
    
    if (activeInputs.facingDir === 'left') {
        ctx.fillRect(px + 2, py + 6, 6, 2);
    } else {
        ctx.fillRect(px + 20, py + 6, 6, 2);
    }
    
    ctx.fillStyle = "#eab308";
    ctx.fillRect(px + 12, py + 4, 4, 3);

    if (player.carrying) {
        drawPassengerFunc(ctx, player.carrying, true);
    }
}