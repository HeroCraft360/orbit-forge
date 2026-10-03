import Phaser from 'phaser';
import { STARS, type StarId } from '../config/starConfig';
import type { ShipSystem } from '../systems/ShipSystem';
import type { Enemy } from '../entities/Enemy';
import type { BossSystem } from '../systems/BossSystem';
import { polygon } from './Shapes';
export function drawStar(g: Phaser.GameObjects.Graphics, id: StarId, x: number, y: number, t: number, hurt: boolean): void {
    const color = hurt ? 0xffffff : STARS[id].color, r = id === 'blackhole' ? 23 : id === 'supernova' ? 26 : 22;
    for (let i = 5; i > 0; i--) {
        g.fillStyle(color, .025);
        g.fillCircle(x, y, r + i * 10);
    }
    if (id === 'blackhole') {
        g.lineStyle(5, 0xffbc80, .5);
        g.strokeEllipse(x, y, 95, 28);
        g.lineStyle(2, color, .85);
        g.strokeEllipse(x, y, 105, 33);
        g.fillStyle(0x02040b, 1);
        g.fillCircle(x, y, r);
        g.lineStyle(2, 0xffe7bd, .95);
        g.strokeCircle(x, y, r + 2);
        for (let i = 0; i < 9; i++) {
            const a = t * 1.8 + i / 9 * Math.PI * 2;
            g.fillStyle(0xffd4a0, .6);
            g.fillCircle(x + Math.cos(a) * 46, y + Math.sin(a) * 14, 2);
        }
        return;
    }
    if (id === 'pulsar') {
        for (let i = 0; i < 2; i++) {
            const a = t * .8 + i * Math.PI;
            g.lineStyle(14, color, .07);
            g.lineBetween(x, y, x + Math.cos(a) * 95, y + Math.sin(a) * 95);
            g.lineStyle(2, color, .8);
            g.lineBetween(x, y, x + Math.cos(a) * 70, y + Math.sin(a) * 70);
        }
    }
    else {
        for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2 + t * .25, length = r + 12 + Math.sin(t * 3 + i) * 8;
            g.lineStyle(id === 'supernova' ? 4 : 2, color, .6);
            g.lineBetween(x + Math.cos(a) * (r + 4), y + Math.sin(a) * (r + 4), x + Math.cos(a) * length, y + Math.sin(a) * length);
        }
    }
    g.fillStyle(color, .3);
    g.fillCircle(x, y, r);
    g.lineStyle(2, color, .9);
    g.strokeCircle(x, y, r);
    g.fillStyle(0xffffff, .95);
    g.fillCircle(x, y, id === 'pulsar' ? 10 : 14);
    g.lineStyle(1, color, .4);
    g.strokeCircle(x, y, r + 8 + Math.sin(t * 3) * 3);
}
export function drawShip(g: Phaser.GameObjects.Graphics, ship: ShipSystem, core: {
    x: number;
    y: number;
}, time: number): void {
    if (ship.state === 'dormant')
        return;
    const angle = ship.state === 'arriving' ? Math.PI : ship.angle + Math.PI / 2;
    g.lineStyle(1, 0x8bdbef, .12);
    g.strokeEllipse(core.x, core.y, ship.radius * 2, ship.radius * 1.72);
    const transform = (x: number, y: number) => new Phaser.Math.Vector2(ship.x + x * Math.cos(angle) - y * Math.sin(angle), ship.y + x * Math.sin(angle) + y * Math.cos(angle));
    const flame = [transform(-18, -5), transform(-42 - Math.sin(time * 28) * 8, 0), transform(-18, 5)];
    g.fillStyle(0x95efff, .28);
    g.fillPoints(flame, true);
    g.lineStyle(1, 0xa5e8ff, .95);
    g.fillStyle(0x355766, .85);
    g.fillPoints([[26, 0], [-18, -18], [-9, 0], [-18, 18]].map(([x, y]) => transform(x!, y!)), true);
    g.strokePoints([[26, 0], [-18, -18], [-9, 0], [-18, 18]].map(([x, y]) => transform(x!, y!)), true);
    const nose = transform(8, 0);
    g.fillStyle(0xe1fbff, 1);
    g.fillCircle(nose.x, nose.y, 4);
    for (const offset of [-12, 12]) {
        const wing = transform(-7, offset);
        g.fillStyle(0xffd898, .9);
        g.fillCircle(wing.x, wing.y, 2);
    }
    if (ship.state === 'active' && ship.laserCooldown < 1 && ship.laserTime === 0) {
        g.lineStyle(2, 0xb5f5ff, 1 - ship.laserCooldown);
        g.strokeCircle(ship.x, ship.y, 25 + ship.laserCooldown * 15);
    }
    if (ship.laserTime > 0) {
        const x = ship.x + Math.cos(ship.laserAngle) * 620 * ship.stats.beamRange, y = ship.y + Math.sin(ship.laserAngle) * 620 * ship.stats.beamRange;
        g.lineStyle(26 * ship.stats.beamWidth, 0x8eeeff, .12);
        g.lineBetween(ship.x, ship.y, x, y);
        g.lineStyle(10 * ship.stats.beamWidth, 0x8eeeff, .55);
        g.lineBetween(ship.x, ship.y, x, y);
        g.lineStyle(3, 0xffffff, 1);
        g.lineBetween(ship.x, ship.y, x, y);
    }
}
export function drawBossDetail(g: Phaser.GameObjects.Graphics, e: Enemy, bosses: BossSystem, time: number): void {
    const { x, y, def } = e;
    g.lineStyle(1, def.color, .3);
    g.strokeCircle(x, y, def.size + 14);
    if (e.type === 'reaper') {
        for (let i = 0; i < 3; i++) {
            const a = time * .65 + i * Math.PI * 2 / 3;
            g.lineStyle(4, def.color, .8);
            g.lineBetween(x + Math.cos(a) * def.size * .65, y + Math.sin(a) * def.size * .65, x + Math.cos(a + .45) * def.size * 1.3, y + Math.sin(a + .45) * def.size * 1.3);
        }
        if (e.age % 7 > 4.4 && e.age % 7 < 5.5) {
            const a = bosses.chargeAngle(e.id) ?? 0;
            g.lineStyle(30, def.color, .08);
            g.lineBetween(x, y, x + Math.cos(a) * 560, y + Math.sin(a) * 560);
            g.lineStyle(2, def.color, .8);
            g.lineBetween(x, y, x + Math.cos(a) * 560, y + Math.sin(a) * 560);
        }
    }
    else if (e.type === 'leviathan') {
        for (let i = 0; i < 7; i++) {
            const a = i / 7 * Math.PI * 2 + time * .2;
            const px = x + Math.cos(a) * (def.size + 12), py = y + Math.sin(a) * (def.size + 12);
            g.fillStyle(def.color, .15);
            g.lineStyle(2, def.color, .7);
            polygon(g, px, py, 18, 4, a);
        }
        g.lineStyle(4, 0x110e24, 1);
        g.strokeEllipse(x, y, def.size * 1.7, def.size * .6);
    }
    else if (e.type === 'choir') {
        for (let i = 0; i < 6; i++) {
            const a = i / 6 * Math.PI * 2 - time * .6;
            const px = x + Math.cos(a) * (def.size + 18), py = y + Math.sin(a) * (def.size + 18);
            g.fillStyle(0xebe4ff, .85);
            g.fillCircle(px, py, 6);
            g.lineStyle(1, def.color, .25);
            g.lineBetween(x, y, px, py);
        }
    }
    else {
        for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2 + time * .2;
            g.lineStyle(4, def.color, .7);
            g.lineBetween(x + Math.cos(a) * def.size, y + Math.sin(a) * def.size, x + Math.cos(a) * (def.size + 20), y + Math.sin(a) * (def.size + 20));
        }
    }
}
