export class Pickup {
    age = 0;
    constructor(public kind: 'energy' | 'part' | 'heal', public x: number, public y: number, public vx: number, public vy: number, public value = 1, public type = 'rock') { }
    update(dt: number, target: {
        x: number;
        y: number;
    }, range: number): boolean {
        this.age += dt;
        const dx = target.x - this.x, dy = target.y - this.y, d = Math.hypot(dx, dy) || 1;
        if (d < range && this.age > .2) {
            const speed = Math.max(210, 650 - d);
            this.vx += (dx / d * speed - this.vx) * Math.min(1, dt * 12);
            this.vy += (dy / d * speed - this.vy) * Math.min(1, dt * 12);
        }
        else {
            this.vx *= Math.exp(-5 * dt);
            this.vy *= Math.exp(-5 * dt);
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        return d < 23 && this.age > .18;
    }
}
