export class DifficultySystem {
    risk = 1;
    stays = 0;
    health(time: number): number { return (1 + time / 150) * (1 + this.stays * .25); }
    speed(time: number): number { return Math.min(1.8, 1 + time / 700 + this.stays * .07); }
    spawnInterval(time: number): number { return Math.max(.16, 1.05 - time / 210) / Math.sqrt(this.risk); }
    stay(): void { this.stays++; this.risk *= 2; }
}
