// --- EMERGENCIES FILE ---
// Change activeEmergency to: 'fire', 'flood', 'wind', 'tornado', or 'poweroutage'

let activeEmergency = 'fire';

// Track multiple independent fire hazards that spawn in random locations
let cabinFires = [];
let fireSpawnTimer = 0;

const emergencyTypes = {
    fire: {
        name: "🔥 CABIN FIRE SPREADING!",
        color: "#ff3300",
        bgColor: "#2a1515",
        damageRate: 3,
        drawEffect: function(ctx) {
            let time = Date.now() / 100;

            // Periodically spawn new fire hotspots across the cabin (capped at 4 max)
            fireSpawnTimer++;
            if (fireSpawnTimer % 260 === 0 && cabinFires.length < 4) {
                let randomX = 150 + Math.random() * 600;
                let randomY = 70 + Math.random() * 330;
                
                // Only natural realistic flame styles
                const styles = ['campfire', 'roaringInferno', 'wildfire', 'emberBurn'];
                let chosenStyle = styles[Math.floor(Math.random() * styles.length)];

                cabinFires.push({
                    x: randomX,
                    y: randomY,
                    size: 35 + Math.random() * 15,
                    life: 0,
                    intensity: 100, // 100% active fire health
                    style: chosenStyle
                });
            }

            ctx.save();
            
            // Draw and update each independent fire hotspot with organic realistic fire aesthetics
            for (let i = cabinFires.length - 1; i >= 0; i--) {
                let f = cabinFires[i];
                if (f.intensity <= 0) {
                    cabinFires.splice(i, 1);
                    continue;
                }

                f.life++;

                ctx.save();
                ctx.translate(f.x, f.y);

                let intensityScale = f.intensity / 100;

                // Outer Smokey Glow / Atmospheric Heat Haze for all fires
                let smokeGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, f.size * 1.8);
                smokeGradient.addColorStop(0, `rgba(50, 15, 5, ${0.45 * intensityScale})`);
                smokeGradient.addColorStop(0.5, `rgba(100, 30, 0, ${0.2 * intensityScale})`);
                smokeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = smokeGradient;
                ctx.beginPath();
                ctx.arc(0, 0, f.size * 1.8, 0, Math.PI * 2);
                ctx.fill();

                if (f.style === 'campfire') {
                    // Campfire Style: Stable base with flickering pointed tongues of flame reaching upward
                    let tongues = 6;
                    for (let t = 0; t < tongues; t++) {
                        let sway = Math.sin(time * 2 + t * 1.5) * (f.size * 0.15);
                        let height = f.size * (0.8 + Math.cos(time + t) * 0.25);

                        ctx.fillStyle = `rgba(255, 70, 0, ${0.85 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(sway - f.size * 0.2, 5);
                        ctx.lineTo(sway + (t - tongues/2) * 6, -height);
                        ctx.lineTo(sway + f.size * 0.2, 5);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = `rgba(255, 200, 0, ${0.9 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(sway * 0.5 - f.size * 0.1, 2);
                        ctx.lineTo(sway * 0.5 + (t - tongues/2) * 4, -height * 0.7);
                        ctx.lineTo(sway * 0.5 + f.size * 0.1, 2);
                        ctx.closePath();
                        ctx.fill();
                    }

                } else if (f.style === 'roaringInferno') {
                    // Roaring Inferno Style: Aggressive, tall, sharp multi-layered licking flames
                    let flameLayers = 8;
                    for (let l = 0; l < flameLayers; l++) {
                        let wave = Math.sin(time * 2.5 + l * 0.8) * (f.size * 0.3);
                        let tipHeight = f.size * (1.1 + Math.abs(Math.sin(time + l) * 0.4));
                        let baseWidth = f.size * 0.25;

                        ctx.fillStyle = `rgba(220, 20, 0, ${0.8 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(-baseWidth + wave * 0.5, 10);
                        ctx.lineTo(wave, -tipHeight - ((f.life + l * 3) % 12));
                        ctx.lineTo(baseWidth + wave * 0.5, 10);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = `rgba(255, 120, 0, ${0.85 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(-baseWidth * 0.7 + wave * 0.3, 5);
                        ctx.lineTo(wave * 0.7, -tipHeight * 0.75 - ((f.life + l * 5) % 10));
                        ctx.lineTo(baseWidth * 0.7 + wave * 0.3, 5);
                        ctx.closePath();
                        ctx.fill();
                    }

                } else if (f.style === 'wildfire') {
                    // Wildfire Style: Chaotic, wide spreading flame front with fierce sharp peaks
                    let spikes = 7;
                    for (let s = 0; s < spikes; s++) {
                        let spanX = ((s / (spikes - 1)) - 0.5) * (f.size * 1.4);
                        let erraticHeight = f.size * (0.9 + Math.sin(time * 3 + s * 2) * 0.35);

                        ctx.fillStyle = s % 2 === 0 ? `rgba(255, 90, 0, ${0.9 * intensityScale})` : `rgba(255, 160, 0, ${0.85 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(spanX - f.size * 0.18, 8);
                        ctx.lineTo(spanX + Math.sin(time + s) * 8, -erraticHeight - (f.life % 14));
                        ctx.lineTo(spanX + f.size * 0.18, 8);
                        ctx.closePath();
                        ctx.fill();
                    }

                } else {
                    // Ember Burn Style: Hot bubbling base with sharp rising sparks and flickering tongues
                    let embers = 6;
                    for (let e = 0; e < embers; e++) {
                        let ox = Math.sin(time * 1.8 + e) * (f.size * 0.4);
                        let oy = -Math.abs(Math.cos(time * 1.2 + e) * (f.size * 0.5));
                        
                        ctx.fillStyle = `rgba(255, 60, 0, ${0.8 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(ox - f.size * 0.15, 5);
                        ctx.lineTo(ox, oy - 10);
                        ctx.lineTo(ox + f.size * 0.15, 5);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = `rgba(255, 200, 50, ${0.9 * intensityScale})`;
                        ctx.beginPath();
                        ctx.moveTo(ox - f.size * 0.08, 2);
                        ctx.lineTo(ox, oy);
                        ctx.lineTo(ox + f.size * 0.08, 2);
                        ctx.closePath();
                        ctx.fill();
                    }
                }

                // White-hot needle cores at the tips of the flames for realistic intense heat
                for (let c = 0; c < 3; c++) {
                    let cx = Math.sin(time * 4 + c) * (f.size * 0.2);
                    let cy = -10 - ((f.life * 1.5 + c * 6) % 18);

                    ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * intensityScale})`;
                    ctx.beginPath();
                    ctx.arc(cx, cy, f.size * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Warning marker above the fire showing status
                let flash = Math.floor(Date.now() / 200) % 2 === 0;
                ctx.fillStyle = flash ? "#ff0000" : "#ffaa00";
                ctx.font = "bold 10px 'Segoe UI'";
                ctx.textAlign = "center";
                ctx.fillText("🔥 FIRE (" + Math.floor(f.intensity) + "%)", 0, -f.size - 22);
                
                ctx.restore();
            }

            ctx.restore();
        }
    },
    flood: {
        name: "🌊 WATER LEAK!",
        color: "#00aaff",
        bgColor: "#102030",
        damageRate: 2.5,
        drawEffect: function(ctx) {
            ctx.fillStyle = "rgba(0, 170, 255, 0.3)";
            ctx.fillRect(100, 360, 725, 60);
            ctx.fillStyle = "#ffffff";
            ctx.font = "12px 'Segoe UI'";
            ctx.fillText("🌊 FLOODING!", 120, 385);
        }
    }
};

function getCurrentEmergency() {
    return emergencyTypes[activeEmergency] || emergencyTypes['fire'];
}