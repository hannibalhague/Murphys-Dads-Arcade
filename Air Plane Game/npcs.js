// ==========================================
// LEVEL 1: NPCS FILE (15-SECOND GRADUAL FULL-BODY FIRE SPREAD)
// ==========================================
const npcTemplates = [
    // Boys / Male Characters
    { name: "Dad", hat: "Tie Hat", shirt: "#7f8c8d", pants: "#2c3e50", shoes: "#111111", uniform: "Corporate", type: "normal", gender: "boy", hairColor: "#4e342e" },
    { name: "Murphy", hat: "Mohawk", shirt: "#000000", pants: "#e91e63", shoes: "#212121", uniform: "Rebel", type: "normal", gender: "boy", hairColor: "#ec4899" },
    { name: "Grandpa", hat: "Flat Cap", shirt: "#9e9e9e", pants: "#424242", shoes: "#5d4037", uniform: "Classic", type: "normal", gender: "boy", hairColor: "#94a3b8" },
    { name: "Charlie", hat: "Chef Hat", shirt: "#ffffff", pants: "#000000", shoes: "#ffffff", uniform: "Culinary", type: "normal", gender: "boy", hairColor: "#334155" },
    { name: "Paul", hat: "Pilot Cap", shirt: "#1a237e", pants: "#0d47a1", shoes: "#000000", uniform: "Aviation", type: "normal", gender: "boy", hairColor: "#1e293b" },
    { name: "Murphys twin", hat: "Baseball Cap", shirt: "#ff5722", pants: "#3e2723", shoes: "#ffffff", uniform: "Sporty", type: "normal", gender: "boy", hairColor: "#78350f" },
    { name: "Frank", hat: "Straw Hat", shirt: "#795548", pants: "#33691e", shoes: "#4e342e", uniform: "Workwear", type: "normal", gender: "boy", hairColor: "#d97706" },
    { name: "Steve", hat: "Hoodie", shirt: "#009688", pants: "#8d6e63", shoes: "#333333", uniform: "Campus", type: "normal", gender: "boy", hairColor: "#1c1917" },
    { name: "Stan", hat: "Peaked Cap", shirt: "#37474f", pants: "#263238", shoes: "#000000", uniform: "Security", type: "normal", gender: "boy", hairColor: "#0f172a" },
    { name: "Hugo", hat: "Beanie", shirt: "#10b981", pants: "#065f46", shoes: "#1c1917", uniform: "Indie", type: "normal", gender: "boy", hairColor: "#b45309" },
    { name: "Bill", hat: "Bandana", shirt: "#dc2626", pants: "#18181b", shoes: "#000000", uniform: "Biker", type: "normal", gender: "boy", hairColor: "#18181b" },

    // Girls / Female Characters (Updated with Dress Uniforms)
    { name: "Tina", hat: "Sunhat", shirt: "#e91e63", pants: "#f472b6", shoes: "#ffeb3b", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#f59e0b" },
    { name: "Grace", hat: "Beanie", shirt: "#212121", pants: "#4b5563", shoes: "#000000", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#ef4444" },
    { name: "Dana", hat: "Headmirror", shirt: "#00bcd4", pants: "#2dd4bf", shoes: "#009688", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#3b82f6" },
    { name: "Amy", hat: "Beret", shirt: "#8bc34a", pants: "#a3e635", shoes: "#e91e63", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#8b5cf6" },
    { name: "Roxy", hat: "Spikes", shirt: "#e91e63", pants: "#fb7185", shoes: "#ff0000", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#06b6d4" },
    { name: "Sue", hat: "Goggles", shirt: "#607d8b", pants: "#94a3b8", shoes: "#9c27b0", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#10b981" },
    { name: "Vicky", hat: "Tiara", shirt: "#ffd700", pants: "#fef08a", shoes: "#ffffff", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#fbbf24" },
    { name: "Tess", hat: "Glasses", shirt: "#ab47bc", pants: "#e879f9", shoes: "#795548", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#57534e" },
    { name: "Chloe", hat: "Cap", shirt: "#3b82f6", pants: "#93c5fd", shoes: "#ffffff", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#f97316" },
    { name: "ChefChloe", hat: "Chef Hat", shirt: "#f43f5e", pants: "#fda4af", shoes: "#000000", uniform: "Dress", type: "normal", gender: "girl", hairColor: "#e11d48" },

    // Wheel Characters (Mobility Assist / Wheelchair Users)
    { name: "Walter", hat: "Cap", shirt: "#3b82f6", pants: "#1e3a8a", shoes: "#ffffff", uniform: "Wheelchair", type: "wheel", gender: "boy", hairColor: "#334155" },
    { name: "Rachel", hat: "Headband", shirt: "#ec4899", pants: "#f472b6", shoes: "#ffffff", uniform: "DressWheelchair", type: "wheel", gender: "girl", hairColor: "#f43f5e" },
    { name: "Spencer", hat: "Helmet", shirt: "#10b981", pants: "#047857", shoes: "#000000", uniform: "Wheelchair", type: "wheel", gender: "boy", hairColor: "#1e293b" },
    { name: "Daisy", hat: "Bow", shirt: "#8b5cf6", pants: "#c4b5fd", shoes: "#ffffff", uniform: "DressWheelchair", type: "wheel", gender: "girl", hairColor: "#a855f7" },

    // Babies (Boy & Girl)
    { name: "Benny", hat: "Pacifier", shirt: "#67e8f9", pants: "#bae6fd", shoes: "#ffffff", uniform: "Baby", type: "baby", gender: "boy", hairColor: "#fde047" },
    { name: "Bella", hat: "Bow", shirt: "#f472b6", pants: "#fbcfe8", shoes: "#ffffff", uniform: "Baby", type: "baby", gender: "girl", hairColor: "#fb923c" },
    { name: "Brody", hat: "Cap", shirt: "#facc15", pants: "#fef08a", shoes: "#ffffff", uniform: "Baby", type: "baby", gender: "boy", hairColor: "#facc15" },
    { name: "Brianna", hat: "Headband", shirt: "#a78bfa", pants: "#ede9fe", shoes: "#ffffff", uniform: "Baby", type: "baby", gender: "girl", hairColor: "#c084fc" },

    // Heavyweight Passengers (Boy & Girl)
    { name: "Barry", hat: "Cap", shirt: "#854d0e", pants: "#713f12", shoes: "#292524", uniform: "Heavy", type: "heavy", gender: "boy", hairColor: "#451a03" },
    { name: "Bertha", hat: "Sunhat", shirt: "#9333ea", pants: "#d8b4fe", shoes: "#18181b", uniform: "HeavyDress", type: "heavy", gender: "girl", hairColor: "#701a75" },
    { name: "Bruno", hat: "Flat Cap", shirt: "#1e3a8a", pants: "#172554", shoes: "#0f172a", uniform: "Heavy", type: "heavy", gender: "boy", hairColor: "#172554" },
    { name: "Brenda", hat: "Beanie", shirt: "#047857", pants: "#6ee7b7", shoes: "#111827", uniform: "HeavyDress", type: "heavy", gender: "girl", hairColor: "#064e3b" },

    // Animals to Rescue
    { name: "Max", hat: "Collar", shirt: "#d97706", pants: "#b45309", shoes: "#78350f", uniform: "Animal", type: "animal", gender: "boy", petType: "dog", furColor: "#f59e0b", accentColor: "#b45309" },
    { name: "Luna", hat: "Collar", shirt: "#9ca3af", pants: "#4b5563", shoes: "#1f2937", uniform: "Animal", type: "animal", gender: "girl", petType: "cat", furColor: "#fb923c", accentColor: "#1e293b" },
    { name: "Bolt", hat: "Collar", shirt: "#3b82f6", pants: "#1d4ed8", shoes: "#1e3a8a", uniform: "Animal", type: "animal", gender: "boy", petType: "dog", furColor: "#94a3b8", accentColor: "#334155" },
    { name: "Toby", hat: "Collar", shirt: "#ef4444", pants: "#b91c1c", shoes: "#7f1d1d", uniform: "Animal", type: "animal", gender: "girl", petType: "cat", furColor: "#facc15", accentColor: "#ca8a04" },
    { name: "Puggy", hat: "Collar", shirt: "#10b981", pants: "#047857", shoes: "#065f46", uniform: "Animal", type: "animal", gender: "boy", petType: "dog", furColor: "#d97706", accentColor: "#78350f" },
    { name: "Milo", hat: "Collar", shirt: "#8b5cf6", pants: "#6d28d9", shoes: "#4c1d95", uniform: "Animal", type: "animal", gender: "boy", petType: "cat", furColor: "#f97316", accentColor: "#c2410c" }
];

// Global fire management system tracking burning entities and fire spread
let activeFires = []; 

function updateEntityFires(allEntities, playerObj) {
    for (let i = activeFires.length - 1; i >= 0; i--) {
        let fireNode = activeFires[i];
        if (!fireNode || !fireNode.entity) {
            activeFires.splice(i, 1);
            continue;
        }

        let ent = fireNode.entity;
        fireNode.duration++;
        
        // Scaled to reach full intensity over 15 seconds (~900 frames at 60fps)
        fireNode.intensity = Math.min(2.4, 0.8 + (fireNode.duration / 900) * 1.6); 

        ent.isBurning = true;
        ent.burnDuration = fireNode.duration;

        // Spread fire outward to nearby passengers and player over time (paced slower)
        if (fireNode.duration > 180 && fireNode.duration % 90 === 0) {
            let spreadRadius = 35 * fireNode.intensity;

            if (typeof passengers !== 'undefined') {
                for (let other of passengers) {
                    if (!other.isBurning) {
                        let dist = Math.hypot((ent.x || ent.px || 0) - (other.x || 0), (ent.y || other.y || 0) - (other.y || 0));
                        if (dist < spreadRadius && Math.random() < 0.4) {
                            other.isBurning = true;
                            other.burnDuration = 1;
                            activeFires.push({ entity: other, duration: 1, intensity: 0.8 });
                        }
                    }
                }
            }

            if (playerObj && !playerObj.isBurning) {
                let pDist = Math.hypot((ent.x || ent.px || 0) - playerObj.x, (ent.y || ent.py || 0) - playerObj.y);
                if (pDist < spreadRadius && Math.random() < 0.2) {
                    playerObj.isBurning = true;
                    playerObj.burnDuration = 1;
                    activeFires.push({ entity: playerObj, duration: 1, intensity: 0.8 });
                }
            }
        }

        if (fireNode.duration > 1200) {
            ent.isBurning = false;
            activeFires.splice(i, 1);
        }
    }
}

function triggerPassengerBurn(targetEntity) {
    if (!targetEntity.isBurning) {
        targetEntity.isBurning = true;
        targetEntity.burnDuration = 1;
        activeFires.push({
            entity: targetEntity,
            duration: 1,
            intensity: 0.8
        });
    }
}

function drawNpcLimb(ctx, x1, y1, x2, y2, bendDir = 1, thickness = 3, color = "#ffdbac") {
    let midX = (x1 + x2) / 2 + (bendDir * 5);
    let midY = (y1 + y2) / 2 + 3;

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();
}

// Sub-flame utility to cover wider sections of the body as it consumes the NPC
function drawSubFlame(ctx, x, y, scale = 1.0) {
    let time = Date.now() / 45;
    ctx.save();
    ctx.translate(x, y);

    let flickerHeight = (12 + Math.abs(Math.sin(time * 2.8 + x) * 6)) * scale;
    let widthFactor = 4.5 * scale;

    // Outer red layer
    ctx.fillStyle = "rgba(220, 38, 38, 0.82)";
    ctx.beginPath();
    ctx.moveTo(-widthFactor, 3);
    ctx.quadraticCurveTo(0, -flickerHeight * 0.6, 1.5, -flickerHeight);
    ctx.quadraticCurveTo(widthFactor * 0.8, -flickerHeight * 0.4, widthFactor, 3);
    ctx.closePath();
    ctx.fill();

    // Mid orange layer
    ctx.fillStyle = "rgba(249, 115, 22, 0.9)";
    ctx.beginPath();
    ctx.moveTo(-widthFactor * 0.6, 2);
    ctx.quadraticCurveTo(0, -flickerHeight * 0.5, 1, -flickerHeight * 0.75);
    ctx.quadraticCurveTo(widthFactor * 0.5, -flickerHeight * 0.3, widthFactor * 0.6, 2);
    ctx.closePath();
    ctx.fill();

    // Inner core
    ctx.fillStyle = "rgba(254, 240, 138, 0.95)";
    ctx.beginPath();
    ctx.moveTo(-1.5, 0);
    ctx.lineTo(0, -flickerHeight * 0.45);
    ctx.lineTo(1.5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawPassengerBodyContent(ctx, npcType, gender, template, offsetX, offsetY, isBurning = false, burnDuration = 0) {
    let hairColor = template.hairColor || "#334155";
    let shirtColor = template.shirt || "#3b82f6";
    let pantsColor = template.pants || "#1e3a8a";
    let panicWave = Math.sin(performance.now() * 0.01) * 4;

    if (npcType === 'baby') {
        drawNpcLimb(ctx, offsetX + 9, offsetY + 24, offsetX + 7, offsetY + 32, -1, 3, shirtColor);
        drawNpcLimb(ctx, offsetX + 19, offsetY + 24, offsetX + 21, offsetY + 32, 1, 3, shirtColor);

        ctx.fillStyle = template.shoes;
        ctx.fillRect(offsetX + 5, offsetY + 32, 4, 4);
        ctx.fillRect(offsetX + 19, offsetY + 32, 4, 4);

        ctx.fillStyle = shirtColor;
        ctx.fillRect(offsetX + 8, offsetY + 18, 12, 14);

        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(offsetX + 14, offsetY + 11, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hairColor;
        ctx.fillRect(offsetX + 13, offsetY + 3, 2, 3);

        ctx.fillStyle = "#000000";
        ctx.fillRect(offsetX + 11, offsetY + 9, 2, 2);
        ctx.fillRect(offsetX + 15, offsetY + 9, 2, 2);

        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(offsetX + 12, offsetY + 13, 4, 2);

        if (gender === 'girl') {
            ctx.fillStyle = "#db2777";
            ctx.fillRect(offsetX + 12, offsetY + 2, 4, 3);
        } else {
            ctx.fillStyle = "#f43f5e";
            ctx.fillRect(offsetX + 13, offsetY + 2, 2, 4);
        }

    } else if (npcType === 'wheel') {
        ctx.fillStyle = pantsColor;
        ctx.fillRect(offsetX + 5, offsetY + 3, 14, 23);
        
        ctx.fillStyle = template.shoes;
        ctx.fillRect(offsetX + 15, offsetY + 33, 5, 4);

        ctx.fillStyle = pantsColor;
        ctx.fillRect(offsetX + 9, offsetY + 23, 10, 10);

        ctx.fillStyle = shirtColor;
        ctx.fillRect(offsetX + 6, offsetY + 11, 14, 13);

        drawNpcLimb(ctx, offsetX + 6, offsetY + 14, offsetX - 2, offsetY + 22, -1, 3, "#ffdbac");
        drawNpcLimb(ctx, offsetX + 20, offsetY + 14, offsetX + 26, offsetY + 22, 1, 3, "#ffdbac");

        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(offsetX + 13, offsetY + 5, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hairColor;
        ctx.fillRect(offsetX + 7, offsetY + 1, 12, 3);

        ctx.fillStyle = "#000000";
        ctx.fillRect(offsetX + 10, offsetY + 4, 2, 2);
        ctx.fillRect(offsetX + 14, offsetY + 4, 2, 2);

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(offsetX + 12, offsetY + 30, 8, 0, Math.PI * 2);
        ctx.stroke();

    } else if (npcType === 'animal') {
        let isCat = template.petType === 'cat';
        let fur = template.furColor || "#f59e0b";
        let accent = template.accentColor || "#b45309";
        
        ctx.fillStyle = fur;
        ctx.beginPath();
        ctx.ellipse(offsetX + 14, offsetY + 26, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(offsetX + 14, offsetY + 16, 7, 0, Math.PI * 2);
        ctx.fill();

        drawNpcLimb(ctx, offsetX + 8, offsetY + 30, offsetX + 6 + panicWave, offsetY + 36, -1, 3, fur);
        drawNpcLimb(ctx, offsetX + 20, offsetY + 30, offsetX + 22 - panicWave, offsetY + 36, 1, 3, fur);

        if (isCat) {
            ctx.fillStyle = fur;
            ctx.beginPath();
            ctx.moveTo(offsetX + 8, offsetY + 12);
            ctx.lineTo(offsetX + 11, offsetY + 5);
            ctx.lineTo(offsetX + 13, offsetY + 11);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(offsetX + 15, offsetY + 11);
            ctx.lineTo(offsetX + 17, offsetY + 5);
            ctx.lineTo(offsetX + 20, offsetY + 12);
            ctx.fill();

            ctx.fillStyle = "#000000";
            ctx.fillRect(offsetX + 11, offsetY + 14, 2, 2);
            ctx.fillRect(offsetX + 15, offsetY + 14, 2, 2);
        } else {
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(offsetX + 8, offsetY + 13, 3.5, 0, Math.PI * 2);
            ctx.arc(offsetX + 20, offsetY + 13, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#000000";
            ctx.fillRect(offsetX + 11, offsetY + 14, 2, 2);
            ctx.fillRect(offsetX + 15, offsetY + 14, 2, 2);
        }

    } else if (npcType === 'heavy' && gender === 'girl') {
        // Heavyweight Girl Dress Rendering
        ctx.fillStyle = template.shoes;
        ctx.fillRect(offsetX + 8, offsetY + 38, 8, 6);
        ctx.fillRect(offsetX + 18, offsetY + 38, 8, 6);

        // Dress Skirt (A-line/Trapezoid)
        ctx.fillStyle = pantsColor;
        ctx.beginPath();
        ctx.moveTo(offsetX + 6, offsetY + 18);
        ctx.lineTo(offsetX + 30, offsetY + 18);
        ctx.lineTo(offsetX + 34, offsetY + 38);
        ctx.lineTo(offsetX + 2, offsetY + 38);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = shirtColor;
        ctx.fillRect(offsetX + 2, offsetY + 10, 32, 10);

        drawNpcLimb(ctx, offsetX + 2, offsetY + 14, offsetX - 6, offsetY + 24, -1, 5, "#ffdbac");
        drawNpcLimb(ctx, offsetX + 34, offsetY + 14, offsetX + 42, offsetY + 24, 1, 5, "#ffdbac");

        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(offsetX + 18, offsetY + 6, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.fillRect(offsetX + 14, offsetY + 4, 2, 2);
        ctx.fillRect(offsetX + 20, offsetY + 4, 2, 2);

        ctx.fillStyle = hairColor;
        ctx.fillRect(offsetX + 11, offsetY + 0, 14, 4);

    } else if (npcType === 'heavy') {
        ctx.fillStyle = template.shoes;
        ctx.fillRect(offsetX + 6, offsetY + 38, 10, 6);
        ctx.fillRect(offsetX + 20, offsetY + 38, 10, 6);

        drawNpcLimb(ctx, offsetX + 10, offsetY + 26, offsetX + 8 + panicWave, offsetY + 38, -1, 6, pantsColor);
        drawNpcLimb(ctx, offsetX + 26, offsetY + 26, offsetX + 28 - panicWave, offsetY + 38, 1, 6, pantsColor);

        ctx.fillStyle = shirtColor;
        ctx.fillRect(offsetX + 2, offsetY + 10, 32, 16);

        drawNpcLimb(ctx, offsetX + 2, offsetY + 14, offsetX - 6, offsetY + 24, -1, 5, "#ffdbac");
        drawNpcLimb(ctx, offsetX + 34, offsetY + 14, offsetX + 42, offsetY + 24, 1, 5, "#ffdbac");

        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(offsetX + 18, offsetY + 6, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.fillRect(offsetX + 14, offsetY + 4, 2, 2);
        ctx.fillRect(offsetX + 20, offsetY + 4, 2, 2);

        ctx.fillStyle = hairColor;
        ctx.fillRect(offsetX + 11, offsetY + 0, 14, 4);

    } else if (npcType === 'normal' && gender === 'girl') {
        // Standard Girl Dress Rendering
        ctx.fillStyle = template.shoes;
        ctx.fillRect(offsetX + 7, offsetY + 40, 5, 4);
        ctx.fillRect(offsetX + 18, offsetY + 40, 5, 4);

        // Dress Skirt (A-line/Trapezoid)
        ctx.fillStyle = pantsColor;
        ctx.beginPath();
        ctx.moveTo(offsetX + 5, offsetY + 20);
        ctx.lineTo(offsetX + 23, offsetY + 20);
        ctx.lineTo(offsetX + 26, offsetY + 40);
        ctx.lineTo(offsetX + 2, offsetY + 40);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = shirtColor;
        ctx.fillRect(offsetX + 5, offsetY + 14, 18, 8);

        drawNpcLimb(ctx, offsetX + 5, offsetY + 16, offsetX - 4, offsetY + 25 + panicWave, -1, 3.5, "#ffdbac");
        drawNpcLimb(ctx, offsetX + 23, offsetY + 16, offsetX + 32, offsetY + 25 - panicWave, 1, 3.5, "#ffdbac");

        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(offsetX + 14, offsetY + 9, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hairColor;
        ctx.fillRect(offsetX + 8, offsetY + 2, 12, 4);

        ctx.fillStyle = "#000000";
        ctx.fillRect(offsetX + 11, offsetY + 7, 2, 2);
        ctx.fillRect(offsetX + 15, offsetY + 7, 2, 2);

    } else {
        ctx.fillStyle = template.shoes;
        ctx.fillRect(offsetX + 6, offsetY + 40, 6, 4);
        ctx.fillRect(offsetX + 16, offsetY + 40, 6, 4);

        drawNpcLimb(ctx, offsetX + 9, offsetY + 26, offsetX + 7 + panicWave, offsetY + 40, -1, 4, pantsColor);
        drawNpcLimb(ctx, offsetX + 19, offsetY + 26, offsetX + 21 - panicWave, offsetY + 40, 1, 4, pantsColor);

        ctx.fillStyle = shirtColor;
        ctx.fillRect(offsetX + 5, offsetY + 14, 18, 14);

        drawNpcLimb(ctx, offsetX + 5, offsetY + 16, offsetX - 4, offsetY + 25 + panicWave, -1, 3.5, "#ffdbac");
        drawNpcLimb(ctx, offsetX + 23, offsetY + 16, offsetX + 32, offsetY + 25 - panicWave, 1, 3.5, "#ffdbac");

        ctx.fillStyle = "#ffdbac";
        ctx.beginPath();
        ctx.arc(offsetX + 14, offsetY + 9, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hairColor;
        ctx.fillRect(offsetX + 8, offsetY + 2, 12, 4);

        ctx.fillStyle = "#000000";
        ctx.fillRect(offsetX + 11, offsetY + 7, 2, 2);
        ctx.fillRect(offsetX + 15, offsetY + 7, 2, 2);
    }

    // --- 15-SECOND SLOW GRADUAL FULL-BODY FIRE SPREAD MECHANIC ---
    if (isBurning) {
        let intensity = Math.min(2.4, 0.8 + (burnDuration / 900) * 1.6);
        let time = Date.now() / 45;

        // 1. HEAD FIRE (Immediate ignition on the head)
        let headFlameX = offsetX + (npcType === 'heavy' ? 18 : 14);
        let headFlameY = offsetY + (npcType === 'baby' ? 2 : (npcType === 'heavy' ? -4 : (npcType === 'animal' ? 8 : -1)));

        ctx.save();
        ctx.translate(headFlameX, headFlameY);

        let heatGlow = ctx.createRadialGradient(0, -6, 2, 0, -6, 20 * intensity);
        heatGlow.addColorStop(0, "rgba(255, 100, 0, 0.45)");
        heatGlow.addColorStop(0.6, "rgba(180, 40, 10, 0.15)");
        heatGlow.addColorStop(1, "rgba(50, 50, 50, 0)");
        ctx.fillStyle = heatGlow;
        ctx.beginPath();
        ctx.arc(0, -6, 20 * intensity, 0, Math.PI * 2);
        ctx.fill();

        let tongueCount = 5;
        for (let t = 0; t < tongueCount; t++) {
            let sway = Math.sin(time * 3.2 + t * 1.5) * (3.5 * intensity);
            let flickerHeight = (12 + Math.abs(Math.cos(time * 1.8 + t) * 7)) * intensity;
            let widthFactor = 4.5 * intensity;

            ctx.fillStyle = "rgba(220, 38, 38, 0.82)";
            ctx.beginPath();
            ctx.moveTo(sway - widthFactor, 2);
            ctx.quadraticCurveTo(sway + (t - tongueCount / 2) * 2, -flickerHeight * 0.6, sway + (t - tongueCount / 2) * 3, -flickerHeight);
            ctx.quadraticCurveTo(sway + widthFactor * 0.8, -flickerHeight * 0.4, sway + widthFactor, 2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(249, 115, 22, 0.9)";
            ctx.beginPath();
            ctx.moveTo(sway * 0.6 - widthFactor * 0.6, 1);
            ctx.quadraticCurveTo(sway * 0.6 + (t - tongueCount / 2) * 1.5, -flickerHeight * 0.5, sway * 0.6 + (t - tongueCount / 2) * 2, -flickerHeight * 0.75);
            ctx.quadraticCurveTo(sway * 0.6 + widthFactor * 0.5, -flickerHeight * 0.3, sway * 0.6 + widthFactor * 0.6, 1);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(254, 240, 138, 0.95)";
            ctx.beginPath();
            ctx.moveTo(-1.5, 0);
            ctx.lineTo(sway * 0.3, -flickerHeight * 0.45);
            ctx.lineTo(1.5, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        let baseCenterX = offsetX + (npcType === 'heavy' ? 18 : 14);

        // 2. TORSO BURN (Engulfs chest & arms after ~4.5 seconds / 270 frames)
        if (burnDuration > 270) {
            let torsoY = offsetY + (npcType === 'heavy' ? 16 : 18);
            drawSubFlame(ctx, baseCenterX - 10, torsoY - 2, 1.0);
            drawSubFlame(ctx, baseCenterX + 10, torsoY, 1.05);
            drawSubFlame(ctx, baseCenterX, torsoY + 4, 1.1);
        }

        // 3. FULL LOWER BODY & LEGS BURN (Completely engulfs lower body around 9.5 seconds / 540 frames)
        if (burnDuration > 540) {
            let lowerY = offsetY + (npcType === 'heavy' ? 30 : 28);
            drawSubFlame(ctx, baseCenterX - 12, lowerY - 4, 1.2);
            drawSubFlame(ctx, baseCenterX + 12, lowerY - 2, 1.25);
            drawSubFlame(ctx, baseCenterX - 5, lowerY + 4, 1.3);
            drawSubFlame(ctx, baseCenterX + 5, lowerY + 2, 1.35);
        }

        // 4. MAXIMUM ENCYCLOPEDIC ENGULFMENT (Fully consumed by fire at 15 seconds / 900+ frames)
        if (burnDuration > 900) {
            let fullBodyY = offsetY + (npcType === 'heavy' ? 22 : 20);
            drawSubFlame(ctx, baseCenterX - 14, fullBodyY - 8, 1.4);
            drawSubFlame(ctx, baseCenterX + 14, fullBodyY - 6, 1.45);
            drawSubFlame(ctx, baseCenterX - 8, fullBodyY + 10, 1.5);
            drawSubFlame(ctx, baseCenterX + 8, fullBodyY + 8, 1.55);
            drawSubFlame(ctx, baseCenterX, fullBodyY - 2, 1.6);
        }
    }
}

function drawPassenger(ctx, p, isCarried = false) {
    let isBurning = p.isBurning || false;
    let burnDuration = p.burnDuration || (p.template && p.template.burnDuration) || 0;

    if (isCarried) {
        ctx.save();
        let npcType = p.template && p.template.type ? p.template.type : 'normal';
        let gender = p.template && p.template.gender ? p.template.gender : 'boy';

        ctx.translate(player.x - 12, player.y - 6);
        drawPassengerBodyContent(ctx, npcType, gender, p.template, 0, 0, isBurning, burnDuration);
        ctx.restore();
        return;
    }

    let px = p.x;
    let py = p.y;
    let npcType = p.template && p.template.type ? p.template.type : 'normal';
    let gender = p.template && p.template.gender ? p.template.gender : 'boy';

    drawPassengerBodyContent(ctx, npcType, gender, p.template, px, py, isBurning, burnDuration);
}