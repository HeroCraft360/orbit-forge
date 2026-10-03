import { STARS } from '../config/starConfig';
import type { StellarSystem } from './StellarSystem';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import type { Effects } from '../rendering/Effects';
import type { DamageEnemy } from './CompanionCombatSystem';
export class StellarCombatSystem {
    private echoes: {
        remaining: number;
        x: number;
        y: number;
        radius: number;
        damage: number;
        color: number;
    }[] = [];
    update(dt: number, time: number, star: StellarSystem, player: Player, enemies: Enemy[], bullets: Projectile[], power: number, hit: DamageEnemy, effects: Effects): void {
        if (!star.current)
            return;
        const def = STARS[star.current];
        player.hp = Math.min(player.maxHp, player.hp + (star.value('heal') + (star.current === 'sun' ? .4 : 0)) * dt);
        for (const echo of this.echoes) {
            echo.remaining -= dt;
            if (echo.remaining <= 0) {
                for (const e of enemies)
                    if (!e.dead && Math.hypot(e.x - echo.x, e.y - echo.y) < echo.radius + e.def.size)
                        hit(e, echo.damage, 200, echo.x, echo.y);
                effects.ring(echo.x, echo.y, echo.color, echo.radius, .6);
            }
        }
        this.echoes = this.echoes.filter(e => e.remaining > 0);
        star.cooldown -= dt;
        if (star.cooldown > 0)
            return;
        star.cooldown = def.cooldown / (1 + star.value('haste'));
        const damage = 220 * power * (1 + star.value('damage')), radius = (star.current === 'supernova' ? 330 : star.current === 'blackhole' ? 270 : 240) * (1 + star.value('range'));
        if (star.current === 'pulsar') {
            const count = star.value('echo') ? 4 : 2;
            for (let i = 0; i < count && bullets.length < 220; i++) {
                const a = time * .8 + i / count * Math.PI * 2;
                const b = new Projectile(player.x, player.y, Math.cos(a) * 650, Math.sin(a) * 650, damage, true, def.color, 10);
                b.source = 'star';
                b.piercing = true;
                b.life = 1.2 * (1 + star.value('range'));
                bullets.push(b);
            }
            effects.ring(player.x, player.y, def.color, 70, .25);
            return;
        }
        for (const e of enemies)
            if (!e.dead && Math.hypot(e.x - player.x, e.y - player.y) < radius + e.def.size) {
                hit(e, damage, star.current === 'supernova' ? 450 : star.current === 'blackhole' ? -170 : 120, player.x, player.y);
                if (star.current === 'sun')
                    e.burn = 4;
            }
        if (star.current === 'blackhole')
            for (const b of bullets)
                if (!b.friendly && Math.hypot(b.x - player.x, b.y - player.y) < radius)
                    b.life = 0;
        effects.ring(player.x, player.y, def.color, radius, .6);
        effects.burst(player.x, player.y, def.color, 36, radius);
        if (star.value('echo'))
            this.echoes.push({ remaining: .5, x: player.x, y: player.y, radius, damage: damage * .5, color: def.color });
    }
}
