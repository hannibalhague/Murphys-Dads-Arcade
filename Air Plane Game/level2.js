// ============================================================================
// LEVEL 2: FREEFALL RESCUE & SKY TURBULENCE
// ============================================================================

let levelTwoSpawnTimer = 0;
let levelTwoWindLines = [];
let collectedPassengers = [];
let levelTwoSmashing = false;
let smashTimer = 0;

// Initialize turbulence wind streaks for high-speed falling illusion
for (let i = 0; i < 25; i++) {
    levelTwoWindLines.push({
        x: Math.random() * 900,
        y: Math.random() * 500,
        length: 20 + Math.random() * 40,
        speed: 12 + Math.random() * 15,
        alpha: 0.15 + Math.random() * 0.35
    });
}

function initLevelTwo() {
    gameState = 'FALLING';
    currentLevel = 2;
    passengers = [];
    particles = [];
    planeDebris = [];
    collectedPassengers = [];
    levelTwoSpawnTimer = 0;
    levelTwoSmashing = false;
    smashTimer = 0;
    
    player.x = canvas.width / 2;
    player.y = 220;
    player.vx = 0;
    player.vy = 0;
    player.carrying = null;
    
    // Spawn only 2 items initially to keep it sparse
    for (let i = 0; i < 2; i++) {
        spawnLevelTwoItem(true);
    }
}

function spawnLevelTwoItem(initialSpread = false) {
    const isPassenger = Math.random() > 0.40;
    const spawnY = initialSpread ? Math.random() * (canvas.height - 100) : -80 - Math.random() * 100;
    const spawnX = 60 + Math.random() * (canvas.width - 120);

    if (isPassenger) {
        const skinTones = ["#fcd34d", "#f87171", "#fbbf24", "#d97706", "#a16207", "#78350f"];
        const hairColors = ["#1e293b", "#78350f", "#b45309", "#b91c1c", "#475569", "#6d28d9", "#047857"];
        const shirtColors = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0284c7", "#db2777", "#4f46e5"];
        const hatTypes = ["none", "cap", "pilot", "beanie", "headphones"];
        const npcTypes = ["normal", "normal", "normal", "heavy", "baby", "wheel", "animal"];

        let template = {
            name: "Passenger",
            type: npcTypes[Math.floor(Math.random() * npcTypes.length)],
            color: shirtColors[Math.floor(Math.random() * shirtColors.length)],
            skin: skinTones[Math.floor(Math.random() * skinTones.length)],
            hair: hairColors[Math.floor(Math.random() * hairColors.length)],
            hat: hatTypes[Math.floor(Math.random() * hatTypes.length)]
        };

        const screams = [
            "MY MILES!", "I NEVER GOT MY PEANUTS!", "MY LUGGAGE!", 
            "WHEEEEEE!", "NOT MY COFFEE!", "5-STAR FLIGHT GONE WRONG!",
            "I FORGOT TO CANCEL MY SUBSCRIPTION!", "TELL MY DOG I LOVE HIM!"
        ];

        planeDebris.push({
            type: 'passenger',
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 0.8 + Math.random() * 1.2,
            rot: (Math.random() - 0.5) * 0.4,
            vRot: (Math.random() - 0.5) * 0.025,
            width: 28,
            height: 42,
            template: template,
            scream: screams[Math.floor(Math.random() * screams.length)],
            screamTimer: Math.floor(Math.random() * 180),
            flailOffset: Math.random() * Math.PI * 2
        });
    } else {
        const debrisTypes = ['engine', 'wing_chunk', 'fuselage_window', 'luggage', 'drink_cart'];
        const debrisType = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];

        let debrisSize = 35 + Math.random() * 25;
        if (debrisType === 'luggage') debrisSize = 22 + Math.random() * 10;
        if (debrisType === 'drink_cart') debrisSize = 26;

        planeDebris.push({
            type: 'debris',
            debrisSubtype: debrisType,
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 1.8,
            vy: 1.0 + Math.random() * 1.4,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.06,
            size: debrisSize,
            color: debrisType === 'luggage' ? ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)] : '#64748b',
            hasBlood: false
        });
    }
}

function updateLevelTwo() {
    if (levelTwoSmashing) {
        smashTimer++;
        player.y += 15; // plummet down quickly to the smash ground
        if (smashTimer > 60) {
            // Reset after smash burst
            levelTwoSmashing = false;
            smashTimer = 0;
            collectedPassengers = [];
            player.y = 220;
        }
        return;
    }

    if (typeof updateInputs === 'function') {
        updateInputs();
    }
    updatePlayer();

    levelTwoSpawnTimer++;
    if (levelTwoSpawnTimer > 110) {
        levelTwoSpawnTimer = 0;
        if (planeDebris.length < 3) {
            spawnLevelTwoItem(false);
        }
    }

    for (let line of levelTwoWindLines) {
        line.y -= line.speed;
        if (line.y < -50) {
            line.y = canvas.height + 20;
            line.x = Math.random() * canvas.width;
        }
    }

    for (let i = planeDebris.length - 1; i >= 0; i--) {
        let item = planeDebris[i];
        item.y += item.vy;
        item.x += item.vx;
        item.rot += item.vRot;

        if (item.y > canvas.height + 80) {
            planeDebris.splice(i, 1);
            spawnLevelTwoItem(false);
            continue;
        }

        let dist = Math.hypot(player.x - item.x, player.y - item.y);
        let hitRadius = item.type === 'passenger' ? 38 : (item.size ? item.size * 0.65 : 30);

        if (dist < hitRadius) {
            if (item.type === 'passenger') {
                score += 300;
                passengersRescued = collectedPassengers.length + 1;

                if (typeof playSound === 'function') playSound('grab');

                // Add to swirling collected passengers orbit array
                collectedPassengers.push(item.template);

                particles.push({
                    x: item.x,
                    y: item.y,
                    vx: 0,
                    vy: -1.5,
                    life: 60,
                    text: `+50 Collected! (${collectedPassengers.length}/50)`
                });

                planeDebris.splice(i, 1);
                spawnLevelTwoItem(false);

                // Check if target of 50 collected passengers is reached
                if (collectedPassengers.length >= 50) {
                    levelTwoSmashing = true;
                    smashTimer = 0;
                    if (typeof playSound === 'function') playSound('explosion');
                    particles.push({
                        x: player.x,
                        y: player.y,
                        vx: 0,
                        vy: -2,
                        life: 90,
                        text: "MEGA HUMAN BALL SMASH!"
                    });
                }

            } else {
                // Plane Debris Bonk! Triggers exact target spin of 3 full rotations, AND makes half of the carried NPCs fall off
                if (typeof playSound === 'function') playSound('throw');

                if (typeof player.spinAngle === 'undefined') player.spinAngle = 0;
                player.spinTarget = (player.spinTarget || 0) + Math.PI * 6; 
                player.vx += (Math.random() - 0.5) * 3;
                player.vy += (Math.random() - 0.5) * 2;

                item.hasBlood = true;
                item.vRot += 0.08;

                // Lose half of the collected passengers when hit by debris
                let dropCount = Math.floor(collectedPassengers.length / 2);
                if (dropCount > 0) {
                    collectedPassengers.splice(0, dropCount);
                    passengersRescued = collectedPassengers.length;
                }

                particles.push({
                    x: player.x,
                    y: player.y - 20,
                    vx: 0,
                    vy: -2,
                    life: 50,
                    text: `DEBRIS BONK! Lost half (${dropCount}) passengers!`
                });
            }
        }
    }
}

function drawLevelTwo(ctx) {
    let skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#0369a1");
    skyGradient.addColorStop(0.4, "#0284c7");
    skyGradient.addColorStop(0.8, "#38bdf8");
    skyGradient.addColorStop(1, "#bae6fd");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (typeof skyClouds !== 'undefined' && Array.isArray(skyClouds)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        for (let c of skyClouds) {
            let streamY = (c.y - Date.now() * 0.12 * c.speed) % canvas.height;
            if (streamY < 0) streamY += canvas.height;
            ctx.beginPath();
            ctx.ellipse(c.x, streamY, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.lineWidth = 1.5;
    for (let line of levelTwoWindLines) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${line.alpha})`;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + line.length);
        ctx.stroke();
    }

    // If smashing into ground as a giant human ball
    if (levelTwoSmashing) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 55 + Math.sin(Date.now() * 0.05) * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw burst body parts / pieces flying everywhere if near ground impact
        if (smashTimer > 40) {
            for (let k = 0; k < 35; k++) {
                let angle = (k / 35) * Math.PI * 2;
                let dist = (smashTimer - 40) * 14;
                ctx.fillStyle = k % 2 === 0 ? "#2563eb" : "#fcd34d";
                ctx.fillRect(Math.cos(angle) * dist, Math.sin(angle) * dist, 8, 8);
            }
        }
        ctx.restore();
        return;
    }

    for (let item of planeDebris) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rot);

        if (item.type === 'passenger') {
            drawDetailedFreefallNPC(ctx, item);
        } else {
            drawDetailedPlaneDebris(ctx, item);
        }

        ctx.restore();
    }

    // Draw the Player with Orbiting Swirled Collected Passengers
    ctx.save();
    ctx.translate(player.x, player.y);
    
    if (typeof player.spinTarget === 'undefined') player.spinTarget = 0;
    if (typeof player.spinAngle === 'undefined') player.spinAngle = 0;

    if (player.spinAngle < player.spinTarget) {
        let diff = player.spinTarget - player.spinAngle;
        let step = diff * 0.15;
        if (step < 0.005) step = diff;
        player.spinAngle += step;
    } else {
        player.spinAngle = player.spinTarget;
    }

    ctx.rotate(player.spinAngle);
    ctx.translate(-player.x, -player.y);

    if (typeof drawPlayer === 'function') {
        drawPlayer(ctx, typeof drawPassenger === 'function' ? drawPassenger : null);
    }
    ctx.restore();

    // Render Swirling Collected Passengers Orbiting Around Player (Upgraded with full mini-NPC rendering and rotation)
    let orbitTime = Date.now() * 0.008;
    for (let idx = 0; idx < collectedPassengers.length; idx++) {
        let angle = orbitTime + (idx / collectedPassengers.length) * Math.PI * 2;
        let orbitRadius = 45 + (idx % 4) * 7;
        let cx = player.x + Math.cos(angle) * orbitRadius;
        let cy = player.y + Math.sin(angle) * orbitRadius;

        ctx.save();
        ctx.translate(cx, cy);
        // Rotate each passenger so they face upright or tumble nicely along their orbit
        ctx.rotate(angle + Math.PI / 2);
        ctx.scale(0.65, 0.65); // Scale down nicely to fit the orbit cluster
        drawDetailedFreefallNPC(ctx, { template: collectedPassengers[idx], flailOffset: idx });
        ctx.restore();
    }

    // ========================================================================
    // SMALLER PROMINENT HUD DISPLAY MOVED LOWER ON SCREEN
    // ========================================================================
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 90, 75, 180, 36, [8]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`COLLECTED: ${collectedPassengers.length} / 50`, canvas.width / 2, 93);
    ctx.restore();
}

// ============================================================================
// DETAILED FREEFALL NPC RENDERER (WITH ACCURATE ANATOMICAL ANIMALS)
// ============================================================================
function drawDetailedFreefallNPC(ctx, p) {
    let t = p.template || {
        name: "Passenger",
        type: "normal",
        color: "#2563eb",
        skin: "#fcd34d",
        hair: "#78350f",
        hat: "none"
    };

    let animTime = Date.now() * 0.015 + p.flailOffset;
    let limbWobble = Math.sin(animTime) * 6;

    if (t.type === 'wheel') {
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 8, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(-12, -4, 24, 6);
    }

    if (t.type === 'animal') {
        let isCat = t.petType === 'cat';
        let fur = t.furColor || "#f59e0b";
        let accent = t.accentColor || "#b45309";
        let tailWag = Math.sin(animTime * 1.5) * 8;

        ctx.save();
        
        // Detailed Animal Rendering (Dog/Cat Anatomy)
        if (isCat) {
            // CAT: Sleek body, pointy ears, curved tail
            ctx.fillStyle = fur;
            // Body
            ctx.beginPath();
            ctx.ellipse(0, 2, 14, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.arc(11, -5, 7, 0, Math.PI * 2);
            ctx.fill();

            // Pointy Cat Ears
            ctx.beginPath();
            ctx.moveTo(7, -9);
            ctx.lineTo(9, -15);
            ctx.lineTo(12, -10);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(11, -10);
            ctx.lineTo(14, -15);
            ctx.lineTo(16, -9);
            ctx.fill();

            // Curved Tail
            ctx.strokeStyle = fur;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(-12, 2);
            ctx.quadraticCurveTo(-18, -6 + tailWag, -14, -12);
            ctx.stroke();

            // Eyes & Whiskers
            ctx.fillStyle = "#000000";
            ctx.fillRect(9, -7, 2, 2);
            ctx.fillRect(13, -7, 2, 2);

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(15, -4); ctx.lineTo(19, -5);
            ctx.moveTo(15, -3); ctx.lineTo(19, -3);
            ctx.stroke();
        } else {
            // DOG: Friendly rounded snout, floppy/perky ears, wagging tail
            ctx.fillStyle = fur;
            // Body
            ctx.beginPath();
            ctx.ellipse(0, 3, 15, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.arc(12, -4, 8, 0, Math.PI * 2);
            ctx.fill();

            // Floppy Dog Ears
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.ellipse(8, -5, 3, 6, 0.4, 0, Math.PI * 2);
            ctx.ellipse(16, -5, 3, 6, -0.4, 0, Math.PI * 2);
            ctx.fill();

            // Wagging Tail
            ctx.strokeStyle = fur;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(-13, 3);
            ctx.quadraticCurveTo(-20 + tailWag, 0, -22, -6);
            ctx.stroke();

            // Snout & Eyes
            ctx.fillStyle = fur;
            ctx.beginPath();
            ctx.arc(16, -2, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#000000";
            ctx.fillRect(10, -6, 2, 2);
            ctx.fillRect(14, -6, 2, 2);
            ctx.fillRect(16, -3, 2, 2); // Nose
        }

        // Flailing paws in freefall
        ctx.fillStyle = fur;
        ctx.fillRect(-8 + limbWobble, 10, 4, 8);
        ctx.fillRect(-2 - limbWobble, 10, 4, 8);
        ctx.fillRect(4 + limbWobble, 10, 4, 8);
        ctx.fillRect(10 - limbWobble, 10, 4, 8);

        ctx.restore();
        return;
    }

    if (t.type === 'baby') {
        ctx.fillStyle = t.color || "#f472b6";
        ctx.beginPath();
        ctx.arc(0, 4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = t.skin || "#fcd34d";
        ctx.beginPath();
        ctx.arc(0, -8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(0, -6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = t.skin || "#fcd34d";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, -4); ctx.lineTo(-12, -10 + limbWobble);
        ctx.moveTo(6, -4); ctx.lineTo(12, -10 - limbWobble);
        ctx.stroke();
        return;
    }

    let bodyW = t.type === 'heavy' ? 24 : 18;
    let bodyH = t.type === 'heavy' ? 24 : 20;

    ctx.fillStyle = t.color || "#2563eb";
    ctx.fillRect(-bodyW / 2, -4, bodyW, bodyH);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-bodyW / 2, -4, bodyW, bodyH);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-bodyW / 2 + 2, 14, 5, 12 + limbWobble);
    ctx.fillRect(bodyW / 2 - 7, 14, 5, 12 - limbWobble);

    ctx.strokeStyle = t.skin || "#fcd34d";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2, 0); ctx.lineTo(-bodyW / 2 - 10, -14 + limbWobble);
    ctx.moveTo(bodyW / 2, 0); ctx.lineTo(bodyW / 2 + 10, -14 - limbWobble);
    ctx.stroke();

    ctx.fillStyle = t.skin || "#fcd34d";
    ctx.beginPath();
    ctx.arc(0, -12, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(0, -9, 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-4, -16, 3, 3);
    ctx.fillRect(1, -16, 3, 3);

    if (t.hat === 'cap' || t.hat === 'pilot') {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(-9, -20, 18, 5);
        ctx.fillRect(-12, -17, 8, 2);
    } else if (t.hat === 'beanie') {
        ctx.fillStyle = "#b91c1c";
        ctx.beginPath();
        ctx.arc(0, -15, 8, Math.PI, 0, false);
        ctx.fill();
        ctx.fillRect(-2, -24, 4, 4);
    } else if (t.hat === 'headphones') {
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -12, 11, Math.PI, 0, false);
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-13, -15, 4, 8);
        ctx.fillRect(9, -15, 4, 8);
    } else if (t.hair) {
        ctx.fillStyle = t.hair;
        ctx.beginPath();
        ctx.arc(0, -15, 8, Math.PI, 0, false);
        ctx.fill();
    }

    p.screamTimer = (p.screamTimer || 0) + 1;
    if ((p.screamTimer % 200) < 110 && p.scream) {
        ctx.save();
        ctx.rotate(-itemRotationSafety(p.rot));
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(14, -38, 120, 22, [6]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 9px 'Segoe UI'";
        ctx.fillText(p.scream, 20, -24);
        ctx.restore();
    }
}

function itemRotationSafety(rot) {
    return typeof rot === 'number' ? rot : 0;
}

// ============================================================================
// DETAILED PLANE DEBRIS RENDERER
// ============================================================================
function drawDetailedPlaneDebris(ctx, debris) {
    const s = debris.size || 35;

    switch (debris.debrisSubtype) {
        case 'engine':
            ctx.fillStyle = "#475569";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-s / 2, -s / 3, s, s / 1.5, [6]);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(-s / 4, 0, s / 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#facc15";
            ctx.fillRect(0, -s / 3 + 2, 8, s / 1.5 - 4);
            ctx.break;

        case 'fuselage_window':
            ctx.fillStyle = "#e2e8f0";
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 2.5;
            ctx.fillRect(-s / 2, -s / 2, s, s);
            ctx.strokeRect(-s / 2, -s / 2, s, s);

            ctx.fillStyle = "#2563eb";
            ctx.fillRect(-s / 2, -4, s, 8);

            ctx.fillStyle = "#0284c7";
            ctx.beginPath();
            ctx.ellipse(-s / 4, 0, 4, 7, 0, 0, Math.PI * 2);
            ctx.ellipse(s / 4, 0, 4, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'wing_chunk':
            ctx.fillStyle = "#94a3b8";
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-s / 2, -s / 3);
            ctx.lineTo(s / 2, -s / 6);
            ctx.lineTo(s / 3, s / 3);
            ctx.lineTo(-s / 2, s / 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

        case 'luggage':
            ctx.fillStyle = debris.color || "#dc2626";
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-s / 2, -s / 2.8, s, s / 1.4, [4]);
            ctx.fill();
            ctx.stroke();
            break;

        case 'drink_cart':
            ctx.fillStyle = "#cbd5e1";
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 2;
            ctx.fillRect(-s / 2, -s / 1.8, s, s * 1.1);
            ctx.strokeRect(-s / 2, -s / 1.8, s, s * 1.1);
            break;

        default:
            ctx.fillStyle = "#64748b";
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 2;
            ctx.fillRect(-s / 2, -s / 3, s, s / 1.5);
            ctx.strokeRect(-s / 2, -s / 3, s, s / 1.5);
            break;
    }

    if (debris.hasBlood) {
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(4, -4, 7, 0, Math.PI * 2);
        ctx.arc(-4, 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7f1d1d";
        ctx.beginPath();
        ctx.arc(2, -2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}