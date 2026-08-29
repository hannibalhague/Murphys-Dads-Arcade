// Ensure utils.js is loaded first!

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.style.backgroundColor = '#111';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // 1. DOUBLED SPREAD: Increased range from 10 to 20
        this.speedX = Utils.rand(-20, 20); 
        this.speedY = Utils.rand(-20, 20);
        
        this.color = Utils.randChoice(['#FF5733', '#FFC300', '#FF8D33', '#FFFFFF']);
        
        // 2. DOUBLED SIZE: Increased range from (2, 8) to (4, 16)
        this.size = Utils.rand(4, 16);
        
        this.alpha = 1;
        // Adjusted decay so larger particles don't vanish too fast
        this.decay = Utils.rand(0.005, 0.015); 
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let particles = [];

function createExplosion(x, y) {
    // 3. DOUBLED DENSITY: Increased count from 150 to 300
    const particleCount = 300; 
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('mousedown', (e) => {
    createExplosion(e.clientX, e.clientY);
});

animate();