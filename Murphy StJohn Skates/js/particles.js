// =======================
// js/particles.js
// =======================
window.Particles = (() => {

    const GROUND_Y = 265;

    return {
        list: [],

        reset() {
            this.list = [];
        },

        spawnGoldBurst(x, y) {
            for (let i = 0; i < 20; i++) {
                this.list.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 1.5) * 4,
                    life: 29 + Math.random() * 10,
                    color: "#FFD700",
                    size: 4 + Math.random() * 2
                });
            }
        },

        spawnPunchSpark(x, y) {
            for (let i = 0; i < 8; i++) {
                this.list.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    life: 14 + Math.random() * 5,
                    color: "#FFFFFF",
                    size: 6 + Math.random() * 2
                });
            }
        },

        spawnBabyPuff(x, y) {
            for (let i = 0; i < 12; i++) {
                const colors = ["#5D3A1E", "#3E2723", "#212121", "#000000"];
                this.list.push({
                    x,
                    y,
                    vx: (Math.random() - 4.5) * 2,
                    vy: (Math.random() - 4.5) * 2,
                    life: 40 + Math.random() * 8,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 12 + Math.random() * 2
                });
            }
        },

        spawnZombiePuff(x, y) {
            for (let i = 0; i < 12; i++) {
                this.list.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 15 + Math.random() * 10,
                    color: "#32FF32",
                    size: 2 + Math.random() * 2
                });
            }
        },

        spawnZombieVomit(x, y) {
            for (let i = 0; i < 14; i++) {
                this.list.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.2) * 3,
                    life: 20 + Math.random() * 15,
                    size: 2 + Math.random() * 3,
                    color: Math.random() < 0.6 ? "#32FF32" : "#FF3B3B",
                    type: "puke"
                });
            }
        },

        spawnDonutBurst(x, y) {
            for (let i = 0; i < 5; i++) {
                this.list.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 1.2) * 5,
                    life: 60 + Math.random() * 20,
                    size: 8 + Math.random() * 4,
                    type: "donut",
                    rot: Math.random() * Math.PI * 2,
                    vr: (Math.random() - 0.5) * 0.2
                });
            }
        },

        update(dt) {
            this.list = this.list.filter(p => p.life > 0);
            this.list.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.25;
                if (p.type === "donut") {
                    p.rot += p.vr;
                    if (p.y > GROUND_Y - p.size) {
                        p.y = GROUND_Y - p.size;
                        p.vy *= -0.55;
                        p.vx *= 0.85;
                    }
                }
                if (p.type === "puke") {
                    if (p.y > GROUND_Y - p.size) {
                        p.y = GROUND_Y - p.size;
                        p.vy = 0;
                        p.vx *= 0.4;
                    }
                }
                p.life -= 1;
            });
        },

        draw(ctx, worldOffset) {
            this.list.forEach(p => {
                if (p.type === "donut") {
                    ctx.save();
                    ctx.translate(p.x - worldOffset, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = "#F4A460";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255,255,255,0.6)";
                    ctx.beginPath();
                    ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x - worldOffset, p.y, p.size, p.size);
                }
            });
        }
    };
})();
