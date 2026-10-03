import { isBossType } from '../config/bossConfig';
import { ComboSystem } from './ComboSystem';
export class ScoreSystem {
    value = 0;
    kills = 0;
    elites = 0;
    bosses = 0;
    merges = 0;
    highest = 1;
    mutations = 0;
    combo = new ComboSystem();
    kill(base: number, kind: string, risk: number): void {
        this.combo.kill();
        this.kills++;
        if (kind === 'elite')
            this.elites++;
        if (isBossType(kind))
            this.bosses++;
        this.value += base * this.combo.multiplier * risk;
    }
    merge(level: number, mutated: boolean, risk: number): void {
        this.merges++;
        this.highest = Math.max(this.highest, level);
        if (mutated)
            this.mutations++;
        this.value += (level * 200 + (mutated ? 3000 : 0)) * risk;
    }
    update(dt: number, risk: number): void { this.combo.update(dt); this.value += dt * 5 * risk; }
}
