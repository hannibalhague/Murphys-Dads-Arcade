class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler();
        this.background = new SpaceBackground(this.canvas.width, this.canvas.height);
        this.player = new Player(this.canvas.width, this.canvas.height);
        
        this.bgMusic = new Audio('mp3/1.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;
        this.musicStarted = false;

        this.bullets = [];
        this.enemyBullets = [];
        this.missiles = [];
        this.enemies = [];
        this.asteroids = [];
        this.powerUps = [];
        this.astronauts = [];
        this.particles = [];
        
        this.score = 0;
        this.lives = 4;
        this.rescuedCount = 0;
        this.carriedCount = 0;
        this.astronautKilledCount = 0; 
        this.maxCarried = 10;
        this.enemyTimer = 0;
        this.enemyInterval = 280;
        this.asteroidTimer = 0;
        this.asteroidInterval = 420;
        this.astronautTimer = 0;
        this.astronautInterval = 750;
        this.bossTimer = 0;
        this.bossInterval = 12000; // Increased to make bosses spawn less often[cite: 1]
        this.shootTimer = 0;
        this.missileTimer = 0;
        this.isGameOver = false;

        this.scoreEl = document.getElementById('score-val');
        this.livesEl = document.getElementById('lives-val');
        this.carriedEl = document.getElementById('carried-val');
        this.rescueEl = document.getElementById('rescue-val');
        
        this.astronautKilledEl = document.getElementById('killed-astronauts-val') || document.getElementById('killed-val');

        window.addEventListener('keydown', (e) => {
            this.tryStartMusic();
            if (this.isGameOver) {
                this.restart();
            }
        });
    }

    tryStartMusic() {
        if (!this.musicStarted) {
            this.bgMusic.play().then(() => {
                this.musicStarted = true;
            }).catch(e => {
                console.log("Audio waiting for interaction:", e);
            });
        }
    }

    spawnExplosion(x, y, count = 15, color = '#ff6600', type = 'circle') {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, type));
        }
    }

    spawnAstronautGore(x, y) {
        this.spawnExplosion(x, y, 45, '#991b1b', 'blood');
        this.spawnExplosion(x, y, 35, '#ef4444', 'blood');
        this.spawnExplosion(x, y, 20, '#b91c1c', 'circle');
        
        this.spawnExplosion(x, y, 4, '#edf2f7', 'limb');
        this.spawnExplosion(x, y, 1, '#d69e2e', 'helmet');
        this.spawnExplosion(x, y, 2, '#cbd5e0', 'boot');
        this.spawnExplosion(x, y, 2, '#e2e8f0', 'glove');
    }

    restart() {
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.bullets = [];
        this.enemyBullets = [];
        this.missiles = [];
        this.enemies = [];
        this.asteroids = [];
        this.powerUps = [];
        this.astronauts = [];
        this.particles = [];
        this.score = 0;
        this.lives = 4;
        this.rescuedCount = 0;
        this.carriedCount = 0;
        this.astronautKilledCount = 0; 
        this.enemyTimer = 0;
        this.enemyInterval = 280;
        this.asteroidTimer = 0;
        this.asteroidInterval = 420;
        this.astronautTimer = 0;
        this.bossTimer = 0;
        this.shootTimer = 0;
        this.missileTimer = 0;
        this.isGameOver = false;

        if (this.scoreEl) this.scoreEl.innerText = this.score;
        if (this.livesEl) this.livesEl.innerText = this.lives;
        if (this.carriedEl) this.carriedEl.innerText = `${this.carriedCount}/${this.maxCarried}`;
        if (this.rescueEl) this.rescueEl.innerText = this.rescuedCount;
        if (this.astronautKilledEl) this.astronautKilledEl.innerText = this.astronautKilledCount;

        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        this.loop = (timestamp) => {
            this.update();
            this.draw();
            if (!this.isGameOver) {
                requestAnimationFrame((t) => this.loop(t));
            } else {
                this.drawGameOver();
            }
        };
        requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        this.background.update();
        this.player.update(this.input);
        this.updateTractorBeam();

        if (Math.random() < 0.7) {
            const p = new Particle(
                this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 6,
                this.player.y + this.player.height,
                Math.random() > 0.4 ? '#ff3300' : '#ffcc00'
            );
            p.dx = (Math.random() - 0.5) * 0.3;
            p.dy = Math.random() * 1.5 + 1.0;
            p.size = Math.random() * 3 + 2;
            this.particles.push(p);
        }

        this.shootTimer++;
        this.missileTimer++;
        const fireRate = this.player.weaponType === 3 ? 20 : 30;

        if (this.input.isDown('Space') && this.shootTimer > fireRate) {
            this.tryStartMusic();
            if (this.player.weaponType === 2) {
                this.bullets.push(new Bullet(this.player.x + this.player.width / 2, this.player.y, 0, -5.5, 2));
                this.bullets.push(new Bullet(this.player.x + this.player.width / 2, this.player.y, -1.8, -5.0, 2));
                this.bullets.push(new Bullet(this.player.x + this.player.width / 2, this.player.y, 1.8, -5.0, 2));
            } else if (this.player.weaponType === 3) {
                this.bullets.push(new Bullet(this.player.x + this.player.width / 2 - 8, this.player.y, 0, -6.5, 3));
                this.bullets.push(new Bullet(this.player.x + this.player.width / 2 + 8, this.player.y, 0, -6.5, 3));
            } else {
                this.bullets.push(new Bullet(this.player.x + this.player.width / 2, this.player.y, 0, -6.0, 1));
            }
            this.shootTimer = 0;
        }

        if (this.input.isDown('Space') && this.player.weaponType === 4 && this.missileTimer > 45) {
            this.missiles.push(new Missile(this.player.x + 6, this.player.y));
            this.missiles.push(new Missile(this.player.x + this.player.width - 18, this.player.y));
            this.missileTimer = 0;
        }

        this.bullets.forEach(b => b.update());
        this.bullets = this.bullets.filter(b => !b.markedForDeletion);

        this.enemyBullets.forEach(b => b.update());
        this.enemyBullets = this.enemyBullets.filter(b => !b.markedForDeletion);

        this.missiles.forEach(m => m.update());
        this.missiles = this.missiles.filter(m => !m.markedForDeletion);

        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.markedForDeletion);

        this.powerUps.forEach(p => {
            p.update();
            if (this.checkCollision(this.player, p)) {
                if (p.type === 'health') {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
                } else if (p.type === 'shield') {
                    this.player.hasShield = true;
                } else {
                    this.player.weaponType = p.type;
                    this.player.weaponTimer = 0;
                }
                p.markedForDeletion = true;
            }
        });
        this.powerUps = this.powerUps.filter(p => !p.markedForDeletion);

        this.astronauts.forEach(astronaut => {
            astronaut.update();
            if (this.checkCollision(this.player, astronaut) && !astronaut.isBeingPulled) {
                astronaut.markedForDeletion = true;
                this.rescuedCount++;
                this.score += 500;
                if (this.scoreEl) this.scoreEl.innerText = this.score;
                if (this.rescueEl) this.rescueEl.innerText = this.rescuedCount;
                this.spawnExplosion(astronaut.x + astronaut.width/2, astronaut.y + astronaut.height/2, 20, '#63b3ed', 'circle');
            }
        });
        this.astronauts = this.astronauts.filter(a => !a.markedForDeletion);

        this.enemyTimer++;
        this.bossTimer++;
        this.astronautTimer++;

        if (this.astronautTimer >= this.astronautInterval) {
            this.astronauts.push(new Astronaut(this.canvas.width));
            this.astronautTimer = 0;
        }

        if (this.bossTimer >= this.bossInterval) {
            this.enemies.push(new MothershipBoss(this.canvas.width));
            this.bossTimer = 0;
        } else if (this.enemyTimer >= this.enemyInterval) {
            const enemyClasses = [
                ScarabScout, ViperInterceptor, TitanJuggernaut, PhantomStealth, BladeBomber,
                StingerDrone, EclipseCruiser, CometRaider, PulsarFighter, NebulaWraith
            ];
            const RandomEnemyClass = enemyClasses[Math.floor(Math.random() * enemyClasses.length)];
            this.enemies.push(new RandomEnemyClass(this.canvas.width));
            this.enemyTimer = 0;
            if (this.enemyInterval > 140) this.enemyInterval -= 1;
        }

        this.asteroidTimer++;
        if (this.asteroidTimer >= this.asteroidInterval) {
            this.asteroids.push(new Asteroid(this.canvas.width));
            this.asteroidTimer = 0;
        }

        this.enemies.forEach(enemy => {
            enemy.update(this.enemyBullets);
            if (this.checkCollision(this.player, enemy)) {
                enemy.markedForDeletion = true;
                this.spawnExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 20, '#ff6600', 'circle');
                this.damagePlayer(25);
            }
        });
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

        this.asteroids.forEach(asteroid => {
            asteroid.update();
            if (this.checkCollision(this.player, asteroid)) {
                asteroid.markedForDeletion = true;
                this.spawnExplosion(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2, 25, '#a0aec0', 'circle');
                this.damagePlayer(35);
            }
        });
        this.asteroids = this.asteroids.filter(a => !a.markedForDeletion);

        this.enemyBullets.forEach(bullet => {
            if (this.checkCollision(bullet, this.player)) {
                bullet.markedForDeletion = true;
                this.spawnExplosion(bullet.x, bullet.y, 6, '#ff3300', 'circle');
                this.damagePlayer(15);
            }
        });

        this.bullets.forEach(bullet => {
            this.astronauts.forEach(astronaut => {
                if (this.checkCollision(bullet, astronaut)) {
                    bullet.markedForDeletion = true;
                    astronaut.markedForDeletion = true;
                    this.astronautKilledCount++; 
                    if (this.astronautKilledEl) this.astronautKilledEl.innerText = this.astronautKilledCount;
                    this.spawnAstronautGore(astronaut.x + astronaut.width / 2, astronaut.y + astronaut.height / 2);
                    this.score = Math.max(0, this.score - 500);
                    if (this.scoreEl) this.scoreEl.innerText = this.score;
                }
            });

            this.enemies.forEach(enemy => {
                if (this.checkCollision(bullet, enemy)) {
                    bullet.markedForDeletion = true;
                    if (enemy.isBoss) {
                        enemy.hp--;
                        this.spawnExplosion(bullet.x, bullet.y, 6, '#ffaa00', 'circle');
                        if (enemy.hp <= 0) {
                            enemy.markedForDeletion = true;
                            this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 50, '#ff4500', 'circle');
                            this.score += 1000;
                            if (this.scoreEl) this.scoreEl.innerText = this.score;
                            this.powerUps.push(new PowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                        }
                    } else {
                        enemy.markedForDeletion = true;
                        this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 18, '#ff6600', 'circle');
                        this.score += 100;
                        if (this.scoreEl) this.scoreEl.innerText = this.score;

                        if (Math.random() < 0.08) {
                            this.powerUps.push(new PowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                        }
                        if (Math.random() < 0.05) {
                            const ast = new Astronaut(this.canvas.width);
                            ast.x = enemy.x;
                            ast.y = enemy.y;
                            this.astronauts.push(ast);
                        }
                    }
                }
            });

            this.asteroids.forEach(asteroid => {
                if (this.checkCollision(bullet, asteroid)) {
                    bullet.markedForDeletion = true;
                    asteroid.hp--;
                    this.spawnExplosion(bullet.x, bullet.y, 4, '#cbd5e0', 'circle');
                    if (asteroid.hp <= 0) {
                        asteroid.markedForDeletion = true;
                        this.spawnExplosion(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, 22, '#718096', 'circle');
                        this.score += 50;
                        if (this.scoreEl) this.scoreEl.innerText = this.score;

                        if (Math.random() < 0.25) {
                            const p = new PowerUp(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
                            p.type = Math.random() > 0.5 ? 'health' : 'shield';
                            this.powerUps.push(p);
                        }
                    }
                }
            });
        });

        this.missiles.forEach(missile => {
            this.astronauts.forEach(astronaut => {
                if (this.checkCollision(missile, astronaut)) {
                    missile.markedForDeletion = true;
                    astronaut.markedForDeletion = true;
                    this.astronautKilledCount++; 
                    if (this.astronautKilledEl) this.astronautKilledEl.innerText = this.astronautKilledCount;
                    this.spawnAstronautGore(astronaut.x + astronaut.width / 2, astronaut.y + astronaut.height / 2);
                    this.score = Math.max(0, this.score - 500);
                    if (this.scoreEl) this.scoreEl.innerText = this.score;
                }
            });

            this.enemies.forEach(enemy => {
                if (this.checkCollision(missile, enemy)) {
                    missile.markedForDeletion = true;
                    if (enemy.isBoss) {
                        enemy.hp -= 4;
                        this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 20, '#ff5500', 'circle');
                        if (enemy.hp <= 0) {
                            enemy.markedForDeletion = true;
                            this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 60, '#ff4500', 'circle');
                            this.score += 1000;
                            if (this.scoreEl) this.scoreEl.innerText = this.score;
                            this.powerUps.push(new PowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                        }
                    } else {
                        missile.markedForDeletion = true;
                        this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 25, '#ff5500', 'circle');
                        this.score += 150;
                        if (this.scoreEl) this.scoreEl.innerText = this.score;

                        if (Math.random() < 0.08) {
                            this.powerUps.push(new PowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                        }
                    }
                }
            });

            this.asteroids.forEach(asteroid => {
                if (this.checkCollision(missile, asteroid)) {
                    missile.markedForDeletion = true;
                    asteroid.markedForDeletion = true;
                    this.spawnExplosion(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, 25, '#718096', 'circle');
                    this.score += 75;
                    if (this.scoreEl) this.scoreEl.innerText = this.score;

                    if (Math.random() < 0.25) {
                        const p = new PowerUp(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
                        p.type = Math.random() > 0.5 ? 'health' : 'shield';
                        this.powerUps.push(p);
                    }
                }
            });
        });
    }

    updateTractorBeam() {
        if (!this.player.isPulling) return;

        const clawTip = this.player.getClawTipPosition();
        if (!clawTip) return;

        this.astronauts.forEach(astronaut => {
            const aCenterX = astronaut.x + astronaut.width / 2;
            const aCenterY = astronaut.y + astronaut.height / 2;

            const targetX = this.player.x + this.player.width / 2 - astronaut.width / 2;
            const targetY = this.player.y + this.player.height / 2 - astronaut.height / 2;

            if (!astronaut.isBeingPulled) {
                const dx = clawTip.x - aCenterX;
                const dy = clawTip.y - aCenterY;
                const dist = Math.hypot(dx, dy);

                if (dist < 45) {
                    astronaut.isBeingPulled = true;
                }
            }

            if (astronaut.isBeingPulled) {
                astronaut.x += (targetX - astronaut.x) * 0.025;
                astronaut.y += (targetY - astronaut.y) * 0.025;

                const finalDist = Math.hypot(targetX - astronaut.x, targetY - astronaut.y);
                if (finalDist < 8) {
                    astronaut.markedForDeletion = true;
                    this.carriedCount++;
                    this.rescuedCount++;
                    this.score += 500;
                    if (this.scoreEl) this.scoreEl.innerText = this.score;
                    if (this.rescueEl) this.rescueEl.innerText = this.rescuedCount;
                    if (this.carriedEl) this.carriedEl.innerText = `${this.carriedCount}/${this.maxCarried}`;
                    this.spawnExplosion(targetX + astronaut.width/2, targetY + astronaut.height/2, 20, '#63b3ed', 'circle');
                }
            }
        });
    }

    damagePlayer(amount) {
        if (this.player.hasShield) {
            this.player.hasShield = false;
            this.spawnExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 15, '#3182ce', 'circle');
            return;
        }
        this.player.hp -= amount;
        this.checkPlayerDeath();
    }

    checkPlayerDeath() {
        if (this.player.hp <= 0) {
            this.spawnExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 45, '#ff3300', 'circle');
            this.spawnExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 30, '#ffcc00', 'circle');
            this.spawnExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 20, '#ffffff', 'circle');

            this.lives--;
            if (this.livesEl) this.livesEl.innerText = this.lives;
            this.player.hp = this.player.maxHp;
            this.player.weaponType = 1;
            this.player.hasShield = false;
            if (this.lives <= 0) {
                this.isGameOver = true;
            }
        }
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.background.draw(this.ctx);
        this.player.draw(this.ctx);

        if (this.player.hasShield) {
            this.ctx.save();
            this.ctx.strokeStyle = '#00f5ff';
            this.ctx.lineWidth = 3;
            this.ctx.fillStyle = 'rgba(0, 245, 255, 0.15)';
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width * 0.85,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        }

        this.bullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
        this.missiles.forEach(m => m.draw(this.ctx));
        this.asteroids.forEach(a => a.draw(this.ctx));
        this.powerUps.forEach(p => p.draw(this.ctx));
        this.astronauts.forEach(a => a.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));

        this.drawHealthBar();
    }

    drawHealthBar() {
        const barWidth = 120;
        const barHeight = 12;
        const x = 20;
        const y = 45;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        const currentHpWidth = (this.player.hp / this.player.maxHp) * barWidth;
        this.ctx.fillStyle = this.player.hp > 30 ? '#00ff66' : '#ff3333';
        this.ctx.fillRect(x, y, Math.max(0, currentHpWidth), barHeight);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.fillText(this.player.hasShield ? 'SHIELDED' : 'HP', x + barWidth / 2 - 16, y + 10);
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ff3366';
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText('Press any key to play again', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
}

window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});