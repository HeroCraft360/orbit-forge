import { UPGRADES, type UpgradeDefinition } from '../config/upgradeConfig';
import { SeededRandom } from '../utils/SeededRandom';
export class UpgradeSystem {
    level = 1;
    xp = 0;
    pending = 0;
    constructor(private random: SeededRandom) { }
    get threshold(): number { const beyond = Math.max(0, this.level - 100); return Math.ceil((10 + this.level * 7) * (1 + beyond / 12 + beyond * beyond / 900)); }
    gain(amount: number): void {
        this.xp += amount;
        while (this.xp >= this.threshold) {
            this.xp -= this.threshold;
            this.level++;
            this.pending++;
        }
    }
    choices(): UpgradeDefinition[] { return this.random.shuffle(UPGRADES).slice(0, 3); }
}
