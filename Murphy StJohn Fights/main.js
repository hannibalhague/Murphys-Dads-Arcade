// =================================================================
//   MODULE 2: GAME ENGINE LOOP & COMBAT SCORE TRACKING
// =================================================================

// Safely initialize or grab canvas/ctx without throwing redeclaration errors
window.gameCanvas = window.gameCanvas || document.getElementById('gameCanvas');
window.gameCtx = window.gameCtx || window.gameCanvas.getContext('2d', { alpha: false, desynchronized: true });

const canvas = window.gameCanvas;
const ctx = window.gameCtx;

const logicalWidth = 1100;
const baseLogicalHeight = 500;

let bloodSplatters = [];

function addBloodSplatter(x, y) {
    bloodSplatters.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 10 - 5),
        radius: Math.random() * 6 + 4,
        alpha: 1.0,
        decay: Math.random() * 0.005 + 0.002
    });
}

function resizeCanvas() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    const isPortrait = containerHeight > containerWidth;
    const currentLogicalHeight = isPortrait ? 550 : baseLogicalHeight;
    const viewScale = 1.0; 
    
    const effectiveLogicalWidth = logicalWidth * viewScale;
    const effectiveLogicalHeight = currentLogicalHeight * viewScale;

    const scaleX = containerWidth / effectiveLogicalWidth;
    const scaleY = containerHeight / effectiveLogicalHeight;
    const scale = Math.min(scaleX, scaleY);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    
    canvas.width = logicalWidth * dpr;
    canvas.height = currentLogicalHeight * dpr;
    
    canvas.style.width = `${Math.floor(effectiveLogicalWidth * scale)}px`;
    canvas.style.height = `${Math.floor(effectiveLogicalHeight * scale)}px`;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale((dpr * scale) / viewScale, (dpr * scale) / viewScale);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));

let gameStarted = false;
let currentLevel = 1;
let levelTimer = CONFIG.levelDuration; 
let lastTime = performance.now();

const FIXED_FPS = 60;
const FIXED_DT = 1000 / FIXED_FPS; 
let accumulator = 0;

let score = 0;
let pitThrowsCount = 0;
let lives = 3; 
let highScores = [1000, 750, 500, 250, 100];
let lifeDeductedThisDeath = false;

const camera = {
    x: 0,
    y: 0,
    update(target) {
        const viewScale = 1.0;
        const isPortrait = window.innerHeight > window.innerWidth;
        const currentLogicalHeight = isPortrait ? 550 : baseLogicalHeight;
        
        const currentLogicalWidth = logicalWidth * viewScale;
        const scaledLogicalHeight = currentLogicalHeight * viewScale;

        this.x = target.x - currentLogicalWidth / 2;
        if (this.x < 0) this.x = 0;
        if (this.x > CONFIG.worldWidth - currentLogicalWidth) {
            this.x = CONFIG.worldWidth - currentLogicalWidth;
        }

        this.y = target.y - scaledLogicalHeight / 2;
        if (this.y < 0) this.y = 0;
        if (this.y > CONFIG.worldHeight - scaledLogicalHeight) {
            this.y = CONFIG.worldHeight - scaledLogicalHeight;
        }
    }
};

const envObjects = [
    { type: 'weapon', subType: 'pipe', x: 750, y: 460, pickedUp: false },
    { type: 'weapon', subType: 'pipe', x: 1650, y: 420, pickedUp: false }
];

const driveableCar = new DetailedDriveableCar(CONFIG.worldWidth - 140, 420);
const levelMiddleX = CONFIG.worldWidth / 2;
const levelMiddleY = CONFIG.worldHeight / 2;

const player = new Fighter(levelMiddleX, levelMiddleY, 'ROB', true, {
    shirt: '#1e3d59', pants: '#17b978', skin: '#f3c68f', hair: '#111111'
});

const characterPool = [
    { name: 'BULLY REX', colors: { shirt: '#b83b43', pants: '#2d3748', skin: '#e0ac69', hair: '#e53e3e' } },
    { name: 'PUNK SPIKE', colors: { shirt: '#6b46c1', pants: '#1a202c', skin: '#f6ad55', hair: '#4fd1c5' } },
    { name: 'JACKET VANCE', colors: { shirt: '#4a5568', pants: '#1a202c', skin: '#d69e2e', hair: '#2d3748' } },
    { name: 'STREET BRAWLER', colors: { shirt: '#9b2c2c', pants: '#2c5282', skin: '#c68a4d', hair: '#1a202c' } },
    { name: 'TOUGH GUY KANE', colors: { shirt: '#2b6cb0', pants: '#2d3748', skin: '#e2b08e', hair: '#4a5568' } },
    { name: 'GRID SURGE', colors: { shirt: '#2c7a7b', pants: '#1a202c', skin: '#f7fafc', hair: '#234e52' } }
];

function getRandomRosterMembers(count, excludeNames = []) {
    let results = [];
    let available = [...characterPool];
    for (let i = 0; i < count; i++) {
        let filtered = available.filter(c => !excludeNames.includes(c.name) && !results.some(r => r.name === c.name));
        if (filtered.length === 0) filtered = available;
        let chosen = filtered[Math.floor(Math.random() * filtered.length)];
        results.push(chosen);
        excludeNames.push(chosen.name);
    }
    return results;
}

const initialSpawns = getRandomRosterMembers(2);
const npcs = [
    new Fighter(levelMiddleX - 100, levelMiddleY - 20, initialSpawns[0].name, false, initialSpawns[0].colors),
    new Fighter(levelMiddleX + 100, levelMiddleY + 20, initialSpawns[1].name, false, initialSpawns[1].colors)
];

function addScore(amount) { score += amount; }
function checkHighScore() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    if (highScores.length > 5) highScores.pop();
}

function updateNPCtheme() {
    let newSelection = getRandomRosterMembers(2);
    npcs.forEach((npc, index) => {
        let selected = newSelection[index] || characterPool[index % characterPool.length];
        npc.name = selected.name;
        npc.colors = selected.colors;
        npc.bloodLevel = 0; 
    });
}

function nextLevel() {
    currentLevel++;
    levelTimer = CONFIG.levelDuration; 
    score += 250; 
    updateNPCtheme();

    npcs.forEach(npc => {
        npc.health = npc.maxHealth + (currentLevel * 25);
        npc.maxHealth = npc.health;
        npc.isDefeated = false;
        npc.isGrabbed = false;
        npc.grabbedBy = null;
        npc.pitCounted = false;
        npc.bloodLevel = 0;
        npc.x = npc.spawnX + (Math.random() * 80 - 40);
    });
    
    player.health = Math.min(player.maxHealth, player.health + 50);
    player.x = levelMiddleX; 
    player.y = levelMiddleY;
    player.bloodLevel = Math.max(0, (player.bloodLevel || 0) - 1); 
}

document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    const titleScreen = document.getElementById('title-screen');
    
    if (typeof audioManager !== 'undefined' && typeof audioManager.stopMusic === 'function') {
        audioManager.stopMusic();
    }
    
    if (titleScreen) {
        const launchGame = (e) => {
            if (gameStarted) return;
            if (e) e.preventDefault();
            gameStarted = true;
            titleScreen.classList.add('hidden');
            lastTime = performance.now(); 
            accumulator = 0;
            resizeCanvas();
        };

        window.addEventListener('keydown', launchGame);
        titleScreen.addEventListener('click', launchGame);
        titleScreen.addEventListener('touchstart', launchGame, { passive: false });

        const checkGamepadLaunch = () => {
            if (!gameStarted) {
                const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
                for (let i = 0; i < gamepads.length; i++) {
                    const gp = gamepads[i];
                    if (gp) {
                        for (let b = 0; b < gp.buttons.length; b++) {
                            if (gp.buttons[b].pressed) {
                                launchGame();
                                break;
                            }
                        }
                    }
                }
                requestAnimationFrame(checkGamepadLaunch);
            }
        };
        requestAnimationFrame(checkGamepadLaunch);
    }
});

function fixedUpdate() {
    const deltaTime = 1; 

    if (gameStarted && player.isDefeated && lives <= 0 && !player.isAngel) {
        if (RestartControl.canRestart()) {
            const keyboardOrTouchRestart = (
                (typeof Input !== 'undefined' && Input.anyKeyPressed) || 
                (typeof RestartControl.isRestartRequested === 'function' && RestartControl.isRestartRequested())
            );
            if (keyboardOrTouchRestart) {
                player.health = player.maxHealth;
                player.stamina = player.maxStamina;
                player.isDefeated = false;
                player.isKnockedDown = false;
                player.isAngel = false;
                player.z = 0;
                player.zVelocity = 0;
                player.x = levelMiddleX; 
                player.y = levelMiddleY;
                player.bloodLevel = 0;
                score = 0;
                pitThrowsCount = 0;
                lives = 3; 
                currentLevel = 1;
                levelTimer = CONFIG.levelDuration;
                updateNPCtheme();
                lifeDeductedThisDeath = false;
                bloodSplatters = [];
                if (typeof Input !== 'undefined') { Input.restartRequested = false; Input.anyKeyPressed = false; }
                if (typeof RestartControl.reset === 'function') RestartControl.reset();
            }
        }
    }

    if (gameStarted) {
        const inPitBounds = (player.x >= -10 && player.x <= 170 && player.y >= 340 && player.y <= 740);

        if ((inPitBounds || player.health <= 0) && !player.isDefeated && !player.isAngel) {
            player.isDefeated = true;
            player.health = 0;
            player.isAngel = true;
            player.z = 0;
            player.zVelocity = 2.5;
            player.bloodLevel = (player.bloodLevel || 0) + 3;
            addBloodSplatter(player.x, player.y);
            if (typeof audioManager !== 'undefined') audioManager.playDeath();
        }

        if (player.isDefeated && !lifeDeductedThisDeath) {
            lives--;
            lifeDeductedThisDeath = true;
            if (lives <= 0) {
                RestartControl.initiateLockout(5000); 
                checkHighScore();
            } else {
                RestartControl.initiateLockout(1500); 
            }
        }

        if (player.isAngel) {
            player.zVelocity = 3.0;
            player.z += player.zVelocity * deltaTime;
            if (player.z > 350) {
                player.isAngel = false;
                player.z = 0;
                player.zVelocity = 0;
                if (lives > 0) {
                    player.isDefeated = false;
                    player.health = player.maxHealth;
                    player.stamina = player.maxStamina;
                    player.isKnockedDown = false;
                    player.x = 300 + Math.random() * (CONFIG.worldWidth - 600);
                    player.y = 300 + Math.random() * (CONFIG.worldHeight - 400);
                    player.bloodLevel = 0; 
                    lifeDeductedThisDeath = false; 
                } else {
                    player.isDefeated = true;
                }
            }
        }

        if (!Input.paused && !(player.isDefeated && lives <= 0 && !player.isAngel)) {
            levelTimer -= (FIXED_DT / 1000);
            if (levelTimer <= 0) nextLevel();

            npcs.forEach(npc => {
                if (!npc.prevHealth) npc.prevHealth = npc.health;
                if (!npc.bloodLevel) npc.bloodLevel = 0;

                npc.update([player], envObjects, deltaTime);

                if (npc.health < npc.prevHealth) {
                    npc.bloodLevel = Math.min(npc.bloodLevel + 1, 12); 
                    addBloodSplatter(npc.x, npc.y);
                }
                npc.prevHealth = npc.health;

                const npcOnConveyor = (npc.y >= 620 && npc.y <= 675);
                if (npcOnConveyor && !npc.isDefeated) {
                    npc.x -= 3.5 * deltaTime;
                }

                if (npc.isDefeated && !npc.scoreCounted) {
                    npc.scoreCounted = true;
                    addScore(100); 
                    npc.bloodLevel = Math.min(npc.bloodLevel + 3, 15);
                    addBloodSplatter(npc.x, npc.y);
                } else if (!npc.isDefeated) {
                    npc.scoreCounted = false;
                    const npcInPit = (npc.x >= -10 && npc.x <= 170 && npc.y >= 340 && npc.y <= 740);
                    if (npc.z < -80 || (npcInPit && (npc.isKnockedDown || npc.z < 0))) {
                        if (!npc.pitCounted) {
                            npc.pitCounted = true;
                            pitThrowsCount++;
                            addScore(200);
                            npc.bloodLevel = 15;
                            addBloodSplatter(npc.x, npc.y);
                            if (typeof audioManager !== 'undefined') audioManager.playDeath();
                        }
                        npc.health = 0;
                        npc.isDefeated = true;
                    }
                }
            });

            if (!player.isAngel) {
                if (!player.prevHealth) player.prevHealth = player.health;
                if (!player.bloodLevel) player.bloodLevel = 0;

                player.update(npcs, envObjects, addScore, deltaTime);

                if (player.health < player.prevHealth) {
                    player.bloodLevel = Math.min(player.bloodLevel + 1, 12);
                    addBloodSplatter(player.x, player.y);
                }
                player.prevHealth = player.health;

                const onConveyorBelt = (player.y >= 620 && player.y <= 675);
                if (onConveyorBelt && !player.isDefeated) {
                    player.x -= 3.5 * deltaTime; 
                }
            }

            envObjects.forEach(obj => {
                if (obj.type === 'thrownWeapon') {
                    obj.x += obj.vx * deltaTime;
                    obj.zVelocity -= CONFIG.gravity * deltaTime; 
                    obj.z += obj.zVelocity * deltaTime;
                    if (obj.x >= -10 && obj.x <= 170 && obj.y >= 340 && obj.y <= 740 && obj.z <= 0) {
                        obj.z = -100;
                        obj.type = 'lost';
                    } else if (obj.z <= 0) {
                        obj.z = 0;
                        obj.zVelocity = 0;
                        obj.type = 'weapon'; 
                        obj.pickedUp = false;
                    }

                    npcs.forEach(npc => {
                        let hitBoxX = npc.x - npc.width / 2;
                        let hitBoxW = npc.width;
                        let hitBoxYMin = npc.y - 15;
                        let hitBoxYMax = npc.y + 15;
                        let hitBoxZMin = npc.z;
                        let hitBoxZMax = npc.z + npc.height;

                        if (!npc.isDefeated && 
                            obj.x >= hitBoxX && obj.x <= hitBoxX + hitBoxW && 
                            obj.y >= hitBoxYMin && obj.y <= hitBoxYMax && 
                            obj.z >= hitBoxZMin && obj.z <= hitBoxZMax) {
                            
                            npc.receiveHit(35, obj.vx > 0 ? 'right' : 'left', true);
                            addScore(30); 
                            npc.bloodLevel = Math.min((npc.bloodLevel || 0) + 2, 15);
                            addBloodSplatter(npc.x, npc.y);
                            if (typeof audioManager !== 'undefined') audioManager.playHit();
                            obj.y = 9999; 
                        }
                    });
                }
            });
        }
        camera.update(player);
    }
}

function gameLoop(timestamp) {
    let frameTime = timestamp - lastTime;
    lastTime = timestamp;

    if (frameTime > 100) frameTime = 100;
    accumulator += frameTime;

    while (accumulator >= FIXED_DT) {
        fixedUpdate();
        accumulator -= FIXED_DT;
    }

    const viewScale = 1.0;
    const isPortrait = window.innerHeight > window.innerWidth;
    const currentLogicalHeight = isPortrait ? 550 : baseLogicalHeight;

    ctx.clearRect(0, 0, logicalWidth * viewScale, currentLogicalHeight * viewScale);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    Environment.drawBackground(ctx, camera.x, logicalWidth * viewScale, CONFIG.worldWidth); 
    driveableCar.draw(ctx);

    bloodSplatters.forEach(blood => {
        blood.alpha = Math.max(0, blood.alpha - blood.decay);
        ctx.fillStyle = `rgba(138, 3, 3, ${blood.alpha})`;
        ctx.beginPath();
        ctx.arc(blood.x, blood.y, blood.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    envObjects.forEach(obj => {
        if ((obj.type === 'weapon' && !obj.pickedUp) || obj.type === 'thrownWeapon') {
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(obj.x, obj.y, 12, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#cbd5e0';
            ctx.fillRect(obj.x - 15, (obj.y - (obj.z || 0)) - 8, 30, 6);
        }
    });

    let allEntities = [player, ...npcs];
    allEntities.sort((a, b) => a.y - b.y);
    allEntities.forEach(entity => {
        entity.draw(ctx);

        if (entity.bloodLevel && entity.bloodLevel > 0) {
            ctx.fillStyle = 'rgba(150, 4, 4, 0.9)';
            let bodyPartOffsets;
            if (entity.isKnockedDown || entity.isDefeated) {
                bodyPartOffsets = [
                    {x: -25, y: -2}, {x: -18, y: 2}, {x: -12, y: -3},
                    {x: -5, y: 1},   {x: 2, y: -2},   {x: 8, y: 2},
                    {x: 15, y: -1},  {x: 22, y: 1},   {x: -20, y: 6},
                    {x: -10, y: 5},  {x: 0, y: 6},    {x: 10, y: 5},
                    {x: 18, y: 6},   {x: -15, y: -5}, {x: 12, y: -4}
                ];
            } else {
                bodyPartOffsets = [
                    {x: 0, y: -75}, {x: -3, y: -72}, {x: 3, y: -73}, 
                    {x: -1, y: -65}, {x: 2, y: -66}, {x: -4, y: -55}, 
                    {x: 4, y: -53}, {x: -1, y: -48}, {x: -8, y: -60}, 
                    {x: 8, y: -58}, {x: -6, y: -50}, {x: 7, y: -49}, 
                    {x: -2, y: -42}, {x: 3, y: -43}, {x: 0, y: -58}    
                ];
            }
            
            const effectiveZ = (entity.isKnockedDown || entity.isDefeated) ? 0 : (entity.z || 0);
            
            for (let i = 0; i < Math.min(entity.bloodLevel, bodyPartOffsets.length); i++) {
                let part = bodyPartOffsets[i];
                ctx.beginPath();
                ctx.arc(
                    entity.x + part.x, 
                    (entity.y - effectiveZ) + part.y, 
                    2.5 + (i % 2), 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    });

    if (player.isAngel) {
        ctx.fillStyle = 'rgba(255, 223, 0, 0.85)';
        ctx.beginPath();
        ctx.ellipse(player.x, (player.y - player.z) - 55, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();

    if (gameStarted) {
        HUD.draw(ctx, player, currentLevel, Input.paused, score, levelTimer, highScores, (lives <= 0 && player.isDefeated && !player.isAngel), pitThrowsCount, lives);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);