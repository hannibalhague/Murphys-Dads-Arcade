class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 46;
        this.height = 56;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 90;
        this.speed = 1.8; // Reduced for heavier space inertia[cite: 6]
        
        this.maxHp = 100;
        this.hp = 100;

        this.weaponType = 1; 
        this.weaponTimer = 0;
        
        this.isPulling = false;
        this.pullRange = 140;
        this.armExtension = 0;
    }

    update(input) {
        if (input.isDown('ArrowLeft') || input.isDown('KeyA') || input.isDown('left')) {
            this.x -= this.speed;
        }
        if (input.isDown('ArrowRight') || input.isDown('KeyD') || input.isDown('right')) {
            this.x += this.speed;
        }
        if (input.isDown('ArrowUp') || input.isDown('KeyW') || input.isDown('up')) {
            this.y -= this.speed;
        }
        if (input.isDown('ArrowDown') || input.isDown('KeyS') || input.isDown('down')) {
            this.y += this.speed;
        }

        this.isPulling = input.isDown('KeyF');

        if (this.isPulling) {
            if (this.armExtension < this.pullRange) {
                this.armExtension += 8;
            }
        } else {
            if (this.armExtension > 0) {
                this.armExtension -= 12;
            }
        }

        if (this.x < 0) this.x = 0;
        if (this.x > this.canvasWidth - this.width) {
            this.x = this.canvasWidth - this.width;
        }
        if (this.y < 0) this.y = 0;
        if (this.y > this.canvasHeight - this.height) {
            this.y = this.canvasHeight - this.height;
        }

        if (this.weaponType > 1) {
            this.weaponTimer++;
            if (this.weaponTimer > 1200) {
                this.weaponType = 1;
                this.weaponTimer = 0;
            }
        }
    }

    getClawTipPosition() {
        if (this.armExtension <= 0) return null;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const armTipY = centerY - (this.height / 2) - this.armExtension - 8;
        return { x: centerX, y: armTipY };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#dd6b20';
        ctx.fillRect(-10, this.height / 2 - 2, 6, 8);
        ctx.fillRect(4, this.height / 2 - 2, 6, 8);
        ctx.fillStyle = '#f6ad55';
        ctx.fillRect(-8, this.height / 2 + 3, 4, 5);
        ctx.fillRect(6, this.height / 2 + 3, 4, 5);

        ctx.fillStyle = '#2a4365';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, this.height / 2 - 6);
        ctx.lineTo(-this.width / 6, -this.height / 4);
        ctx.lineTo(-this.width / 6, this.height / 2 - 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.width / 2, this.height / 2 - 6);
        ctx.lineTo(this.width / 6, -this.height / 4);
        ctx.lineTo(this.width / 6, this.height / 2 - 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(-this.width / 2 + 2, 4, 8, 3);
        ctx.fillRect(this.width / 2 - 10, 4, 8, 3);

        ctx.fillStyle = '#edf2f7';
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 4, -this.height / 6);
        ctx.lineTo(this.width / 4, this.height / 2 - 4);
        ctx.lineTo(-this.width / 4, this.height / 2 - 4);
        ctx.lineTo(-this.width / 4, -this.height / 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#cbd5e0';
        ctx.fillRect(-3, -this.height / 3, 6, this.height / 1.5);

        ctx.fillStyle = '#e53e3e';
        ctx.fillRect(-this.width / 4 - 3, -4, 4, 12);
        ctx.fillRect(this.width / 4 - 1, -4, 4, 12);

        ctx.fillStyle = '#319795';
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 3);
        ctx.lineTo(4, -this.height / 6);
        ctx.lineTo(-4, -this.height / 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#81e6d9';
        ctx.fillRect(-1, -this.height / 4, 2, 6);

        if (this.armExtension > 0) {
            ctx.save();
            ctx.translate(0, -this.height / 2);

            ctx.fillStyle = '#4a5568';
            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 1.5;

            ctx.fillRect(-3, -3, 6, 5);
            ctx.strokeRect(-3, -3, 6, 5);

            ctx.fillRect(-1.5, -this.armExtension, 3, this.armExtension);
            ctx.strokeRect(-1.5, -this.armExtension, 3, this.armExtension);

            for (let j = 15; j < this.armExtension; j += 20) {
                ctx.fillStyle = '#718096';
                ctx.fillRect(-2.5, -j - 4, 5, 6);
                ctx.strokeRect(-2.5, -j - 4, 5, 6);
            }

            ctx.translate(0, -this.armExtension);
            
            ctx.fillStyle = '#1a202c';
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#cbd5e0';
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(-1.5, 0);
            ctx.bezierCurveTo(-8, -3, -10, -9, -6, -12);
            ctx.lineTo(-3.5, -10.5);
            ctx.bezierCurveTo(-7, -7, -5, -3, -1.5, -2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(1.5, 0);
            ctx.bezierCurveTo(8, -3, 10, -9, 6, -12);
            ctx.lineTo(3.5, -10.5);
            ctx.bezierCurveTo(7, -7, 5, -3, 1.5, -2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(0, 245, 255, 0.45)';
            ctx.beginPath();
            ctx.arc(0, -6, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }
}