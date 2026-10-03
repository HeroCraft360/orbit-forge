import { isBossType } from '../config/bossConfig';
import { Pickup } from '../entities/Pickup';
import { BASE_DROPS } from '../config/itemConfig';
import { SeededRandom } from '../utils/SeededRandom';
export class LootSystem {
    constructor(private random: SeededRandom) { }
    drop(x: number, y: number, type: string, luck: number, first: boolean): Pickup[] {
        const boss = isBossType(type), elite = type === 'elite', count = boss ? 26 : elite ? 10 : 2;
        const loot: Pickup[] = [];
        for (let i = 0; i < count; i++) {
            const a = this.random.between(0, Math.PI * 2), speed = this.random.between(80, boss ? 450 : 170);
            loot.push(new Pickup('energy', x, y, Math.cos(a) * speed, Math.sin(a) * speed, boss ? 5 : elite ? 3 : 2));
        }
        const parts = boss ? 8 : elite ? 3 : first || this.random.next() < .16 + Math.min(.3, luck * .12) ? 1 : 0;
        for (let i = 0; i < parts; i++) {
            const a = this.random.between(0, Math.PI * 2);
            const part = first ? 'rock' : boss && i < 2 ? 'meteor' : this.random.pick(BASE_DROPS);
            loot.push(new Pickup('part', x, y, Math.cos(a) * 180, Math.sin(a) * 180, 1, part));
        }
        if (elite || boss || this.random.next() < .07)
            loot.push(new Pickup('heal', x + 12, y, 0, 80, boss ? 40 : 15));
        return loot;
    }
}
