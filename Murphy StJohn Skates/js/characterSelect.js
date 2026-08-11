// =======================
// js/characterSelect.js
// =======================
window.CharacterSelect = (function () {
    let selectedIndex = 0;

    function drawRoundedRect(ctx, x, y, w, h, r) {
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
    }

    function drawDetailedFace(ctx, c, headY, headH, blink) {
        ctx.fillStyle = c.skin;
        drawRoundedRect(ctx, -14, headY + 8, 4, 9, 2);
        drawRoundedRect(ctx, 10, headY + 8, 4, 9, 2);

        ctx.fillStyle = "white";
        ctx.fillRect(-7, headY + 8, 5, 5 * blink);
        ctx.fillRect(3, headY + 8, 5, 5 * blink);
        if (blink > 0.3) {
            ctx.fillStyle = "black";
            ctx.fillRect(-5.5, headY + 9.5, 2.5, 2.5);
            ctx.fillRect(4.5, headY + 9.5, 2.5, 2.5);
        }

        ctx.fillStyle = "rgba(0,0,0,0.15)";
        const nSize = c.noseSize || 3;
        ctx.fillRect(-nSize/2, headY + 13, nSize, 4);

        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (c.mouthStyle === "smile") {
            ctx.arc(0, headY + 17, 4, 0.2, Math.PI - 0.2);
        } else if (c.mouthStyle === "stoic") {
            ctx.moveTo(-4, headY + 19); ctx.lineTo(4, headY + 19);
        } else {
            ctx.moveTo(-3, headY + 18); ctx.quadraticCurveTo(0, headY + 19, 3, headY + 18);
        }
        ctx.stroke();
    }

    function drawCharacter(ctx, x, y, c) {
        const time = Date.now();
        const blink = Math.sin(time * 0.008) > 0.95 ? 0.1 : 1;
        const bob = Math.sin(time * 0.005) * 3;

        ctx.save();
        ctx.translate(x, y + bob);

        if (c.role === "cat") {
            ctx.fillStyle = c.skin;
            ctx.beginPath();
            ctx.moveTo(-15, -c.h/2 + 5); ctx.lineTo(-17, -c.h/2 - 10); ctx.lineTo(-8, -c.h/2);
            ctx.moveTo(15, -c.h/2 + 5); ctx.lineTo(17, -c.h/2 - 10); ctx.lineTo(8, -c.h/2);
            ctx.fill();

            ctx.strokeStyle = c.skin;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(-5, 20);
            ctx.quadraticCurveTo(-25, 10, -20, -5);
            ctx.stroke();
        }

        ctx.fillStyle = c.hair;
        if (c.hairStyle === "curly-long") {
            for(let i=0; i<6; i++) {
                ctx.beginPath(); ctx.arc(-14 + (i*5), -c.h/2 + 10, 8, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(-14, -c.h/2 + 10 + (i*5), 6, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(14, -c.h/2 + 10 + (i*5), 6, 0, Math.PI*2); ctx.fill();
            }
        } else if (c.hairStyle === "super-curly") {
            for(let i=0; i<8; i++) {
                let cxOffset = -16 + (i * 4.5);
                ctx.beginPath(); ctx.arc(cxOffset, -c.h/2 + 6, 8, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(cxOffset, -c.h/2 + 12, 7, 0, Math.PI*2); ctx.fill();
            }
            ctx.beginPath(); ctx.arc(-16, -c.h/2 + 16, 6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(16, -c.h/2 + 16, 6, 0, Math.PI*2); ctx.fill();
        } else if (c.hairStyle === "long-straight") {
            drawRoundedRect(ctx, -15, -c.h/2, 30, 35, 8);
        }

        ctx.fillStyle = c.skin;
        drawRoundedRect(ctx, -12, -c.h/2, 24, 24, 7);
        drawDetailedFace(ctx, c, -c.h/2, 24, blink);

        if (c.hatStyle === "backwards-cap") {
            ctx.fillStyle = c.hatColor || "red";
            ctx.fillRect(-14, -c.h/2 - 2, 28, 8);
            ctx.fillRect(-22, -c.h/2, 10, 4);
        } else if (c.hatStyle === "baseball-cap") {
            ctx.fillStyle = c.hatColor || "white";
            drawRoundedRect(ctx, -15, -c.h/2 - 6, 30, 10, 4);
            ctx.fillStyle = c.brimColor || "red";
            drawRoundedRect(ctx, 2, -c.h/2 + 2, 18, 4, 2);
        }

        if (c.hatStyle !== "baseball-cap") {
            ctx.fillStyle = c.hair;
            if (c.hairStyle === "spiky") {
                ctx.beginPath(); ctx.moveTo(-14, -c.h/2 + 5);
                for(let i=0; i<5; i++) {
                    ctx.lineTo(-10 + (i*6), -c.h/2 - 12);
                    ctx.lineTo(-6 + (i*6), -c.h/2 + 5);
                }
                ctx.fill();
                drawRoundedRect(ctx, -13, -c.h/2 - 2, 26, 8, 4);
            } else if (c.hairStyle === "super-curly") {
                for(let i=0; i<7; i++) {
                    ctx.beginPath(); ctx.arc(-13 + (i*4), -c.h/2 - 4, 7, 0, Math.PI*2); ctx.fill();
                }
            } else if (c.hairStyle === "long-straight") {
                drawRoundedRect(ctx, -13, -c.h/2 - 4, 26, 10, 5); 
                ctx.fillRect(-14, -c.h/2, 4, 20); 
                ctx.fillRect(10, -c.h/2, 4, 20);  
            } else if (c.role !== "cat" && !c.hatStyle) {
                drawRoundedRect(ctx, -13, -c.h/2 - 3, 26, 8, 4);
            }
        }

        if (c.role === "cat") {
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 1;
            for(let i=-1; i<=1; i++) {
                ctx.beginPath(); ctx.moveTo(-2, 5); ctx.lineTo(-18, 5 + (i*3)); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(2, 5); ctx.lineTo(18, 5 + (i*3)); ctx.stroke();
            }
        }

        ctx.fillStyle = c.skin;
        const armWidth = Math.max(4, Math.floor(c.w / 5));
        drawRoundedRect(ctx, -c.w/2 - 4, -c.h/2 + 25, armWidth, 18, 3);
        drawRoundedRect(ctx, c.w/2 - armWidth + 4, -c.h/2 + 25, armWidth, 18, 3);
        ctx.beginPath(); ctx.arc(-c.w/2 - 1, -c.h/2 + 45, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(c.w/2 + 1, -c.h/2 + 45, 4, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = c.shirt;
        if (c.bottomType === "skirt") {
            ctx.beginPath(); ctx.moveTo(-c.w/2, -c.h/2 + 24); ctx.lineTo(c.w/2, -c.h/2 + 24); ctx.lineTo(c.w/2 + 2, -c.h/2 + 46); ctx.lineTo(-c.w/2 - 2, -c.h/2 + 46); ctx.closePath(); ctx.fill();
        } else {
            drawRoundedRect(ctx, -c.w/2, -c.h/2 + 24, c.w, 22, 5);
        }
        
        if (c.emblem === "deadpool") {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(0, -c.h/2 + 35, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = c.shirt;
            ctx.beginPath();
            ctx.arc(0, -c.h/2 + 35, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (c.role === "cat") {
            ctx.fillStyle = "white";
            ctx.fillRect(-6, -c.h/2 + 28, 12, 14);
        }

        if (c.jerseyNumber) {
            ctx.fillStyle = "white";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(c.jerseyNumber, 0, -c.h/2 + 40);
        }
        
        ctx.fillStyle = c.pants;
        if (c.bottomType === "skirt") {
            ctx.beginPath(); ctx.moveTo(-c.w/2 - 3, -c.h/2 + 44); ctx.lineTo(c.w/2 + 3, -c.h/2 + 44); ctx.lineTo(c.w/2 + 5, -c.h/2 + 55); ctx.lineTo(-c.w/2 - 5, -c.h/2 + 55); ctx.closePath(); ctx.fill();
            ctx.fillStyle = c.skin; ctx.fillRect(-10, -c.h/2 + 55, 6, 5); ctx.fillRect(4, -c.h/2 + 55, 6, 5);
        } else {
            const legWidth = Math.max(6, Math.floor((c.w - 4) / 2));
            drawRoundedRect(ctx, -c.w/2 + 1, -c.h/2 + 44, legWidth, 15, 2);
            drawRoundedRect(ctx, c.w/2 - legWidth - 1, -c.h/2 + 44, legWidth, 15, 2);
        }

        ctx.fillStyle = "#3E2723";
        drawRoundedRect(ctx, -25, -c.h/2 + 59, 50, 4, 2);

        const shoeCol = c.shoeColor || "#333";
        ctx.fillStyle = shoeCol;
        drawRoundedRect(ctx, -16, -c.h/2 + 63, 10, 4, 2);
        drawRoundedRect(ctx, 6, -c.h/2 + 63, 10, 4, 2);

        ctx.restore();
    }

    return {
        draw: function(ctx, canvas) {
            ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center"; ctx.fillStyle = "#FFD700"; ctx.font = "bold 36px Impact";
            ctx.fillText("SELECT YOUR SKATER", canvas.width / 2, 60);

            const keys = Object.keys(window.Characters.list);
            const totalWidth = canvas.width - 100;
            const spacing = totalWidth / (keys.length);
            const startX = 50 + (spacing / 2);

            keys.forEach((key, i) => {
                const c = window.Characters.list[key];
                const x = startX + (i * spacing); 
                const y = 200;
                
                if (i === selectedIndex) { 
                    ctx.fillStyle = "rgba(0, 255, 170, 0.15)"; 
                    drawRoundedRect(ctx, x - 45, y - 80, 90, 175, 10);
                }
                
                drawCharacter(ctx, x, y, c);
                
                ctx.font = "bold 13px Courier New"; 
                ctx.textAlign = "center";
                ctx.fillStyle = (i === selectedIndex) ? "#00FFAA" : "white";
                ctx.fillText(c.name.toUpperCase(), x, y + 105);
            });
            
            ctx.fillStyle = "#00E5FF"; ctx.font = "16px Courier New";
            ctx.fillText("PRESS ENTER TO START", canvas.width / 2, 420);
        },
        moveSelection: (dir) => {
            const keys = Object.keys(window.Characters.list);
            selectedIndex = (selectedIndex + dir + keys.length) % keys.length;
        },
        confirmSelection: () => {
            const keys = Object.keys(window.Characters.list);
            window.Characters.selected = keys[selectedIndex];
            window.GameAPI.startFromTitle();
        }
    };
})();