import { BOSS_TYPES } from '../config/bossConfig';
import type { EnemyType } from '../config/enemyConfig';
import { GAME } from '../config/gameConfig';
import { SeededRandom } from '../utils/SeededRandom';
import { DifficultySystem } from './DifficultySystem';
export class SpawnSystem {
    cooldown = .7;
    nextElite = GAME.eliteInterval;
    nextBoss = GAME.firstBoss;
    constructor(private random: SeededRandom) { }
    update(dt: number, time: number, difficulty: DifficultySystem, bossRate: number, spawn: (type: EnemyType, angle: number, distance: number) => void): void {
        this.cooldown -= dt;
        if (this.cooldown <= 0) {
            const pool: EnemyType[] = time < 18 ? ['crawler'] : time < 40 ? ['crawler', 'crawler', 'runner', 'swarm'] : ['crawler', 'runner', 'tank', 'swarm', 'shooter'];
            const type = this.random.pick(pool), angle = this.random.between(0, Math.PI * 2);
            for (let i = 0; i < (type === 'swarm' ? 5 : 1); i++)
                spawn(type, angle + i * .07, 510 + i * 10);
            this.cooldown = difficulty.spawnInterval(time);
        }
        if (time >= this.nextElite) {
            spawn('elite', this.random.between(0, Math.PI * 2), 500);
            this.nextElite = time + GAME.eliteInterval / (1 + difficulty.stays * .2);
        }
        if (time >= this.nextBoss / bossRate) {
            spawn(this.nextBoss === GAME.firstBoss ? 'boss' : this.random.pick(BOSS_TYPES), this.random.between(0, Math.PI * 2), 550);
            this.nextBoss = (time + GAME.bossInterval / (bossRate + difficulty.stays * .3)) * bossRate;
        }
    }
}
