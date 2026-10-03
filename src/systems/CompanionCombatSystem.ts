import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import type { ShipSystem } from './ShipSystem';
import type { Player } from '../entities/Player';
import type { Effects } from '../rendering/Effects';
import { SeededRandom } from '../utils/SeededRandom';
export type DamageEnemy = (enemy: Enemy, damage: number, knockback: number, x: number, y: number) => void;
export class CompanionCombatSystem {
    constructor(private random: SeededRandom) { }
    update(dt: number, ship: ShipSystem, player: Player, enemies: Enemy[], bullets: Projectile[], damage: number, hit: DamageEnemy, effects: Effects): void {
        ship.update(dt, player);
        if (ship.state !== 'active')
            return;
        player.hp = Math.min(player.maxHp, player.hp + ship.stats.repairRate * dt);
        let nearest: Enemy | undefined, distance = 850;
        for (const enemy of enemies) {
            const d = Math.hypot(enemy.x - ship.x, enemy.y - ship.y);
            if (!enemy.dead && d < distance) {
                nearest = enemy;
                distance = d;
            }
        }
        if (!nearest)
            return;
        const a = Math.atan2(nearest.y - ship.y, nearest.x - ship.x), stats = ship.stats;
        if (ship.fireCooldown <= 0) {
            for (let i = 0; i < stats.boltCount && bullets.length < 220; i++) {
                const angle = a + (i - (stats.boltCount - 1) / 2) * .09;
                const critical = this.random.next() < stats.critChance;
                const b = new Projectile(ship.x, ship.y, Math.cos(angle) * 600 * stats.projectileSpeed, Math.sin(angle) * 600 * stats.projectileSpeed, 85 * stats.boltDamage * damage * (critical ? 3 : 1), true, critical ? 0xffffff : 0x9af0ff, 5);
                b.source = 'ship';
                b.knockback = 100 * stats.knockback;
                b.chain = stats.chainDamage;
                bullets.push(b);
            }
            ship.fireCooldown = .8 / stats.fireRate;
        }
        if (ship.missileCooldown <= 0 && bullets.length < 220) {
            const b = new Projectile(ship.x, ship.y, Math.cos(a) * 340, Math.sin(a) * 340, 180 * stats.missileDamage * damage, true, 0xffc68e, 8);
            b.source = 'ship';
            b.explosion = 100 * stats.missileRadius;
            b.knockback = 180 * stats.knockback;
            bullets.push(b);
            ship.missileCooldown = 5 / stats.missileRate;
        }
        if (ship.laserCooldown <= 0) {
            ship.laserAngle = a;
            ship.laserTime = .7 * stats.beamDuration;
            ship.laserCooldown = 7 / stats.laserRecharge;
            effects.ring(ship.x, ship.y, 0x92efff, 60, .3);
        }
        if (ship.laserTime > 0) {
            const dx = Math.cos(ship.laserAngle), dy = Math.sin(ship.laserAngle);
            for (const enemy of enemies) {
                const ex = enemy.x - ship.x, ey = enemy.y - ship.y, along = ex * dx + ey * dy, across = Math.abs(ex * dy - ey * dx);
                if (!enemy.dead && along > 0 && along < 620 * stats.beamRange && across < 10 * stats.beamWidth + enemy.def.size)
                    hit(enemy, 260 * stats.beamDamage * damage * dt, 0, ship.x, ship.y);
            }
        }
    }
}
