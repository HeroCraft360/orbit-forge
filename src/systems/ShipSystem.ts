import { SHIP_SCORE, shipStats, type ShipStats } from '../config/shipConfig';
export class ShipSystem {
    state: 'dormant' | 'arriving' | 'active' = 'dormant';
    x = 0;
    y = 0;
    angle = 0;
    arrival = 0;
    arrivalX = 0;
    arrivalY = 0;
    fireCooldown = 0;
    missileCooldown = 2;
    laserCooldown = 5;
    laserTime = 0;
    laserAngle = 0;
    stats: ShipStats;
    readonly radius = 350;
    constructor(ranks: Record<string, number>) { this.stats = shipStats(ranks); }
    check(score: number, core: {
        x: number;
        y: number;
    }, halfViewport: number): boolean {
        if (this.state !== 'dormant' || score < SHIP_SCORE)
            return false;
        this.state = 'arriving';
        this.arrival = 0;
        this.arrivalX = core.x + Math.max(halfViewport, 450) + 140;
        this.arrivalY = core.y - 90;
        this.x = this.arrivalX;
        this.y = this.arrivalY;
        return true;
    }
    updateArrival(dt: number, core: {
        x: number;
        y: number;
    }): boolean {
        this.arrival = Math.min(1, this.arrival + dt / 2.8);
        const t = 1 - (1 - this.arrival) ** 3;
        this.x = this.arrivalX + (core.x + this.radius - this.arrivalX) * t;
        this.y = this.arrivalY + (core.y - this.arrivalY) * t - Math.sin(t * Math.PI) * 80;
        if (this.arrival >= 1) {
            this.state = 'active';
            this.angle = 0;
            return true;
        }
        return false;
    }
    update(dt: number, core: {
        x: number;
        y: number;
    }): void {
        if (this.state !== 'active')
            return;
        this.angle += dt * .65 * this.stats.orbitSpeed;
        this.x = core.x + Math.cos(this.angle) * this.radius;
        this.y = core.y + Math.sin(this.angle) * this.radius * .86;
        this.fireCooldown -= dt;
        this.missileCooldown -= dt;
        this.laserCooldown -= dt;
        this.laserTime = Math.max(0, this.laserTime - dt);
    }
}
