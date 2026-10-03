import { isBossType } from '../config/bossConfig';
import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import type { EnemyType } from '../config/enemyConfig';
import { SeededRandom } from '../utils/SeededRandom';
export interface BossHazard {
    x: number;
    y: number;
    radius: number;
    remaining: number;
    life: number;
    damage: number;
    exploded: boolean;
}
interface BossMemory {
    charge: number;
    charging: boolean;
    summon: number;
}
export class BossSystem {
    hazards: BossHazard[] = [];
    private memory = new Map<number, BossMemory>();
    constructor(private random: SeededRandom) { }
    update(dt: number, enemies: Enemy[], player: Player, bullets: Projectile[], spawn: (type: EnemyType, a: number, d: number) => void, hit: (damage: number) => void, blast: (x: number, y: number, r: number) => void): void {
        for (const enemy of enemies) {
            if (!isBossType(enemy.type) || enemy.dead)
                continue;
            let state = this.memory.get(enemy.id);
            if (!state) {
                state = { charge: 0, charging: false, summon: 8 };
                this.memory.set(enemy.id, state);
            }
            const aim = Math.atan2(player.y - enemy.y, player.x - enemy.x), cycle = enemy.age % 7;
            if (enemy.type === 'reaper') {
                if (cycle >= 4.4 && !state.charging) {
                    state.charge = aim;
                    state.charging = true;
                }
                if (cycle < 1)
                    state.charging = false;
                if (cycle > 5.5 && cycle < 6.2) {
                    enemy.x += Math.cos(state.charge) * 650 * dt;
                    enemy.y += Math.sin(state.charge) * 650 * dt;
                }
            }
            if (enemy.type === 'leviathan') {
                enemy.x += Math.cos(enemy.age * .8) * 45 * dt;
                enemy.y += Math.sin(enemy.age * 1.1) * 40 * dt;
            }
            if (enemy.type === 'choir') {
                enemy.x += Math.cos(aim + Math.PI / 2) * 75 * dt;
                enemy.y += Math.sin(aim + Math.PI / 2) * 75 * dt;
                state.summon -= dt;
                if (state.summon <= 0) {
                    for (let i = 0; i < 5; i++)
                        spawn('swarm', this.random.between(0, Math.PI * 2), 260);
                    state.summon = 11;
                }
            }
            if (enemy.cooldown > 0)
                continue;
            if (enemy.type === 'leviathan' && this.hazards.length < 30) {
                for (let i = 0; i < 5; i++) {
                    const a = i / 5 * Math.PI * 2 + enemy.age;
                    this.hazards.push({ x: player.x + Math.cos(a) * 170, y: player.y + Math.sin(a) * 170, radius: 72, remaining: 1.8, life: 2.15, damage: 36, exploded: false });
                }
            }
            const count = enemy.type === 'reaper' ? 5 : enemy.type === 'choir' ? 9 : 18;
            for (let i = 0; i < count && bullets.length < 220; i++) {
                const a = enemy.type === 'reaper' ? aim + (i - 2) * .15 : enemy.type === 'choir' ? enemy.age * 1.8 + i / count * Math.PI * 2 : aim + i / count * Math.PI * 2;
                // Leave a readable escape gap in the large radial barrages.
                if (count === 18 && (i === 0 || i === 1))
                    continue;
                bullets.push(new Projectile(enemy.x, enemy.y, Math.cos(a) * 185, Math.sin(a) * 185, enemy.def.damage * .65, false, enemy.def.color, 7));
            }
            enemy.cooldown = enemy.type === 'choir' ? 1.5 : enemy.type === 'leviathan' ? 4 : 2.6;
        }
        for (const hazard of this.hazards) {
            hazard.remaining -= dt;
            hazard.life -= dt;
            if (!hazard.exploded && hazard.remaining <= 0) {
                hazard.exploded = true;
                blast(hazard.x, hazard.y, hazard.radius);
                if (Math.hypot(player.x - hazard.x, player.y - hazard.y) < hazard.radius + player.radius)
                    hit(hazard.damage);
            }
        }
        this.hazards = this.hazards.filter(h => h.life > 0);
        for (const id of this.memory.keys())
            if (!enemies.some(e => e.id === id))
                this.memory.delete(id);
    }
    chargeAngle(id: number): number | undefined { return this.memory.get(id)?.charge; }
}
