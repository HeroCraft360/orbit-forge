/** Separate gameplay and cosmetic streams keep rendering from changing daily outcomes. */
export class SeededRandom {
    private state: number;
    constructor(seed: string | number) {
        this.state = typeof seed === 'number' ? seed >>> 0 : [...seed].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
    }
    next(): number {
        let t = this.state += 0x6d2b79f5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    between(min: number, max: number): number { return min + this.next() * (max - min); }
    pick<T>(items: readonly T[]): T { return items[Math.floor(this.next() * items.length)]!; }
    shuffle<T>(items: readonly T[]): T[] {
        const result = [...items];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [result[i], result[j]] = [result[j]!, result[i]!];
        }
        return result;
    }
}
