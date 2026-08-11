class BaseEnemy {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.markedForDeletion = false;
        this.animTime = 0;
        this.fireTimer = Math.random() * 100;
    }

    update(bulletsArray) {
        this.y += this.speed;
        this.animTime += 0.05;
        this.fireTimer++;

        if (this.fireTimer > 220) {
            if (bulletsArray) {
                bulletsArray.push(new Bullet(this.x + this.width / 2, this.y + this.height, 0, 2.5, 4));
            }
            this.fireTimer = 0;
        }

        if (this.y > 680) this.markedForDeletion = true;
    }
}

class MothershipBoss extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 140;
        this.height = 75;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = -250;
        this.targetY = 45; 
        this.speed = 0.6;
        this.hp = 50;
        this.maxHp = 50;
        this.moveTimer = 0;
        this.isBoss = true;
    }

    update(bulletsArray) {
        this.animTime += 0.05;
        this.moveTimer += 0.03;

        if (this.y < this.targetY) {
            this.y += this.speed;
        } else {
            this.x = (this.canvasWidth / 2 - this.width / 2) + Math.sin(this.moveTimer) * 110;
        }

        this.fireTimer++;
        if (this.fireTimer > 90) {
            if (bulletsArray) {
                bulletsArray.push(new Bullet(this.x + 30, this.y + this.height, -1.5, 2.5, 6));
                bulletsArray.push(new Bullet(this.x + this.width / 2, this.y + this.height, 0, 3, 6));
                bulletsArray.push(new Bullet(this.x + this.width - 30, this.y + this.height, 1.5, 2.5, 6));
            }
            this.fireTimer = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#1a202c';
        ctx.strokeStyle = '#e53e3e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(this.width / 3, -this.height / 2);
        ctx.lineTo(-this.width / 3, -this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = Math.sin(this.animTime * 8) > 0 ? '#ff3300' : '#ffcc00';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cbd5e0';
        ctx.fillRect(-45, this.height / 2 - 12, 10, 16);
        ctx.fillRect(35, this.height / 2 - 12, 10, 16);

        ctx.restore();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.x, this.y - 14, this.width, 6);
        ctx.fillStyle = '#ff3333';
        const hpPercent = Math.max(0, this.hp / this.maxHp);
        ctx.fillRect(this.x, this.y - 14, this.width * hpPercent, 6);
    }
}

class ScarabScout extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 44;
        this.height = 44;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.9;
        this.startX = this.x;
        this.amplitude = 45;
    }

    update(bulletsArray) {
        super.update(bulletsArray);
        this.x = this.startX + Math.sin(this.y * 0.03) * this.amplitude;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#ff3300';
        ctx.fillRect(-3, -this.height/2 - 8, 6, 8);

        ctx.fillStyle = '#d69e2e';
        ctx.fillRect(-this.width/2 + 4, -this.height/3, this.width - 8, this.height/1.5);
        ctx.fillStyle = '#b7791f';
        ctx.fillRect(-this.width/4, -this.height/4, this.width/2, this.height/2);

        ctx.fillStyle = '#744210';
        ctx.fillRect(-this.width/2, -6, 8, 14);
        ctx.fillRect(this.width/2 - 8, -6, 8, 14);

        ctx.fillStyle = '#00f5ff';
        ctx.beginPath();
        ctx.arc(0, 6, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class ViperInterceptor extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 40;
        this.height = 48;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.8;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-4, -this.height/2 - 10, 8, 10);

        ctx.fillStyle = '#9b2c2c';
        ctx.beginPath();
        ctx.moveTo(0, this.height/2);
        ctx.lineTo(this.width/2 - 2, 0);
        ctx.lineTo(this.width/2, -this.height/2);
        ctx.lineTo(-this.width/2, -this.height/2);
        ctx.lineTo(-this.width/2 + 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4a5568';
        ctx.fillRect(-4, -this.height/3, 8, this.height/1.5);

        ctx.fillStyle = '#f6e05e';
        ctx.fillRect(-2, -4, 4, 10);

        ctx.restore();
    }
}

class TitanJuggernaut extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 56;
        this.height = 48;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.3;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-18, -this.height/2 - 6, 8, 6);
        ctx.fillRect(-4, -this.height/2 - 6, 8, 6);
        ctx.fillRect(10, -this.height/2 - 6, 8, 6);

        ctx.fillStyle = '#1a202c';
        ctx.strokeStyle = '#a0aec0';
        ctx.lineWidth = 2;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

        ctx.fillStyle = '#2d3748';
        ctx.fillRect(-this.width/2 + 6, -this.height/4, this.width - 12, this.height/2);
        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(-10, 4, 20, 6);

        ctx.restore();
    }
}

class PhantomStealth extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 46;
        this.height = 42;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.5;
        this.drift = (Math.random() - 0.5) * 0.6;
    }

    update(bulletsArray) {
        super.update(bulletsArray);
        this.x += this.drift;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#00aaff';
        ctx.fillRect(-10, -this.height/2 - 8, 6, 8);
        ctx.fillRect(4, -this.height/2 - 8, 6, 8);

        ctx.fillStyle = '#2b6cb0';
        ctx.beginPath();
        ctx.moveTo(0, this.height/2);
        ctx.lineTo(this.width/2, -this.height/3);
        ctx.lineTo(this.width/4, -this.height/2);
        ctx.lineTo(-this.width/4, -this.height/2);
        ctx.lineTo(-this.width/2, -this.height/3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-6, -this.height/3, 12, this.height/1.5);
        ctx.fillStyle = '#3182ce';
        ctx.fillRect(-3, -4, 6, 10);

        ctx.restore();
    }
}

class BladeBomber extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 48;
        this.height = 46;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.4;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#ff4500';
        ctx.fillRect(-6, -this.height/2 - 10, 12, 10);

        ctx.fillStyle = '#22543d';
        ctx.fillRect(-this.width/3, -this.height/2, this.width/1.5, this.height);

        ctx.fillStyle = '#276749';
        ctx.beginPath();
        ctx.moveTo(-this.width/3, this.height/4);
        ctx.lineTo(-this.width/2, -this.height/4);
        ctx.lineTo(-this.width/3, -this.height/2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.width/3, this.height/4);
        ctx.lineTo(this.width/2, -this.height/4);
        ctx.lineTo(this.width/3, -this.height/2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f6e05e';
        ctx.fillRect(-3, 2, 6, 10);

        ctx.restore();
    }
}

class StingerDrone extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 36;
        this.height = 50;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.8;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(-4, -this.height/2 - 12, 8, 12);

        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.moveTo(0, this.height/2);
        ctx.lineTo(this.width/2 - 4, 0);
        ctx.lineTo(this.width/2, -this.height/2);
        ctx.lineTo(-this.width/2, -this.height/2);
        ctx.lineTo(-this.width/2 + 4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ed8936';
        ctx.fillRect(-2, -this.height/3, 4, this.height/1.5);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-2, 10, 4, 6);

        ctx.restore();
    }
}

class EclipseCruiser extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 50;
        this.height = 44;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.35;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-12, -this.height/2 - 8, 8, 8);
        ctx.fillRect(4, -this.height/2 - 8, 8, 8);

        ctx.fillStyle = '#0987a0';
        ctx.fillRect(-this.width/2 + 4, -this.height/2, this.width - 8, this.height);

        ctx.fillStyle = '#0bc5ea';
        ctx.fillRect(-this.width/2, -8, 6, 18);
        ctx.fillRect(this.width/2 - 6, -8, 6, 18);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, 2, 8, 8);

        ctx.restore();
    }
}

class CometRaider extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 42;
        this.height = 42;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.7;
        this.direction = Math.random() > 0.5 ? 1 : -1;
    }

    update(bulletsArray) {
        super.update(bulletsArray);
        this.x += this.direction * 0.35;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#ff3300';
        ctx.fillRect(-5, -this.height/2 - 8, 10, 8);

        ctx.fillStyle = '#c05621';
        ctx.beginPath();
        ctx.moveTo(0, this.height/2);
        ctx.lineTo(this.width/2, 0);
        ctx.lineTo(this.width/3, -this.height/2);
        ctx.lineTo(-this.width/3, -this.height/2);
        ctx.lineTo(-this.width/2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f6ad55';
        ctx.fillRect(-6, -6, 12, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 2, 4, 6);

        ctx.restore();
    }
}

class PulsarFighter extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 44;
        this.height = 44;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.5;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const scale = 1 + Math.sin(this.animTime * 4) * 0.08;
        ctx.scale(scale, scale);

        ctx.fillStyle = '#285e61';
        ctx.fillRect(-6, -this.height/2 - 6, 12, 6);

        ctx.fillStyle = '#319795';
        ctx.fillRect(-this.width/2 + 6, -this.height/2, this.width - 12, this.height);

        ctx.fillStyle = '#e6fffa';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class NebulaWraith extends BaseEnemy {
    constructor(canvasWidth) {
        super(canvasWidth);
        this.width = 46;
        this.height = 46;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -Math.random() * 120 - 60;
        this.speed = 0.6;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        ctx.fillStyle = '#e9d8fd';
        ctx.fillRect(-10, -this.height/2 - 8, 6, 8);
        ctx.fillRect(4, -this.height/2 - 8, 6, 8);

        ctx.fillStyle = '#44337a';
        ctx.beginPath();
        ctx.moveTo(0, this.height/2);
        ctx.lineTo(this.width/2, this.height/4);
        ctx.lineTo(this.width/3, -this.height/2);
        ctx.lineTo(-this.width/3, -this.height/2);
        ctx.lineTo(-this.width/2, this.height/4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#faf5ff';
        ctx.fillRect(-4, -2, 8, 12);

        ctx.restore();
    }
}