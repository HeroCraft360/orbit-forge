export class ComboSystem {
    count = 0;
    remaining = 0;
    get multiplier(): number { return Math.min(16, 2 ** Math.floor(this.count / 6)); }
    kill(): void { this.count++; this.remaining = 3; }
    update(dt: number): void { this.remaining = Math.max(0, this.remaining - dt); if (!this.remaining)
        this.count = 0; }
}
