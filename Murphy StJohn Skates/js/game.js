// =======================
// js/game.js - FULL SCRIPT
// =======================
window.Game = (function () {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    if (canvas) {
        canvas.width = 640;
        canvas.height = 360;
    }

    const GROUND_Y = 265;
    let worldOffset = 0;
    let lastTime = 0;
    let score = 0;
    let starScore = 0;
    let lives = 5;
    let heartSpawnTimer = 0;
    let gameState = "TITLE"; 
    let isPaused = false;

    let entryName = "";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789! ";
    let charIndex = 0;

    let music = null;
    let musicStarted = false;
    let isMuted = false;
    let currentTrackIndex = 1;
    const totalTracks = 5;

    const charSelectBtnArea = { x: canvas.width / 2 - 130, y: 300, w: 260, h: 28 };

    const gameInstance = {
        score: 0,
        get state() { return gameState; }, 
        set state(val) { gameState = val; },
        changeLetter: function(dir) { charIndex = (charIndex + dir + alphabet.length) % alphabet.length; },
        confirmLetter: function() {
            if (entryName.length < 8) {
                entryName += alphabet[charIndex];
                if (entryName.length === 8) finishNameEntry();
            } else { finishNameEntry(); }
        },
        typeLetter: function(char) {
            if (entryName.length < 8) {
                entryName += char.toUpperCase();
                if (entryName.length === 8) finishNameEntry();
            }
        },
        backspaceLetter: function() { entryName = entryName.slice(0, -1); }
    };

    function saveHighScore(finalScore, finalStars, name, characterName) {
        let scores = JSON.parse(localStorage.getItem("skate_highscores_v4") || "[]");
        scores.push({ 
            name: name || "ANON", 
            score: Math.floor(finalScore), 
            stars: finalStars || 0,
            character: characterName || "UNKNOWN"
        });
        scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.stars - a.stars;
        });
        scores = scores.slice(0, 10);
        localStorage.setItem("skate_highscores_v4", JSON.stringify(scores));
    }

    function getTopScores() { return JSON.parse(localStorage.getItem("skate_highscores_v4") || "[]"); }

    function finishNameEntry() {
        let playedChar = "UNKNOWN";
        if (window.Characters && window.Characters.list && window.Characters.selected !== undefined) {
            const selectedCharData = window.Characters.list[window.Characters.selected];
            if (selectedCharData && selectedCharData.name) {
                playedChar = selectedCharData.name;
            }
        }
        saveHighScore(score, starScore, entryName || "ANON", playedChar);
        gameState = "GAMEOVER";
    }

    function playRandomTrack() {
        let nextTrack;
        do {
            nextTrack = Math.floor(Math.random() * totalTracks) + 1;
        } while (nextTrack === currentTrackIndex && totalTracks > 1);
        
        currentTrackIndex = nextTrack;

        if (music) {
            music.pause();
            music.currentTime = 0;
        }

        music = new Audio(`assets/music/${currentTrackIndex}.mp3`);
        music.volume = 1.0;
        music.muted = isMuted;

        music.addEventListener('ended', () => {
            playRandomTrack();
        });

        if (musicStarted) {
            music.play().catch(() => {});
        }
    }

    function setupMusic() {
        playRandomTrack();
        window.GameAPI = window.GameAPI || {};
        window.GameAPI.toggleMute = () => {
            isMuted = !isMuted;
            if (music) music.muted = isMuted;
            const btn = document.getElementById('muteButton');
            if (btn) btn.innerText = isMuted ? "Music: OFF" : "Music: ON";
        };
        const startMusic = () => { 
            if (!musicStarted && music) { 
                musicStarted = true; 
                music.play().catch(() => {}); 
            } 
        };
        window.addEventListener("mousedown", startMusic);
        window.addEventListener("keydown", startMusic);
        window.addEventListener("touchstart", startMusic);

        const checkGamepadMusic = () => {
            if (!musicStarted) {
                const pads = navigator.getGamepads();
                const gp = pads[0];
                if (gp) {
                    const anyPressed = gp.buttons.some(b => b.pressed) || gp.axes.some(a => Math.abs(a) > 0.3);
                    if (anyPressed) {
                        startMusic();
                    }
                }
            }
            requestAnimationFrame(checkGamepadMusic);
        };
        checkGamepadMusic();

        canvas.addEventListener("click", (e) => {
            if (gameState !== "GAMEOVER") return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            if (
                clickX >= charSelectBtnArea.x &&
                clickX <= charSelectBtnArea.x + charSelectBtnArea.w &&
                clickY >= charSelectBtnArea.y &&
                clickY <= charSelectBtnArea.y + charSelectBtnArea.h
            ) {
                window.GameAPI.goToCharSelect();
            }
        });
    }

    function softRestart() {
        gameState = "PLAYING"; 
        isPaused = false; 
        worldOffset = 0; 
        score = 0; 
        starScore = 0;
        lives = 5;
        heartSpawnTimer = 0;
        entryName = ""; 
        charIndex = 0;
        lastTime = 0; 
        
        if (window.NPCs?.reset) window.NPCs.reset();
        if (window.Objects?.reset) window.Objects.reset();
        if (window.Particles?.reset) window.Particles.reset();
        if (window.Background?.reset) window.Background.reset();
        if (window.Player?.reset) window.Player.reset();
        
        if (window.Characters && window.Player) {
            const charData = window.Characters.list[window.Characters.selected];
            if (charData) {
                window.Player.data.w = charData.w; window.Player.data.h = charData.h;
                window.Player.data.y = GROUND_Y - charData.h;
            }
        }
    }

    window.GameAPI = {
        getHorizontalInput: () => {
            if (!window.Input || isPaused) return 0;
            return window.Input.inputLeft() ? -1 : (window.Input.inputRight() ? 1 : 0);
        },
        triggerDamage: () => {
            if (gameState !== "PLAYING") return;
            lives--;
            if (lives <= 0) {
                gameState = "ASCENDING";
                if (window.Player) window.Player.startAscension();
            } else {
                if (window.Player) {
                    const p = window.Player.data;
                    p.x = Math.max(50, (window.Player.data.x || 100));
                    p.y = -50;
                    p.vy = 2;
                    p.vx = 0;
                    p.isFalling = false;
                    p.fallRotation = 0;
                    if (window.Player.resetJumps) window.Player.resetJumps();
                }
            }
        },
        triggerGameOver: () => { 
            lives = 0;
            if (gameState === "PLAYING") {
                gameState = "ASCENDING";
                if (window.Player) window.Player.startAscension();
            }
        },
        addHeart: () => {
            if (lives < 5) lives++;
        },
        isPaused: () => isPaused,
        togglePause: () => { if(gameState === "PLAYING") isPaused = !isPaused; },
        restart: () => { if (gameState === "GAMEOVER") softRestart(); },
        goToCharSelect: () => { gameState = "CHAR_SELECT"; },
        startFromTitle: () => { softRestart(); }
    };

    function update(dt, time) {
        if (gameState === "ASCENDING") {
            if (window.Player) {
                window.Player.updateAscension(dt);
                if (window.Player.data.y < -80) {
                    gameState = "NAME_ENTRY";
                }
            }
            return;
        }

        if (gameState !== "PLAYING" || isPaused) return;
        worldOffset += 2.5 * dt;
        score += 0.06 * dt; 
        gameInstance.score = score;

        heartSpawnTimer += dt;
        if (heartSpawnTimer >= 2700) {
            heartSpawnTimer = 0;
            if (window.Objects && window.Objects.spawnHeartFlyby) {
                window.Objects.spawnHeartFlyby(worldOffset, canvas.width);
            }
        }

        if(window.Objects) window.Objects.update(dt, worldOffset, canvas.width, GROUND_Y);
        if(window.NPCs) {
            window.NPCs.spawnRandom(worldOffset, canvas.width, GROUND_Y, score);
            window.NPCs.update(dt, worldOffset, canvas.width, GROUND_Y);
        }
        if(window.Player) window.Player.update(dt, GROUND_Y, worldOffset, canvas.width);
        if(window.Particles) window.Particles.update(dt);

        if (window.Objects && window.Objects.checkHeartCollisions && window.Player) {
            window.Objects.checkHeartCollisions(window.Player.data, worldOffset);
        }

        const p = window.Player?.data;
        if (!p) return;

        if (!window.NPCs) return;
        
        for (let i = window.NPCs.list.length - 1; i >= 0; i--) {
            const npc = window.NPCs.list[i];
            const nX = npc.x - worldOffset;

            if (p.punchHitbox) {
                const hb = p.punchHitbox;
                if (hb.x < nX + npc.w && hb.x + hb.w > nX && hb.y < npc.y + npc.h && hb.y + hb.h > npc.y) {
                    if (npc.role === "star") {
                        starScore += 1;
                        score += 50;
                        if (window.Particles?.spawnGoldBurst) {
                            window.Particles.spawnGoldBurst(nX + npc.w / 2, npc.y + npc.h / 2);
                        }
                        npc.dead = true;
                        continue;
                    }

                    npc.hp -= 5;
                    if (npc.hp <= 0) { 
                        if (npc.role === "police" && window.Particles.spawnDonutBurst) {
                            window.Particles.spawnDonutBurst(npc.x + (npc.w/2), npc.y + (npc.h/2));
                        } else if (window.Particles.spawnGoldBurst) {
                            window.Particles.spawnGoldBurst(npc.x + (npc.w/2), npc.y + (npc.h/2));
                        }
                        npc.dead = true; 
                        score += 15; 
                    }
                    continue; 
                }
            }

            if (npc.role === "star") continue;

            const isCollidingX = p.x < nX + npc.w && p.x + p.w > nX;
            const isCollidingY = p.y < npc.y + npc.h && p.y + p.h > npc.y;

            if (isCollidingX && isCollidingY) {
                const isFalling = p.vy > 0;
                const isAbove = (p.y + p.h) < (npc.y + 35);

                if (isFalling && isAbove) {
                    p.y = npc.y - p.h; 
                    p.vy = -10.5;      
                    p.jumpCount = 1;    
                    score += 15;
                    if (window.Particles?.spawn) window.Particles.spawn(p.x + p.w/2, p.y + p.h, "dust");
                    npc.dead = true;
                } else {
                    if (npc.role === "zombie") {
                        score -= 10;
                        npc.dead = true; 
                        window.GameAPI.triggerDamage();
                    } else if (npc.role === "police" || npc.role === "ghostbuster" || npc.role === "policeBoss") {
                        window.GameAPI.triggerDamage();
                    }
                }
            }
        }
    }

    function draw(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === "TITLE") {
            if (window.TitleScreen) window.TitleScreen.draw(ctx, canvas, time);
            else {
                ctx.fillStyle = "white"; ctx.textAlign = "center";
                ctx.fillText("LOADING ASSETS...", canvas.width/2, canvas.height/2);
            }
            return;
        }

        if (gameState === "CHAR_SELECT") { 
            if(window.CharacterSelect) window.CharacterSelect.draw(ctx, canvas); 
            return; 
        }

        if (gameState === "NAME_ENTRY") {
            ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center"; ctx.fillStyle = "#00FFAA"; ctx.font = "bold 28px Courier New";
            ctx.fillText("NEW HIGH SCORE!", canvas.width / 2, 80);
            ctx.fillStyle = "white"; ctx.font = "18px Courier New"; ctx.fillText("ENTER YOUR NAME", canvas.width / 2, 120);
            ctx.font = "bold 44px Courier New"; ctx.fillText(entryName.padEnd(8, "_"), canvas.width / 2, 180);
            ctx.font = "20px Courier New"; ctx.fillStyle = "#FFD700"; ctx.fillText(`[ ${alphabet[charIndex]} ]`, canvas.width / 2, 230);
            return;
        }

        if (window.Background) window.Background.draw(ctx, worldOffset, canvas, GROUND_Y);
        if (window.Objects) window.Objects.draw(ctx, worldOffset);
        if (window.NPCs) window.NPCs.draw(ctx, worldOffset, time);
        if (window.Player) window.Player.draw(ctx, time);
        if (window.Particles) window.Particles.draw(ctx, worldOffset);

        if (gameState === "PLAYING" || gameState === "ASCENDING") {
            ctx.textAlign = "left"; 
            ctx.font = "bold 18px Courier New";

            ctx.fillStyle = "#FF1744";
            let heartsText = "";
            for (let h = 0; h < 5; h++) {
                heartsText += (h < lives) ? "❤️ " : "🖤 ";
            }
            ctx.fillText(`HEARTS: ${heartsText}`, 20, 30);

            ctx.fillStyle = "white"; 
            ctx.fillText(`SCORE: ${Math.floor(score)}`, 20, 55);
            
            ctx.fillStyle = "#FFD700";
            ctx.fillText(`STARS: ${starScore}`, 20, 80);
        }

        if (gameState === "GAMEOVER") {
            ctx.fillStyle = "rgba(0,0,0,0.92)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center"; ctx.fillStyle = "red"; ctx.font = "bold 38px Impact";
            ctx.fillText("WASTED", canvas.width / 2, 40);
            
            ctx.fillStyle = "#FFD700"; ctx.font = "bold 12px Courier New";
            ctx.fillText("RANK   NAME       CHARACTER    SCORE + STARS", canvas.width / 2, 65);

            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 210, 72);
            ctx.lineTo(canvas.width / 2 + 210, 72);
            ctx.stroke();

            const topScores = getTopScores();
            topScores.forEach((s, i) => {
                ctx.fillStyle = (i === 0) ? "#FFD700" : "white"; 
                ctx.font = "bold 11px Courier New";
                
                const rankStr = (i + 1).toString().padStart(2, ' ') + ".";
                const nameStr = (s.name || "ANON").padEnd(8, ' ');
                const charStr = (s.character || "UNKNOWN").padEnd(10, ' ');
                const scoreDisplay = `${Math.floor(s.score)} + ${s.stars || 0} ⭐`;
                
                ctx.fillText(`${rankStr}   ${nameStr}    ${charStr}    ${scoreDisplay}`, canvas.width / 2, 90 + (i * 18));
            });

            ctx.fillStyle = "rgba(0, 170, 255, 0.25)";
            ctx.strokeStyle = "#00FFAA";
            ctx.lineWidth = 2;
            ctx.fillRect(charSelectBtnArea.x, charSelectBtnArea.y, charSelectBtnArea.w, charSelectBtnArea.h);
            ctx.strokeRect(charSelectBtnArea.x, charSelectBtnArea.y, charSelectBtnArea.w, charSelectBtnArea.h);

            ctx.fillStyle = "#00FFAA"; ctx.font = "bold 13px Courier New";
            ctx.fillText("CHANGE CHARACTER", canvas.width / 2, charSelectBtnArea.y + 18);

            ctx.fillStyle = "#FFEB3B"; ctx.font = "bold 12px Courier New";
            ctx.fillText("TAP JUMP/PUNCH OR PRESS START TO RESTART", canvas.width / 2, 345);
        }
    }

    gameInstance.init = function() {
        setupMusic();
        if (window.TitleScreen) window.TitleScreen.init();
        if (window.Player) window.Player.init();
        if (window.Background) window.Background.init(canvas, GROUND_Y);
        if (window.Input && window.Input.setupInput) window.Input.setupInput();
    };

    gameInstance.start = function() {
        const loop = (t) => { 
            const dt = (t - (lastTime || t)) / 16.67;
            update(dt > 2 ? 1 : dt, t); 
            lastTime = t; 
            draw(t); 
            requestAnimationFrame(loop); 
        };
        requestAnimationFrame(loop);
    };

    return gameInstance;
})();