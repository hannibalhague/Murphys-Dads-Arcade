// =======================
// js/characters.js
// =======================
window.Characters = {
    selected: "murphy",
    list: {
        murphy: {
            name: "Murphy StJohn",
            shirt: "#4CAF50",
            pants: "#1A237E",
            skin: "#FFDBAC",
            hair: "#FBC02D", 
            w: 26, h: 50,
            role: "human",
            mouthStyle: "smile",
            noseSize: 3,
            jerseyNumber: "67",
            hairStyle: "spiky",
            flipped: false
        },
        girl1: {
            name: "Hayley",
            shirt: "#E91E63",
            pants: "#E91E63",
            skin: "#F1C27D",
            hair: "#1A1A1A",
            w: 20, h: 60,
            role: "human",
            mouthStyle: "neutral",
            noseSize: 2,
            flipped: false
        },
        girl2: {
            name: "Adrianna",
            shirt: "#FFFFFF",
            pants: "#4A148C",
            skin: "#E0AC69",
            hair: "#4E342E", 
            w: 31, h: 55,
            role: "human",
            mouthStyle: "smile",
            noseSize: 2,
            hairStyle: "long-straight",
            bottomType: "skirt",
            flipped: false
        },
        guy2: {
            name: "Mikey",
            shirt: "#333333",
            pants: "#546E7A",
            skin: "#F3E5AB",
            hair: "#2E1A09",
            w: 36, h: 58,
            role: "human",
            mouthStyle: "stoic",
            noseSize: 4,
            facialHair: "goatee",
            flipped: false
        },
        guy3: {
            name: "William",
            shirt: "#B71C1C",
            pants: "#F5F5F5",
            skin: "#8D5524",
            hair: "#000000",
            w: 35, h: 47,
            role: "human",
            mouthStyle: "neutral",
            noseSize: 4,
            jerseyNumber: "18",
            hairStyle: "curly-long",
            flipped: false
        },
        toby: {
            name: "Toby",
            shirt: "#FF8C00", // Fur color[cite: 1]
            pants: "#FF8C00", // Fur color[cite: 1]
            skin: "#FF8C00",  // Fur color[cite: 1]
            hair: "#FF8C00", 
            w: 28, h: 48,
            role: "cat",
            mouthStyle: "smile",
            noseSize: 2,
            hatStyle: null, // Removed the hat[cite: 1]
            flipped: false
        },
        greyson: {
            name: "Greyson",
            shirt: "#FFFFFF",
            pants: "#1565C0",
            skin: "#D2B48C",
            hair: "#5C4033",
            w: 20, h: 63, // Very skinny and tall[cite: 1]
            role: "human",
            mouthStyle: "smile",
            noseSize: 3,
            hairStyle: "super-curly",
            flipped: false
        },
        hunter: {
            name: "Hunter",
            shirt: "#FFFFFF",
            pants: "#FFFFFF",
            skin: "#D2B48C",
            hair: "#5C4033",
            w: 38, h: 60,
            role: "human",
            mouthStyle: "stoic",
            noseSize: 3,
            hairStyle: "super-curly",
            hatStyle: "baseball-cap",
            hatColor: "#FFFFFF",
            brimColor: "#D32F2F",
            emblem: "deadpool",
            shoeColor: "#000000",
            flipped: false
        },
        zac: {
            name: "Zac",
            shirt: "#FFFFFF",
            pants: "#1976D2",
            skin: "#E0AC69",
            hair: "#C4A482",
            w: 40, h: 66, // Proportional height/width scaling
            role: "human",
            mouthStyle: "smile",
            noseSize: 5,
            hairStyle: "spiky",
            flipped: false
        }
    },
    
    // Global helper method to apply flip state safely via canvas rendering context
    drawFlippedContext: function(ctx, x, y, w, h, isFlipped, drawCallback) {
        ctx.save();
        if (isFlipped) {
            ctx.translate(x + w / 2, y + h / 2);
            ctx.scale(-1, 1);
            ctx.translate(-(x + w / 2), -(y + h / 2));
        }
        drawCallback(ctx);
        ctx.restore();
    }
};