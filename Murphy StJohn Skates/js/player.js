// =======================
// js/player.js - FULL SCRIPT
// =======================
window.Player = {
    data: {
        x: 100, y: 100, w: 30, h: 50,
        vx: 0, vy: 0, speed: 5.0,
        jumpCount: 0, 
        maxJumps: 3, 
        isFalling: false, fallRotation: 0,
        trick: null, trickTimer: 0,
        bodyRotation: 0, boardRotation: 0,
        facing: 1,
        punching: false, punchTimer: 0, punchCooldown: 0, punchHitbox: null,
        crouching: false,
        skinColor: "#FFDBAC", shirtColor: "#4CAF50", pantsColor: "#1A237E", hairColor: "#D2B48C",
        isAscending: false,
        isBitten: false, bittenTimer: 0
    },

    init() {
        const p = this.data;
        const c = window.Characters.list[window.Characters.selected] || window.Characters.list.murphy;
        p.skinColor = c.skin; p.shirtColor = c.shirt; p.pantsColor = c.pants; p.hairColor = c.hair;
        p.w = c.w; p.h = c.h;
        p.x = 100; p.y = 100; p.vx = 0; p.vy = 0;
        p.jumpCount = 0; p.isFalling = false; p.fallRotation = 0;
        p.trick = null; p.bodyRotation = 0; p.boardRotation = 0;
        p.punching = false; p.punchTimer = 0; p.punchCooldown = 0;
        p.crouching = false;
        p.isAscending = false;
        p.isBitten = false;
        p.bittenTimer = 0;
    },

    reset() { this.init(); },

    startAscension() {
        const p = this.data;
        p.isAscending = true;
        p.vx = 0;
        p.vy = -1.2; 
        p.trick = null;
        p.bodyRotation = 0;
        p.boardRotation = 0;
    },

    startBiteHold() {
        const p = this.data;
        p.isBitten = true;
        p.bittenTimer = 180; // Flashes for 3 seconds while latched, but player movement remains fully active
    },

    updateAscension(dt) {
        const p = this.data;
        p.y += p.vy * dt;
        p.bodyRotation = Math.sin(Date.now() * 0.005) * 0.1;
    },

    resetJumps() {
        const p = this.data;
        p.jumpCount = 0; p.trick = null; p.trickTimer = 0;
        p.bodyRotation = 0; p.boardRotation = 0;
    },

    requestJump() {
        const p = this.data;
        if (p.isFalling || p.isAscending) return; 
        
        if (p.jumpCount < p.maxJumps) {
            p.crouching = false; 
            p.vy = -9.5; 
            p.jumpCount++;

            if (p.jumpCount === 2) { 
                p.trick = "flip"; 
                p.trickTimer = 35; 
            }
            if (p.jumpCount === 3) { 
                p.trick = "kickflip"; 
                p.trickTimer = 35; 
            }
        }
    },

    requestAttack() {
        const p = this.data;
        if (p.punchCooldown > 0 || p.punching || p.isAscending) return;
        p.punching = true;
        p.punchTimer = 6;   
        p.punchCooldown = 8; 
    },

    update(dt, GROUND_Y, worldOffset, canvasWidth) {
        const p = this.data;
        if (p.isAscending) return;

        if (p.isBitten) {
            p.bittenTimer -= dt;
            if (p.bittenTimer <= 0) {
                p.isBitten = false;
            }
        }

        p.crouching = window.Input.inputDown() && p.jumpCount === 0 && !p.isFalling && p.vy >= 0;

        if (p.trickTimer > 0) {
            p.trickTimer--;
            if (p.trick === "flip") p.bodyRotation += 0.2;
            if (p.trick === "kickflip") p.boardRotation += 0.3;
            if (p.trickTimer <= 0) { p.bodyRotation = 0; p.boardRotation = 0; p.trick = null; }
        }

        if (p.punching) {
            p.punchTimer--;
            const reach = 60;
            const punchYOffset = p.crouching ? (p.h * 0.5) : (p.h * 0.2);
            p.punchHitbox = { 
                x: p.facing === 1 ? p.x + p.w : p.x - reach, 
                y: p.y + punchYOffset, 
                w: reach, 
                h: 20 
            };
            if (p.punchTimer <= 0) { p.punching = false; p.punchHitbox = null; }
        }
        if (p.punchCooldown > 0) p.punchCooldown--;

        if (p.isFalling) {
            p.y += p.vy * dt; p.vy += 0.4 * dt; p.fallRotation += 0.1 * dt;
            if (p.y > 400) window.GameAPI.triggerDamage();
            return;
        }

        const moveDir = window.GameAPI.getHorizontalInput ? window.GameAPI.getHorizontalInput() : 
                        (window.Input.inputRight() ? 1 : (window.Input.inputLeft() ? -1 : 0));
        
        if (moveDir !== 0) { 
            const currentSpeed = p.crouching ? p.speed * 0.4 : p.speed;
            p.vx = moveDir * currentSpeed; 
            p.facing = moveDir; 
        }
        else { p.vx *= Math.pow(0.85, dt); }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.45 * dt;

        if (p.x < 0) p.x = 0;
        if (p.x > canvasWidth - p.w) p.x = canvasWidth - p.w;

        const footY = p.y + p.h;
        if (footY >= GROUND_Y) {
            const isOnSolid = window.Objects && window.Objects.checkSolid ? window.Objects.checkSolid(p.x + worldOffset + (p.w / 2)) : true;
            if (isOnSolid) { 
                p.y = GROUND_Y - p.h; 
                if (p.vy > 0) p.vy = 0; 
                this.resetJumps(); 
            }
            else if (p.y > GROUND_Y + 10) { p.isFalling = true; }
        }
    },

    draw(ctx, time) {
        const charID = window.Characters.selected;
        const c = window.Characters.list[charID];
        this.renderCharacter(ctx, this.data.x, this.data.y, c, this.data, time);
    },

    renderCharacter(ctx, x, y, c, pData, time) {
        const { w, h } = c;
        const isFalling = pData ? pData.isFalling : false;
        const isPunching = pData ? pData.punching : false;
        const isCrouching = pData ? pData.crouching : false;
        const isAscending = pData ? pData.isAscending : false;
        const isBitten = pData ? pData.isBitten : false;
        const facing = pData ? pData.facing : 1;
        const bob = (pData && pData.jumpCount === 0 && !isCrouching && !isAscending) ? Math.sin(time * 0.01) * 2 : 0;
        const blink = Math.sin(time * 0.008) > 0.96 ? 0.1 : 1;

        ctx.save();

        if (isBitten && Math.floor(time * 0.03) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        if (isCrouching) {
            ctx.translate(x + w / 2, y + h); 
            ctx.scale(1.15, 0.65); 
            ctx.translate(0, -h / 2);
        } else {
            ctx.translate(x + w / 2, y + h / 2 + bob);
        }
        
        if (pData) { ctx.rotate(pData.bodyRotation); if (!isAscending) ctx.rotate(pData.vx * 0.05); }

        const headH = h * 0.35;
        const bodyH = h * 0.40;
        const legsH = h * 0.25;
        const shirtTop = -h/2 + headH;

        if (c.role === "cat") {
            ctx.strokeStyle = c.skin;
            ctx.lineWidth = 6;
            ctx.beginPath();
            const tailSwing = Math.sin(time * 0.005) * 10;
            ctx.moveTo(-w/4 * facing, shirtTop + bodyH - 5);
            ctx.quadraticCurveTo(-w * facing - tailSwing, shirtTop + bodyH - 15, -w * 0.8 * facing, shirtTop + bodyH - 25);
            ctx.stroke();
        }

        ctx.fillStyle = c.hair;
        if (c.role === "cat") {
            ctx.beginPath();
            ctx.moveTo(-w/2, -h/2 + 5); ctx.lineTo(-w/2 - 2, -h/2 - 8); ctx.lineTo(-w/4, -h/2);
            ctx.moveTo(w/2, -h/2 + 5); ctx.lineTo(w/2 + 2, -h/2 - 8); ctx.lineTo(w/4, -h/2);
            ctx.fill();
        } else if (c.hairStyle === "long-straight") {
            ctx.fillRect(-w/2 - 4, -h/2, w + 8, headH + 10);
        } else if (c.hairStyle === "curly-long") {
            for(let i=0; i<6; i++) {
                ctx.beginPath(); ctx.arc(-w/2 + (i*6), -h/2 + 5, 8, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(-w/2, -h/2 + 5 + (i*5), 6, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(w/2, -h/2 + 5 + (i*5), 6, 0, Math.PI*2); ctx.fill();
            }
        }

        ctx.fillStyle = c.skin;
        ctx.fillRect(-w/2, -h/2, w, headH);

        if (c.role === "cat") {
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 1;
            for(let i=-1; i<=1; i++) {
                ctx.beginPath(); ctx.moveTo(-2, -h/2 + headH*0.7); ctx.lineTo(-w/2-5, -h/2 + headH*0.7 + (i*3)); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(2, -h/2 + headH*0.7); ctx.lineTo(w/2+5, -h/2 + headH*0.7 + (i*3)); ctx.stroke();
            }
        }

        if (!isAscending && c.hatStyle === "backwards-cap") {
            ctx.fillStyle = c.hatColor || "red";
            ctx.fillRect(-w/2 - 2, -h/2 - 2, w + 4, 8); 
            ctx.fillRect(-w/2 * facing - (10 * facing), -h/2, 12 * facing, 4); 
        }

        ctx.fillStyle = c.hair;
        if (!isAscending) {
            if (c.hairStyle === "spiky") {
                ctx.beginPath(); ctx.moveTo(-w/2-4, -h/2+5);
                ctx.lineTo(-w/2-5, -h/2-5); ctx.lineTo(-w/2+2, -h/2-1);
                ctx.lineTo(-w/3, -h/2-9); ctx.lineTo(-w/5, -h/2-2);
                ctx.lineTo(-w/10, -h/2-12); ctx.lineTo(w/10, -h/2-2);
                ctx.lineTo(w/3, -h/2-10); ctx.lineTo(w/2-2, -h/2-1);
                ctx.lineTo(w/2+4, -h/2-8); ctx.lineTo(w/2+6, -h/2-3);
                ctx.lineTo(w/2+2, -h/2+5);
                ctx.closePath(); ctx.fill();
            } else if (c.hairStyle === "long-straight") {
                ctx.fillRect(-w/2 - 2, -h/2 - 4, w + 4, 10);
                ctx.fillRect(-w/2 - 3, -h/2, 5, headH * 0.8);
                ctx.fillRect(w/2 - 2, -h/2, 5, headH * 0.8);
            } else if (c.name === "Hayley") {
                ctx.fillRect(-w/2-4, -h/2-2, w+8, 12);
                for(let i=-2; i<=2; i++){ ctx.beginPath(); ctx.arc((w/4)*i, -h/2-5, 8, 0, Math.PI*2); ctx.fill(); }
            } else if (c.role !== "cat") {
                ctx.fillRect(-w/2-2, -h/2-4, w+4, headH*0.3);
            }
        }

        const eyeW = w * 0.25;
        const eyeH = headH * 0.4 * (isAscending ? 0.2 : blink); 
        const eyeY = -h/2 + (headH * 0.25);
        ctx.fillStyle = isFalling || isAscending ? "black" : "white";
        ctx.fillRect(-w/2 + (w * 0.15), eyeY, eyeW, eyeH);
        ctx.fillRect(w/2 - (w * 0.15) - eyeW, eyeY, eyeW, eyeH);

        if (!isFalling && !isAscending && blink > 0.5) {
            ctx.fillStyle = "black";
            const pupilSize = (c.role === "cat") ? 2 : 3;
            const lookOffset = facing * 1.5;
            ctx.fillRect(-w/2 + (w * 0.15) + (eyeW/2 - pupilSize/2) + lookOffset, eyeY + (eyeH/2 - pupilSize/2), pupilSize, pupilSize + (c.role === "cat" ? 2 : 0));
            ctx.fillRect(w/2 - (w * 0.15) - eyeW + (eyeW/2 - pupilSize/2) + lookOffset, eyeY + (eyeH/2 - pupilSize/2), pupilSize, pupilSize + (c.role === "cat" ? 2 : 0));
        }

        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (isAscending) {
            ctx.arc(0, -h/2 + headH * 0.75, 3, Math.PI, 0); 
        } else if (isBitten) {
            ctx.arc(0, -h/2 + headH * 0.75, 3, 0, Math.PI * 2);
        } else if (c.mouthStyle === "smile") {
            ctx.arc(0, -h/2 + headH * 0.75, 4, 0.2, Math.PI - 0.2);
        } else if (c.mouthStyle === "stoic") {
            ctx.moveTo(-4, -h/2 + headH * 0.8); ctx.lineTo(4, -h/2 + headH * 0.8);
        } else {
            ctx.moveTo(-3, -h/2 + headH * 0.78); ctx.quadraticCurveTo(0, -h/2 + headH * 0.85, 3, -h/2 + headH * 0.78);
        }
        ctx.stroke();

        if (isAscending) {
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.moveTo(-w/2, shirtTop);
            ctx.lineTo(w/2, shirtTop);
            ctx.lineTo(w/2 + 6, shirtTop + bodyH + legsH);
            ctx.lineTo(-w/2 - 6, shirtTop + bodyH + legsH);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "#E0E0E0";
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            ctx.fillStyle = c.shirt;
            ctx.fillRect(-w/2, shirtTop, w, bodyH);

            if (c.role === "cat") {
                ctx.fillStyle = "white"; 
                ctx.fillRect(-w/4, shirtTop + 5, w/2, bodyH - 10);
            }

            if (c.jerseyNumber) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.font = "bold 14px Arial";
                ctx.textAlign = "center";
                ctx.fillText(c.jerseyNumber, 0, shirtTop + bodyH/2 + 5);
            }

            ctx.fillStyle = c.pants;
            if (c.bottomType === "skirt") {
                ctx.beginPath();
                ctx.moveTo(-w/2 - 2, shirtTop + bodyH);
                ctx.lineTo(w/2 + 2, shirtTop + bodyH);
                ctx.lineTo(w/2 + 6, shirtTop + bodyH + 12);
                ctx.lineTo(-w/2 - 6, shirtTop + bodyH + 12);
                ctx.closePath(); ctx.fill();
            } else {
                ctx.fillRect(-w/2, shirtTop + bodyH, w, legsH);
            }
        }

        ctx.fillStyle = c.skin;
        const armW = (w > 30) ? 9 : 6;
        const armL = bodyH * 0.8;
        let leftArmAngle = isCrouching ? -Math.PI / 3 : 0;
        let rightArmAngle = isCrouching ? Math.PI / 3 : 0;
        let armExtend = 0;

        if (pData) {
            if (isAscending) {
                leftArmAngle = -Math.PI / 4;
                rightArmAngle = Math.PI / 4;
            } else if (isPunching) {
                armExtend = 15;
                if (facing === 1) rightArmAngle = -Math.PI / 1.8;
                else leftArmAngle = Math.PI / 1.8;
            } else if (pData.jumpCount > 0) {
                leftArmAngle = -Math.PI / 2.5;
                rightArmAngle = Math.PI / 2.5;
            } else if (Math.abs(pData.vx) > 0.5) {
                const swing = Math.sin(time * 0.012) * 0.6;
                leftArmAngle = swing;
                rightArmAngle = -swing;
            }
        }

        ctx.save(); ctx.translate(-w/2, shirtTop+5); 
        if (isPunching && facing === -1) ctx.translate(-armExtend, 0);
        ctx.rotate(leftArmAngle); ctx.fillRect(-armW+2, 0, armW, armL); ctx.restore();
        
        ctx.save(); ctx.translate(w/2, shirtTop+5); 
        if (isPunching && facing === 1) ctx.translate(armExtend, 0);
        ctx.rotate(rightArmAngle); ctx.fillRect(-2, 0, armW, armL); ctx.restore();

        if (pData && !isAscending) {
            ctx.save(); ctx.translate(0, h/2 - 4); ctx.rotate(pData.boardRotation);
            ctx.fillStyle = "#3E2723"; ctx.fillRect(-w/2-8, -2, w+16, 4);
            ctx.restore();
        }

        if (isAscending) {
            ctx.save();
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, -h/2 - 14, w * 0.45, 6, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 150, 0.5)";
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }
};