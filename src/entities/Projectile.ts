export class Projectile {
    life = 3;
    source: 'core' | 'ship' | 'star' = 'core';
    explosion = 0;
    knockback = 35;
    chain = 0;
    piercing = false;
    hits = new Set<number>();
    constructor(public x: number, public y: number, public vx: number, public vy: number, public damage: number, public friendly: boolean, public color: number, public radius = 5) { }
    update(dt: number): void { this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt; }
}
