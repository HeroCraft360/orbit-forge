import { ENEMIES, type EnemyType } from '../config/enemyConfig';
export class Enemy {
    readonly def;
    hp: number;
    maxHp: number;
    vx = 0;
    vy = 0;
    flash = 0;
    burn = 0;
    cooldown = 2;
    age = 0;
    dead = false;
    constructor(public id: number, public type: EnemyType, public x: number, public y: number, health: number, public speedScale: number) {
        this.def = ENEMIES[type];
        this.hp = this.maxHp = this.def.hp * health;
    }
    update(dt: number, target: {
        x: number;
        y: number;
    }, gravity: number): void {
        this.age += dt;
        this.flash = Math.max(0, this.flash - dt);
        this.cooldown -= dt;
        const dx = target.x - this.x, dy = target.y - this.y, d = Math.hypot(dx, dy) || 1;
        const direction = this.type === 'shooter' && d < 270 ? -.5 : 1;
        const speed = this.def.speed * this.speedScale * direction + (d < 250 ? gravity * 30 : 0);
        const charge = this.type === 'boss' && this.age % 8 > 6.7 ? 3.5 : 1;
        this.x += (dx / d * speed * charge + this.vx) * dt;
        this.y += (dy / d * speed * charge + this.vy) * dt;
        this.vx *= Math.exp(-8 * dt);
        this.vy *= Math.exp(-8 * dt);
    }
}
