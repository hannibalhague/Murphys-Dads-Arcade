// =================================================================
//   FIGHTER SCRIPT (NPCs TOSSED HEAD DOWN INTO PIT)
// =================================================================

const FIGHTER_ROSTER_POOL = [
    { 
        name: 'BULLY REX', 
        style: 'layered', 
        hairStyle: 'punkMohawk', 
        colors: { shirt: '#b83b43', pants: '#2d3748', skin: '#e0ac69', hair: '#e53e3e', secondary: '#4a5568' } 
    },
    { 
        name: 'PUNK SPIKE', 
        style: 'cyberpunk', 
        hairStyle: 'dreadhawk', 
        colors: { shirt: '#6b46c1', pants: '#1a202c', skin: '#f6ad55', hair: '#4fd1c5', secondary: '#00ffff' } 
    },
    { 
        name: 'JACKET VANCE', 
        style: 'tacticalVest', 
        hairStyle: 'shavedFade', 
        colors: { shirt: '#4a5568', pants: '#1a202c', skin: '#d69e2e', hair: '#2d3748', secondary: '#1e293b' } 
    },
    { 
        name: 'STREET BRAWLER', 
        style: 'hoodie', 
        hairStyle: 'braidedMohawk', 
        colors: { shirt: '#9b2c2c', pants: '#2c5282', skin: '#c68a4d', hair: '#1a202c', secondary: '#7f1d1d' } 
    },
    { 
        name: 'TOUGH GUY KANE', 
        style: 'layered', 
        hairStyle: 'bald', 
        colors: { shirt: '#2b6cb0', pants: '#2d3748', skin: '#e2b08e', hair: '#4a5568', secondary: '#1e3a8a' } 
    },
    { 
        name: 'GRID SURGE', 
        style: 'cyberpunk', 
        hairStyle: 'messyHawk', 
        colors: { shirt: '#2c7a7b', pants: '#1a202c', skin: '#f7fafc', hair: '#234e52', secondary: '#319795' } 
    }
];

class Fighter {
    constructor(x, y, name, isPlayer = false, colorScheme = {}) {
        this.spawnX = x;
        this.spawnY = y;
        this.x = x;
        this.y = y; 
        this.z = 0; 
        this.zVelocity = 0;
        this.vx = 0; 
        this.vy = 0;
        
        this.width = 36; 
        this.height = 95;
        this.isPlayer = isPlayer;
        this.name = name;
        
        this.speed = 2.6; 
        this.facing = 'right'; 
        this.rotation = 0; 
        
        this.health = this.isPlayer ? 600 : 300;
        this.maxHealth = this.health;
        this.stamina = 100;
        this.maxStamina = 100;
        
        this.isDefeated = false;
        this.respawnTimer = 0;
        this.pitCounted = false;
        this.isAngel = false;
        this.angelTimer = 0;

        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackType = null;
        this.comboStep = 1;
        this.comboTimer = 0;

        this.isStaggered = false;
        this.staggerTimer = 0;
        this.staggerType = 1; 
        this.isKnockedDown = false;
        this.knockdownTimer = 0;
        this.thrownBy = null;

        this.isGrabbed = false;
        this.grabbedBy = null;
        this.grabbedEnemy = null;
        this.actionButtonReleased = true; 

        this.isJumping = false;
        this.weapon = null; 
        
        this.shirtStyle = colorScheme.style || (this.isPlayer ? 'layered' : 'tacticalVest');
        this.hairStyle = colorScheme.hairStyle || (this.isPlayer ? 'punkMohawk' : 'shavedFade');

        if (this.isPlayer) {
            this.colors = {
                shirt: colorScheme.shirt || '#1e3a8a', 
                pants: colorScheme.pants || '#334155', 
                skin: colorScheme.skin || '#f5d0b1',
                hair: colorScheme.hair || '#5c3a21',
                secondary: colorScheme.secondary || '#3b82f6'
            };
        } else {
            this.colors = {
                shirt: colorScheme.shirt || '#7f1d1d', 
                pants: colorScheme.pants || '#18181b', 
                skin: colorScheme.skin || '#e2b08e',   
                hair: colorScheme.hair || '#111827',
                secondary: colorScheme.secondary || '#991b1b'
            };
        }
        
        this.animFrame = 0;
    }

    update(targets, environmentObjects, onScoreCallback, speedScale = 1.0) {
        if (this.isPlayer && this.health <= 0 && !this.isDefeated) {
            this.isDefeated = true;
            this.isAngel = true;
            this.z = 0;
            this.zVelocity = 2.2; 
            if (typeof audioManager !== 'undefined') audioManager.playDeath();
        }

        if (this.isDefeated) {
            if (this.isGrabbed) {
                this.isGrabbed = false;
                this.grabbedBy = null;
            }

            if (this.isPlayer && this.isAngel) {
                this.z += 1.25; 
                this.x += (Math.sin(Date.now() * 0.003) * 0.6); 
                return;
            }

            if (!this.isPlayer) {
                // Pit threshold set past the line (x: 70 to 230)
                if (this.x >= 70 && this.x <= 230) {
                    this.zVelocity -= 0.45;
                    this.z += this.zVelocity;
                } else {
                    if (this.z > 0) {
                        this.zVelocity -= CONFIG.gravity;
                        this.z += this.zVelocity;
                        if (this.z < 0) this.z = 0;
                    }
                }

                this.respawnTimer++;
                if (this.respawnTimer > 250) {
                    let randomFighter = FIGHTER_ROSTER_POOL[Math.floor(Math.random() * FIGHTER_ROSTER_POOL.length)];
                    this.name = randomFighter.name;
                    this.colors = randomFighter.colors;
                    this.shirtStyle = randomFighter.style;
                    this.hairStyle = randomFighter.hairStyle;

                    this.health = this.maxHealth;
                    this.isDefeated = false;
                    this.isKnockedDown = false;
                    this.z = 0;
                    this.zVelocity = 0;
                    this.pitCounted = false; 
                    this.x = this.spawnX + (Math.random() * 200 - 100);
                    this.y = this.spawnY;
                    this.respawnTimer = 0;
                }
            }
            return;
        }

        if (this.isGrabbed && this.grabbedBy) {
            this.x = this.grabbedBy.x + (this.grabbedBy.facing === 'right' ? 24 : -24);
            this.y = this.grabbedBy.y;
            this.z = this.grabbedBy.z; 
            this.facing = this.grabbedBy.facing === 'right' ? 'left' : 'right'; 
            return;
        }

        if (this.isKnockedDown) {
            this.knockdownTimer--;
            this.x += this.vx;
            this.vx *= 0.88;

            if (this.thrownBy && Math.abs(this.vx) > 1.5) {
                let allFighters = [player, ...npcs];
                for (let other of allFighters) {
                    if (other === this || other === this.thrownBy || other.isDefeated) continue;

                    let otherBoxX = other.x - other.width / 2;
                    let otherBoxW = other.width;
                    let otherBoxYMin = other.y - 12;
                    let otherBoxYMax = other.y + 12;
                    let otherBoxZMin = other.z;
                    let otherBoxZMax = other.z + other.height;

                    if (
                        this.x >= otherBoxX && this.x <= otherBoxX + otherBoxW &&
                        this.y >= otherBoxYMin && this.y <= otherBoxYMax &&
                        this.z >= otherBoxZMin && this.z <= otherBoxZMax
                    ) {
                        let pushDir = Math.sign(this.vx) || 1;
                        let impactDamage = 20;
                        other.receiveHit(impactDamage, pushDir > 0 ? 'right' : 'left', true, false);
                        
                        this.vx *= -0.35;
                        addBloodSplatter(other.x, other.y);
                        if (typeof audioManager !== 'undefined') audioManager.playHit();
                    }
                }
            } else if (!this.thrownBy) {
                this.thrownBy = null;
            }

            if (this.z > 0 || this.zVelocity !== 0) {
                this.zVelocity -= CONFIG.gravity;
                this.z += this.zVelocity;
                if (this.z <= 0) {
                    // Check if landed past the line into the pit
                    if (!this.isPlayer && this.x >= 70 && this.x <= 230) {
                        this.z = -1; 
                        this.zVelocity = -1.5; 
                        this.isDefeated = true; 
                        if (typeof audioManager !== 'undefined') audioManager.playDeath();
                    } else {
                        this.z = 0;
                        this.zVelocity = 0;
                        this.thrownBy = null;
                    }
                }
            }

            if (this.knockdownTimer <= 0 && this.z === 0) {
                this.isKnockedDown = false;
                this.thrownBy = null;
                if (this.health <= 0) {
                    this.isDefeated = true;
                    if (typeof audioManager !== 'undefined') audioManager.playDeath();
                } else {
                    this.health = Math.max(1, this.health);
                }
            }
            return;
        }

        if (this.isStaggered) {
            this.staggerTimer--;
            if (this.staggerTimer <= 0) this.isStaggered = false;
            return;
        }

        if (this.stamina < this.maxStamina && !this.isAttacking) {
            this.stamina += 0.5;
        }

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) this.comboStep = 1;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.82; 
        this.vy *= 0.82;

        let allowedMaxY = CONFIG.maxY + 25;
        let isInPitRange = (this.x >= 70 && this.x <= 230);
        if (this.y >= allowedMaxY - 5 && this.z === 0 && !isInPitRange) {
            this.x -= 3.5 * speedScale;
        }

        if (!this.isAngel) {
            if (this.z > 0 || this.zVelocity !== 0) {
                this.zVelocity -= CONFIG.gravity;
                this.z += this.zVelocity;
                if (this.z <= 0) {
                    if (!this.isPlayer && this.x >= 70 && this.x <= 230) {
                        this.z = -1;
                        this.zVelocity = -1.5;
                        this.isDefeated = true;
                        if (typeof audioManager !== 'undefined') audioManager.playDeath();
                    } else {
                        this.z = 0;
                        this.zVelocity = 0;
                        this.isJumping = false;
                    }
                }
            } else if (!this.isPlayer && this.x >= 70 && this.x <= 230 && this.z === 0) {
                this.z = -1;
                this.zVelocity = -1.5;
                this.isDefeated = true;
                if (typeof audioManager !== 'undefined') audioManager.playDeath();
            }
        }

        if (this.isPlayer) {
            this.handlePlayerInput(targets, environmentObjects, onScoreCallback);
        } else {
            this.handleAI(targets[0]);
        }

        if (!this.isPlayer || !this.grabbedEnemy) {
            this.resolveCollisions(targets);
        }

        if (this.x < 40) this.x = 40;
        if (this.x > CONFIG.worldWidth - 40) this.x = CONFIG.worldWidth - 40;
        if (this.y < CONFIG.minY) this.y = CONFIG.minY;
        if (this.y > allowedMaxY) this.y = allowedMaxY;

        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.attackType = null;
            }
        }
    }

    resolveCollisions(targets) {
        let allFighters = [player, ...npcs];
        for (let other of allFighters) {
            if (other === this || other.isDefeated || other.isKnockedDown) continue;

            let dx = this.x - other.x;
            let dy = this.y - other.y;

            let minDistanceX = 30;
            let minDistanceY = 12;

            if (Math.abs(dx) < minDistanceX && Math.abs(dy) < minDistanceY && this.z === other.z) {
                let overlapX = minDistanceX - Math.abs(dx);
                let overlapY = minDistanceY - Math.abs(dy);

                let dirX = Math.sign(dx) || 1;
                let dirY = Math.sign(dy) || 1;

                if (overlapX < overlapY) {
                    this.x += dirX * (overlapX * 0.5);
                    other.x -= dirX * (overlapX * 0.5);
                } else {
                    this.y += dirY * (overlapY * 0.5);
                    other.y -= dirY * (overlapY * 0.5);
                }
            }
        }
    }

    handlePlayerInput(targets, environmentObjects, onScoreCallback) {
        let moving = false;
        let isRunning = Input.isRunning();

        if (!Input.isActionPressed() || isRunning) {
            this.actionButtonReleased = true;
        }

        let allowedMaxY = CONFIG.maxY + 25;

        if (typeof driveableCar !== 'undefined' && driveableCar.driver === this) {
            driveableCar.update();
            if (Input.isPickupPressed() && this.actionButtonReleased) {
                this.actionButtonReleased = false;
                driveableCar.exitCar();
            }
            return;
        }

        if (this.grabbedEnemy) {
            if (this.grabbedEnemy.isDefeated) {
                this.grabbedEnemy = null;
                return;
            }

            let grabMoveAccel = 0.5;
            if (Input.isMovingLeft()) { this.vx -= grabMoveAccel; this.facing = 'left'; moving = true; }
            if (Input.isMovingRight()) { this.vx += grabMoveAccel; this.facing = 'right'; moving = true; }
            if (Input.isMovingUp() && this.y > CONFIG.minY) { this.vy -= grabMoveAccel * 0.8; moving = true; }
            if (Input.isMovingDown() && this.y < allowedMaxY) { this.vy += grabMoveAccel * 0.8; moving = true; }

            this.animFrame = moving ? this.animFrame + 0.15 : 0;

            if (Input.isKicking() && !this.isAttacking && this.actionButtonReleased) {
                this.actionButtonReleased = false;
                this.triggerAttack('grabKick', 18, 18, 45, true, onScoreCall => {
                    if (onScoreCallback) onScoreCallback(15);
                });
            }

            if (Input.isThrowPressed() && this.actionButtonReleased) {
                this.actionButtonReleased = false;
                let enemyToThrow = this.grabbedEnemy;
                this.grabbedEnemy = null; 
                enemyToThrow.throwBy(this, onScoreCallback);
                
                this.isAttacking = true;
                this.attackType = 'throwRelease';
                this.attackTimer = 20;
            }
            return; 
        }

        let moveAccel = isRunning ? 1.6 : 0.8;
        let moveAccelY = isRunning ? 1.2 : 0.6;

        if (!this.isAttacking) {
            if (Input.isMovingLeft()) { this.vx -= moveAccel; this.facing = 'left'; moving = true; }
            if (Input.isMovingRight()) { this.vx += moveAccel; this.facing = 'right'; moving = true; }
            if (Input.isMovingUp() && this.y > CONFIG.minY) { this.vy -= moveAccelY; moving = true; }
            if (Input.isMovingDown() && this.y < allowedMaxY) { this.vy += moveAccelY; moving = true; }
        }

        let currentMaxSpeed = isRunning ? this.speed * 2.1 : this.speed;
        if (Math.abs(this.vx) > currentMaxSpeed) this.vx = Math.sign(this.vx) * currentMaxSpeed;
        if (Math.abs(this.vy) > currentMaxSpeed * 0.8) this.vy = Math.sign(this.vy) * currentMaxSpeed * 0.8;

        let animSpeed = isRunning ? 0.38 : 0.18;
        this.animFrame = moving ? this.animFrame + animSpeed : 0;

        if (Input.isPickupPressed() && this.actionButtonReleased && this.z === 0 && !isRunning) {
            this.actionButtonReleased = false;

            if (typeof driveableCar !== 'undefined' && !driveableCar.driver) {
                if (Math.abs(this.x - driveableCar.x) < 55 && Math.abs(this.y - driveableCar.y) < 40) {
                    driveableCar.enterCar(this);
                    return;
                }
            }

            if (this.weapon) {
                this.triggerWeaponThrow(onScoreCallback);
            } else {
                let grabbedAny = false;

                if (environmentObjects) {
                    environmentObjects.forEach(obj => {
                        if (obj.type === 'weapon' && !obj.pickedUp) {
                            if (Math.abs(this.x - obj.x) < 40 && Math.abs(this.y - obj.y) < 25) {
                                this.weapon = obj.subType;
                                obj.pickedUp = true;
                                grabbedAny = true;
                            }
                        }
                    });
                }

                if (!grabbedAny && !this.grabbedEnemy) {
                    for (let i = 0; i < targets.length; i++) {
                        let npc = targets[i];
                        if (!npc.isDefeated && !npc.isGrabbed && !npc.isKnockedDown && 
                            Math.abs(this.x - npc.x) < 35 && Math.abs(this.y - npc.y) < 14 && Math.abs(this.z - npc.z) < 15) {
                            this.grabbedEnemy = npc;
                            npc.isGrabbed = true;
                            npc.grabbedBy = this;
                            grabbedAny = true;
                            break; 
                        }
                    }
                }
            }
        }

        if (Input.isJumping() && this.z === 0) {
            this.zVelocity = CONFIG.jumpForce;
            this.isJumping = true;
            if (moving && !this.isAttacking) {
                this.vx = (this.facing === 'right' ? (isRunning ? 8 : 5) : (isRunning ? -8 : -5)); 
            }
        }

        if (!this.isAttacking && this.stamina >= 8 && !isRunning) {
            if (Input.isPunching()) {
                let dmg = this.comboStep === 1 ? 14 : (this.comboStep === 2 ? 16 : 22);
                let reach = 42;
                this.triggerAttack(`punch${this.comboStep}`, dmg, 12, reach, false, onScoreCall => {
                    if (onScoreCallback) onScoreCallback(10); 
                });
                this.stamina -= 6;
                this.comboStep = this.comboStep >= 3 ? 1 : this.comboStep + 1;
                this.comboTimer = 35;
            } else if (Input.isKicking()) {
                if (this.z > 0) {
                    this.triggerAttack('flyingKick', 28, 20, 50, true, onScoreCall => {
                        if (onScoreCallback) onScoreCallback(15); 
                    });
                    this.vx = (this.facing === 'right' ? 7 : -7); 
                } else {
                    this.triggerAttack('kick', 24, 15, 46, true, onScoreCall => {
                        if (onScoreCallback) onScoreCallback(15); 
                    }); 
                }
                this.stamina -= 10;
            }
        }
    }

    triggerWeaponThrow(onScoreCallback) {
        let throwDir = (this.facing === 'right' ? 1 : -1);
        envObjects.push({
            type: 'thrownWeapon',
            subType: this.weapon,
            x: this.x + (throwDir * 20),
            y: this.y,
            z: 35,
            vx: throwDir * 22, 
            zVelocity: 7,
            pickedUp: false
        });
        this.weapon = null; 
        this.isAttacking = true;
        this.attackType = 'weaponThrow';
        this.attackTimer = 15;
        if (onScoreCallback) onScoreCallback(20); 
    }

    handleAI(targetPlayer) {
        if (targetPlayer.isDefeated || this.isGrabbed || this.grabbedBy) return;

        let dx = targetPlayer.x - this.x;
        let dy = targetPlayer.y - this.y;
        let dist = Math.hypot(dx, dy);

        if (dist > 45) {
            this.vx += Math.sign(dx) * 0.4;
            this.vy += Math.sign(dy) * 0.3;
            this.facing = dx < 0 ? 'left' : 'right';
            this.animFrame += 0.12;
        } else {
            this.animFrame = 0;
            if (Math.abs(dy) < 14 && Math.random() < 0.03 && !this.isAttacking && !this.isStaggered) {
                this.triggerAttack(Math.random() > 0.4 ? 'punch1' : 'kick', 6, 14, 40, false, null);
            }
        }

        let currentMaxSpeed = this.speed * 0.75;
        if (Math.abs(this.vx) > currentMaxSpeed) this.vx = Math.sign(this.vx) * currentMaxSpeed;
        if (Math.abs(this.vy) > currentMaxSpeed * 0.7) this.vy = Math.sign(this.vy) * currentMaxSpeed * 0.7;
    }

    triggerAttack(type, damage, frameDuration, reach, isKickAttack = false, scoreAction = null) {
        this.isAttacking = true;
        this.attackType = type;
        this.attackTimer = frameDuration;

        let hitBoxX = this.facing === 'right' ? this.x + 4 : this.x - reach - 4;
        let hitBoxW = reach;
        let hitBoxYMin = this.y - 14;
        let hitBoxYMax = this.y + 14;
        let hitBoxZMin = this.z - 5;
        let hitBoxZMax = this.z + 65;

        let opponents = this.isPlayer ? npcs : [player];
        opponents.forEach(target => {
            if (target === this.grabbedEnemy) return;

            if (!target.isDefeated && !target.isKnockedDown && !target.isGrabbed) {
                let targetX = target.x - target.width / 2;
                let targetW = target.width;
                let targetYMin = target.y - 12;
                let targetYMax = target.y + 12;
                let targetZMin = target.z;
                let targetZMax = target.z + target.height;

                if (
                    hitBoxX < targetX + targetW &&
                    hitBoxX + hitBoxW > targetX &&
                    hitBoxYMin <= targetYMax &&
                    hitBoxYMax >= targetYMin &&
                    hitBoxZMin <= targetZMax &&
                    hitBoxZMax >= targetZMin
                ) {
                    let finalDamage = this.isPlayer ? damage : Math.max(4, Math.floor(damage * 0.5));
                    let willBeFatal = target.health - finalDamage <= 0;
                    
                    target.receiveHit(finalDamage, this.facing, type === 'spinKick' || type === 'jumpKick' || isKickAttack || willBeFatal, isKickAttack);
                    
                    if (typeof bloodSystem !== 'undefined') {
                        bloodSystem.addHitSplatter(target.x, target.y, this.facing);
                    }

                    if (this.isPlayer && scoreAction) {
                        scoreAction();
                    }
                }
            }
        });
    }

    receiveHit(damage, attackerFacing, knockdown = false, isKick = false) {
        if (Input.isBlocking() && !Input.isRunning() && this.isPlayer) {
            this.health -= Math.floor(damage * 0.15);
            this.stamina -= 8;
            return;
        }

        this.health -= damage;
        let pushDir = (attackerFacing === 'right' ? 1 : -1);

        if (typeof audioManager !== 'undefined') {
            audioManager.playHit();
        }

        if (this.health <= 0) {
            this.health = 0;
            this.isKnockedDown = true;
            this.knockdownTimer = 90; 
            this.vx = pushDir * 16;      
            this.zVelocity = 5;       
            this.isJumping = true;
            this.isGrabbed = false;
            this.grabbedBy = null;
            
            if (typeof audioManager !== 'undefined') {
                audioManager.playDeath();
            }
        } else if (knockdown && isKick) {
            this.isKnockedDown = true;
            this.knockdownTimer = 55;
            this.vx = pushDir * 14;
            this.zVelocity = 0; 
            this.isJumping = false;
        } else if (knockdown) {
            this.isKnockedDown = true;
            this.knockdownTimer = 65;
            this.vx = pushDir * 12;
            this.zVelocity = 4; 
            this.isJumping = true;
        } else {
            this.vx = pushDir * 7;
            this.isStaggered = true;
            this.staggerTimer = 22;
            if (isKick) {
                this.staggerType = 1; 
            } else {
                this.staggerType = (Math.floor(Math.random() * 2) + 2); 
            }
        }
    }

    throwBy(thrower, onScoreCallback) {
        this.isGrabbed = false;
        this.grabbedBy = null;
        this.thrownBy = thrower;
        let throwDir = (thrower.facing === 'right' ? 1 : -1);
        
        this.vx = throwDir * 24; 
        this.zVelocity = 6.0;     
        this.isJumping = true;
        
        let throwDamage = Math.round(this.maxHealth / 3);
        this.health = Math.max(0, this.health - throwDamage);

        if (this.health === 0) {
            this.isKnockedDown = true;
            this.knockdownTimer = 90;
        } else {
            this.isKnockedDown = true;
            this.knockdownTimer = 65;
        }

        if (typeof bloodSystem !== 'undefined') {
            bloodSystem.addHitSplatter(this.x, this.y, throwDir > 0 ? 'right' : 'left');
        }

        if (typeof audioManager !== 'undefined') {
            audioManager.playHit();
            if (this.health === 0) {
                audioManager.playDeath();
            }
        }

        if (onScoreCallback) {
            onScoreCallback(25); 
        }
    }

    draw(ctx) {
        if (typeof driveableCar !== 'undefined' && driveableCar.driver === this) return;

        let drawX = this.x;
        let drawY = this.y - this.z;

        if (this.z >= 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            let shadowWidth = Math.max(14, 38 - (this.z * 0.35));
            ctx.ellipse(drawX, this.y, shadowWidth, shadowWidth * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!this.isPlayer && !this.isDefeated) {
            let barW = 32;
            let barH = 4;
            let barX = drawX - barW / 2;
            let barY = this.y + 6;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
            
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(barX, barY, barW, barH);
            
            let healthPct = Math.max(0, this.health / this.maxHealth);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(barX, barY, barW * healthPct, barH);
        }

        ctx.save();
        ctx.translate(drawX, drawY);

        if (this.isGrabbed) {
            if (this.facing === 'left') {
                ctx.scale(-1, 1);
            }
            this.drawFullBody(ctx);
            ctx.restore();
            return;
        }

        if (this.isPlayer && this.isAngel) {
            ctx.globalAlpha = Math.max(0.05, 1.0 - (this.z * 0.008));
            this.drawFullBody(ctx);
            ctx.restore();
            return;
        }

        if (!this.isPlayer && this.x >= 70 && this.x <= 230 && (this.isDefeated || this.z < 0)) {
            // Rotates completely head down (-Math.PI or Math.PI depending on direction) for a stylish dive
            let diveTilt = (this.facing === 'left' ? 1 : -1) * Math.min(Math.PI * 0.95, Math.abs(this.z) * 0.08 + Math.PI * 0.5);
            ctx.rotate(diveTilt);

            ctx.globalAlpha = Math.max(0.05, 1.0 + (this.z / 90));
            this.drawFullBody(ctx);
            ctx.restore();
            return;
        }

        if (this.isDefeated) {
            ctx.rotate(Math.PI / 2); 
            if (this.facing === 'left') {
                ctx.scale(-1, -1); 
            }
            this.drawFullBody(ctx);
            ctx.restore();
            return;
        }

        if (this.isKnockedDown) {
            if (this.z === 0) {
                ctx.rotate(Math.PI / 2); 
            }
            
            if (this.facing === 'left') {
                ctx.scale(-1, -1); 
            }
            this.drawFullBody(ctx);
            ctx.restore();
            return;
        }

        if (this.facing === 'left') ctx.scale(-1, 1);
        this.drawFullBody(ctx);
        ctx.restore();
    }

    drawFullBody(ctx) {
        let isRunning = this.isPlayer && Input.isRunning();
        let bobMultiplier = isRunning ? 3.5 : 2;
        let walkCycleSpeed = isRunning ? 3.2 : 2;
        
        let bob = Math.sin(this.animFrame * bobMultiplier) * (isRunning ? 5 : 3);
        let walkCycle = Math.sin(this.animFrame * walkCycleSpeed);

        let hunchOffset = isRunning ? 12 : 0;
        let bodyTilt = isRunning ? 0.35 : 0;
        let headRecoilX = 0;
        let headRecoilY = 0;
        let isStomachHit = this.isStaggered && this.staggerType === 1;
        let isFaceRecoil = this.isStaggered && this.staggerType === 2;
        let isDazeHit = this.isStaggered && this.staggerType === 3;

        if (isStomachHit) {
            hunchOffset = 18;  
            bodyTilt = 0.5;   
        } else if (isFaceRecoil) {
            hunchOffset = -8;  
            headRecoilX = 8;
        } else if (isDazeHit) {
            hunchOffset = 8;   
            headRecoilY = 6;
        }

        let hipLeftX = -7, hipRightX = 7, hipY = -45;
        let legSpread = isRunning ? 22 : 14;
        let footLeftX = -10 + (this.isJumping ? 0 : walkCycle * legSpread);
        let footRightX = 10 + (this.isJumping ? 0 : -walkCycle * legSpread);
        let footY = -5;
        let footLeftY = footY - (isRunning ? Math.abs(walkCycle) * 8 : 0);
        let footRightY = footY - (isRunning ? Math.abs(Math.sin(this.animFrame * walkCycleSpeed + Math.PI)) * 8 : 0);

        let kneeLeftX = hipLeftX - 5 + (walkCycle * 8) + (isStomachHit ? 10 : 0);
        let kneeLeftY = -25 - (isRunning ? Math.abs(walkCycle) * 6 : 0);
        let kneeRightX = hipRightX + 5 - (walkCycle * 8) - (isStomachHit ? 10 : 0);
        let kneeRightY = -25 - (isRunning ? Math.abs(Math.sin(this.animFrame * walkCycleSpeed + Math.PI)) * 6 : 0);

        if (this.isGrabbed) {
            hipLeftX = -15; hipRightX = -5; hipY = -30;
            footLeftX = -35; footRightX = -25;
            kneeLeftX = -25; kneeRightX = -15;
            kneeLeftY = -30; kneeRightY = -30;
            footLeftY = -30; footRightY = -30;
        }

        if (isStomachHit) {
            footLeftX = -3;
            footRightX = 3;
        }

        if (this.isAttacking && this.attackType && this.attackType.startsWith('kick')) {
            kneeRightX = 22; kneeRightY = -45;
            footRightX = 58; footRightY = -48;
        } else if (this.isAttacking && this.attackType === 'jumpKick') {
            kneeRightX = 26; kneeRightY = -32;
            footRightX = 60; footRightY = -32;
        } else if (this.isAttacking && this.attackType === 'flyingKick') {
            kneeRightX = 30; kneeRightY = -22;
            footRightX = 64; footRightY = -22;
        } else if (this.isAttacking && this.attackType === 'grabKick') {
            kneeRightX = 24; kneeRightY = -42;
            footRightX = 62; footRightY = -45;
        }

        ctx.strokeStyle = this.isPlayer && this.isAngel ? '#ffffff' : this.colors.pants;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(hipLeftX, hipY);
        ctx.lineTo(kneeLeftX, kneeLeftY);
        ctx.lineTo(footLeftX, footLeftY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hipRightX, hipY);
        ctx.lineTo(kneeRightX, kneeRightY);
        ctx.lineTo(footRightX, footRightY);
        ctx.stroke();

        ctx.fillStyle = this.colors.secondary || '#111';
        ctx.fillRect(kneeLeftX - 4, kneeLeftY - 6, 8, 10);
        ctx.fillRect(kneeRightX - 4, kneeRightY - 6, 8, 10);

        ctx.fillStyle = '#1b1b1b';
        ctx.fillRect(footLeftX - 8, footLeftY - 5, 16, 9);
        ctx.fillRect(footRightX - 8, footRightY - 5, 16, 9);
        ctx.fillStyle = '#64748b'; 
        ctx.fillRect(footLeftX - 8, footLeftY, 16, 3);
        ctx.fillRect(footRightX - 8, footRightY, 16, 3);

        ctx.fillStyle = '#222';
        if (!this.isGrabbed) {
            ctx.fillRect(-16, -51, 32, 6);
            ctx.fillStyle = this.isPlayer && this.isAngel ? '#fef08a' : (this.isPlayer ? '#ecc94b' : '#dc2626'); 
            ctx.fillRect(-5, -51, 10, 6);
        }

        ctx.save();
        if (this.isGrabbed) {
            ctx.translate(-5, -45);
        } else {
            ctx.translate(0, -64);
            ctx.rotate(bodyTilt);
        }

        if (this.isPlayer && this.isAngel) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(-10, -10 + bob);
            ctx.quadraticCurveTo(-45, -35 + Math.sin(Date.now() * 0.01) * 10, -30, -55 + Math.sin(Date.now() * 0.01) * 8);
            ctx.quadraticCurveTo(-15, -45, -5, -20 + bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(10, -10 + bob);
            ctx.quadraticCurveTo(45, -35 + Math.sin(Date.now() * 0.01) * 10, 30, -55 + Math.sin(Date.now() * 0.01) * 8);
            ctx.quadraticCurveTo(15, -45, 5, -20 + bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        let bodyOffset = ((this.isPlayer && Input.isBlocking() && !isRunning) ? -6 : 0) + hunchOffset;
        let shirtW = this.isGrabbed ? 45 : 38;
        let shirtH = this.isGrabbed ? 32 : 34;

        if (this.isPlayer && this.isAngel) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-19 + bodyOffset, -20 + bob, shirtW, shirtH);
        } else if (this.shirtStyle === 'layered') {
            ctx.fillStyle = this.colors.secondary || '#2d3748'; 
            ctx.fillRect(-19 + bodyOffset, -20 + bob, shirtW, shirtH);
            ctx.fillStyle = this.colors.shirt; 
            ctx.fillRect(-17 + bodyOffset, -18 + bob, shirtW - 4, shirtH - 10);
        } else if (this.shirtStyle === 'tacticalVest') {
            ctx.fillStyle = '#1a202c'; 
            ctx.fillRect(-19 + bodyOffset, -20 + bob, shirtW, shirtH);
            ctx.fillStyle = this.colors.shirt; 
            ctx.fillRect(-17 + bodyOffset, -18 + bob, 14, shirtH - 4);
            ctx.fillRect(3 + bodyOffset, -18 + bob, 14, shirtH - 4);
            ctx.fillStyle = '#718096'; 
            ctx.fillRect(-6 + bodyOffset, -10 + bob, 12, 6);
        } else if (this.shirtStyle === 'hoodie') {
            ctx.fillStyle = this.colors.shirt;
            ctx.fillRect(-21 + bodyOffset, -21 + bob, shirtW + 4, shirtH + 2);
            ctx.fillStyle = this.colors.secondary || '#1a202c'; 
            ctx.fillRect(-12 + bodyOffset, -2 + bob, 24, 12);
        } else if (this.shirtStyle === 'cyberpunk') {
            ctx.fillStyle = this.colors.shirt;
            ctx.fillRect(-19 + bodyOffset, -20 + bob, shirtW, shirtH);
            ctx.fillStyle = this.colors.secondary || '#00ffff'; 
            ctx.fillRect(8 + bodyOffset, -20 + bob, 3, shirtH);
        } else {
            ctx.fillStyle = this.colors.shirt;
            ctx.fillRect(-19 + bodyOffset, -20 + bob, shirtW, shirtH);
            ctx.fillStyle = '#00000025';
            ctx.fillRect(-5 + bodyOffset, -20 + bob, 10, shirtH);
        }

        let shoulderLeftX = -15 + hunchOffset, shoulderRightX = 15 + hunchOffset, shoulderY = -12 + bob;
        let armCycle = Math.sin(this.animFrame * walkCycleSpeed);
        let handLeftX = isRunning ? -12 + (armCycle * 14) : (-24 + bodyOffset);
        let handLeftY = isRunning ? 5 + bob + (armCycle * 6) : (10 + bob);
        let handRightX = isRunning ? 12 - (armCycle * 14) : (20 + bodyOffset);
        let handRightY = isRunning ? 5 + bob - (armCycle * 6) : (10 + bob);
        
        let elbowLeftX = shoulderLeftX + (isRunning ? -6 : -7);
        let elbowLeftY = shoulderY + (isRunning ? 12 : 12);
        let elbowRightX = shoulderRightX + (isRunning ? 6 : 7);
        let elbowRightY = shoulderY + (isRunning ? 12 : 12);

        if (this.isGrabbed) {
            elbowLeftX = 10; elbowLeftY = 15; handLeftX = 25; handLeftY = 20;
            elbowRightX = 10; elbowRightY = -15; handRightX = 25; handRightY = -20;
        } else if (isStomachHit) {
            elbowLeftX = -6; elbowLeftY = 2; handLeftX = -2; handLeftY = 14;
            elbowRightX = 6; elbowRightY = 2; handRightX = 2; handRightY = 14;
        } else if (isFaceRecoil) {
            elbowLeftX = -16; elbowLeftY = -12; handLeftX = -18; handLeftY = -22;
            elbowRightX = 16; elbowRightY = -12; handRightX = 18; handRightY = -22;
        } else if (this.isPlayer && Input.isBlocking() && !isRunning) {
            elbowLeftX = -8; elbowLeftY = -12; handLeftX = -6; handLeftY = -15;
            elbowRightX = 6; elbowRightY = -12; handRightX = 4; handRightY = -15;
        } else if (this.isAttacking) {
            if (this.attackType && this.attackType.startsWith('punch')) {
                if (this.attackType === 'punch1') {
                    elbowRightX = 30; elbowRightY = -8;
                    handRightX = 52; handRightY = -6;
                } else if (this.attackType === 'punch2') {
                    elbowRightX = 34; elbowRightY = -4;
                    handRightX = 56; handRightY = -4;
                } else { 
                    elbowRightX = 38; elbowRightY = -10;
                    handRightX = 62; handRightY = -8;
                }
            } else if (this.attackType === 'weaponSwing') {
                elbowRightX = 32; elbowRightY = -20;
                handRightX = 48; handRightY = -15;
            } else if (this.attackType === 'kick' || this.attackType === 'flyingKick' || this.attackType === 'grabKick') {
                elbowRightX = 20; elbowRightY = -10;
                handRightX = 35; handRightY = -5;
            }
        }

        ctx.strokeStyle = this.colors.skin;
        ctx.lineWidth = 10;

        ctx.beginPath();
        ctx.moveTo(shoulderLeftX, shoulderY);
        ctx.lineTo(elbowLeftX, elbowLeftY);
        ctx.lineTo(handLeftX, handLeftY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shoulderRightX, shoulderY);
        ctx.lineTo(elbowRightX, elbowRightY);
        ctx.lineTo(handRightX, handRightY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(handLeftX, handLeftY, 5.5, 0, Math.PI * 2);
        ctx.arc(handRightX, handRightY, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.skin;
        ctx.fill();
        ctx.strokeStyle = '#2b1a09';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (this.weapon) {
            ctx.fillStyle = '#cbd5e0';
            ctx.fillRect(handRightX - 2, handRightY - 20, 8, 35);
        } else if (this.isAttacking && this.attackType === 'weaponSwing') {
            ctx.fillStyle = '#cbd5e0';
            ctx.fillRect(handRightX - 4, handRightY - 25, 10, 45);
        }

        ctx.restore(); 

        let headHunch = hunchOffset + headRecoilX;
        let headVert = headRecoilY + (isStomachHit ? 12 : 0) + (isRunning ? -2 : 0);
        
        if (this.isGrabbed) {
            ctx.fillStyle = this.colors.skin;
            ctx.fillRect(15, -46, 6, 10);
            
            ctx.fillStyle = this.colors.skin;
            ctx.fillRect(25, -50, 28, 26);
            ctx.fillStyle = this.colors.hair;
            ctx.fillRect(32, -55, 14, 32);
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(42, -43, 5, 6);
        } else {
            this.drawCustomHead(ctx, headHunch, bob, headVert, isStomachHit);
        }

        if (this.isPlayer && this.isAngel) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(headHunch, -145 + bob + headVert, 14, 6, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
            ctx.beginPath();
            ctx.arc(0, -70, 60, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCustomHead(ctx, headHunch, bob, headVert, isStomachHit) {
        ctx.fillStyle = this.colors.skin;
        ctx.fillRect(-20 + headHunch, -106 + bob + headVert, 5, 10);
        ctx.fillRect(15 + headHunch, -106 + bob + headVert, 5, 10);

        ctx.fillStyle = this.colors.skin;
        ctx.fillRect(-6 + headHunch, -90 + bob + headVert, 12, 9); 
        ctx.fillRect(-16 + headHunch, -118 + bob + headVert, 32, 30); 

        let hairColor = this.isPlayer && this.isAngel ? '#fef08a' : this.colors.hair;

        if (this.hairStyle === 'bald') {
        } else if (this.hairStyle === 'shavedFade') {
            ctx.fillStyle = hairColor;
            ctx.fillRect(-16 + headHunch, -122 + bob + headVert, 32, 6);
        } else if (this.hairStyle === 'punkMohawk') {
            ctx.fillStyle = '#111'; 
            ctx.fillRect(-14 + headHunch, -116 + bob + headVert, 28, 8);
            
            ctx.fillStyle = hairColor; 
            ctx.beginPath();
            ctx.moveTo(-5 + headHunch, -116 + bob + headVert);
            ctx.lineTo(-8 + headHunch, -140 + bob + headVert);
            ctx.lineTo(-2 + headHunch, -132 + bob + headVert);
            ctx.lineTo(3 + headHunch, -145 + bob + headVert);
            ctx.lineTo(8 + headHunch, -134 + bob + headVert);
            ctx.lineTo(6 + headHunch, -116 + bob + headVert);
            ctx.closePath();
            ctx.fill();
        } else if (this.hairStyle === 'dreadhawk') {
            ctx.fillStyle = hairColor;
            ctx.fillRect(-4 + headHunch, -136 + bob + headVert, 8, 24);
        } else if (this.hairStyle === 'braidedMohawk') {
            ctx.fillStyle = hairColor;
            ctx.fillRect(-3 + headHunch, -128 + bob + headVert, 6, 16);
            ctx.fillStyle = '#000'; 
            ctx.fillRect(-3 + headHunch, -124 + bob + headVert, 6, 2);
            ctx.fillRect(-3 + headHunch, -118 + bob + headVert, 6, 2);
        } else if (this.hairStyle === 'messyHawk') {
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(-16 + headHunch, -116 + bob + headVert);
            ctx.lineTo(-18 + headHunch, -132 + bob + headVert);
            ctx.lineTo(0 + headHunch, -126 + bob + headVert);
            ctx.lineTo(18 + headHunch, -134 + bob + headVert);
            ctx.lineTo(16 + headHunch, -116 + bob + headVert);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(-18 + headHunch, -112 + bob + headVert);
            ctx.lineTo(-22 + headHunch, -130 + bob + headVert);
            ctx.lineTo(-8 + headHunch, -120 + bob + headVert);
            ctx.lineTo(2 + headHunch, -135 + bob + headVert);
            ctx.lineTo(12 + headHunch, -122 + bob + headVert);
            ctx.lineTo(22 + headHunch, -128 + bob + headVert);
            ctx.lineTo(18 + headHunch, -108 + bob + headVert);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = '#1a202c';
        ctx.fillRect(4 + headHunch, -108 + bob + headVert, 6, 5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(7 + headHunch, -107 + bob + headVert, 2, 2);

        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(5 + headHunch, -92 + bob + headVert, 7, 3);
    }
}