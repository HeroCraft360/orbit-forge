import Phaser from 'phaser';
import { drawShip, drawStar, drawBossDetail } from './ExpansionArt';
import { isBossType } from '../config/bossConfig';
import type { GameScene } from '../scenes/GameScene';
import { ITEMS } from '../config/itemConfig';
import { GAME } from '../config/gameConfig';
import { drawCore, drawItem, polygon } from './Shapes';
export class ArenaRenderer {
    private g: Phaser.GameObjects.Graphics;
    constructor(private scene: GameScene) { this.g = scene.add.graphics().setDepth(0); }
    draw(): void {
        const s = this.scene, g = this.g, cam = s.cameras.main;
        g.clear();
        const left = cam.scrollX, top = cam.scrollY, right = left + cam.width, bottom = top + cam.height;
        g.lineStyle(1, 0x233942, .24);
        for (let x = Math.floor(left / 64) * 64; x < right; x += 64)
            g.lineBetween(x, top, x, bottom);
        for (let y = Math.floor(top / 64) * 64; y < bottom; y += 64)
            g.lineBetween(left, y, right, y);
        for (let x = Math.floor(left / 128) * 128; x < right; x += 128)
            for (let y = Math.floor(top / 128) * 128; y < bottom; y += 128) {
                g.fillStyle(0x90c7bf, .16);
                g.fillCircle(x, y, 1.5);
            }
        g.lineStyle(1, 0x547c79, .15);
        g.strokeCircle(0, 0, 380);
        g.strokeCircle(0, 0, 760);
        g.lineStyle(3, 0xffae79, .3);
        g.strokeRect(-GAME.worldRadius, -GAME.worldRadius, GAME.worldRadius * 2, GAME.worldRadius * 2);
        const visible = (x: number, y: number): boolean => x > left - 100 && x < right + 100 && y > top - 100 && y < bottom + 100;
        for (const p of s.pickups) {
            if (!visible(p.x, p.y))
                continue;
            if (p.kind === 'part') {
                g.lineStyle(1, ITEMS[p.type]!.color, .28 + Math.sin(s.elapsed * 4) * .1);
                g.strokeCircle(p.x, p.y, 25);
                drawItem(g, ITEMS[p.type]!, p.x, p.y + Math.sin(s.elapsed * 3 + p.x) * 3, s.elapsed, .75);
            }
            else if (p.kind === 'heal') {
                g.fillStyle(0x8af1c8, .15);
                g.fillCircle(p.x, p.y, 12);
                g.lineStyle(3, 0x8af1c8, 1);
                g.lineBetween(p.x - 5, p.y, p.x + 5, p.y);
                g.lineBetween(p.x, p.y - 5, p.x, p.y + 5);
            }
            else {
                g.fillStyle(0x85eecf, .12);
                g.fillCircle(p.x, p.y, 9);
                g.fillStyle(0x85eecf, .9);
                g.lineStyle(0, 0, 0);
                polygon(g, p.x, p.y, 4, 4);
            }
        }
        const e = s.extraction;
        if (e.open) {
            for (let i = 0; i < 4; i++) {
                g.lineStyle(2, 0x9dfcda, .55 - i * .1);
                g.strokeEllipse(e.x, e.y, 60 + i * 14 + Math.sin(s.elapsed * 4) * 8, 100 + i * 14);
            }
            g.fillStyle(0x74f9d0, .09);
            g.fillEllipse(e.x, e.y, 65, 110);
        }
        for (const hazard of s.bosses.hazards) {
            g.fillStyle(0xb69aff, hazard.exploded ? .3 : .055);
            g.fillCircle(hazard.x, hazard.y, hazard.radius);
            g.lineStyle(2, 0xd1b7ff, .7);
            g.strokeCircle(hazard.x, hazard.y, hazard.radius);
            g.lineStyle(2, 0xff99be, .6);
            g.strokeCircle(hazard.x, hazard.y, hazard.radius * Math.max(0, hazard.remaining / 1.8));
        }
        for (const enemy of s.enemies) {
            if (!visible(enemy.x, enemy.y))
                continue;
            const { x, y, def, type } = enemy, color = enemy.flash > 0 ? 0xffffff : def.color;
            const boss = isBossType(type), elite = type === 'elite';
            if (boss && enemy.age % 8 > 5.5) {
                g.lineStyle(2, 0xffa18b, .4);
                g.strokeCircle(x, y, def.size + 18 + Math.sin(s.elapsed * 20) * 5);
            }
            g.fillStyle(color, .13);
            g.lineStyle(boss ? 3 : 1.5, color, .85);
            polygon(g, x, y, def.size, def.sides, Math.atan2(s.player.y - y, s.player.x - x) + (boss ? s.elapsed * .3 : 0));
            g.fillStyle(color, .7);
            g.lineStyle(0, 0, 0);
            polygon(g, x, y, def.size * .33, boss ? 6 : 3, s.elapsed * (boss ? -.6 : 0));
            if (boss)
                drawBossDetail(g, enemy, s.bosses, s.elapsed);
            if (enemy.burn > 0) {
                g.lineStyle(1, 0xffa263, .65);
                g.strokeCircle(x, y, def.size + 4);
            }
            if (elite || boss || enemy.hp < enemy.maxHp) {
                const width = def.size * 1.7;
                g.fillStyle(0x24303b, 1);
                g.fillRect(x - width / 2, y - def.size - 10, width, 3);
                g.fillStyle(def.color, .9);
                g.fillRect(x - width / 2, y - def.size - 10, width * Math.max(0, enemy.hp / enemy.maxHp), 3);
            }
        }
        const p = s.player;
        g.lineStyle(1, 0x78d9c0, .16);
        g.strokeEllipse(p.x, p.y, GAME.orbitRadius * Math.max(.55, s.modifiers.radius) * 2, GAME.orbitRadius * Math.max(.55, s.modifiers.radius) * 1.72);
        for (const item of s.orbit.items) {
            if (item.age < .02)
                continue;
            const r = Math.hypot(item.x - p.x, item.y - p.y);
            for (let i = 1; i < 8; i++) {
                const a = item.angle - i * .07;
                g.fillStyle(item.def.color, .16 * (1 - i / 8));
                g.fillCircle(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * .86, item.def.size * (1 - i / 10));
            }
            drawItem(g, item.def, item.x, item.y, item.angle + Math.PI / 2);
        }
        if (s.stellar.current)
            drawStar(g, s.stellar.current, p.x, p.y, s.elapsed, p.invulnerable > 0);
        else
            drawCore(g, p.x, p.y, s.elapsed, p.radius + 2, p.invulnerable > 0);
        drawShip(g, s.ship, p, s.time.now / 1000);
        for (const bullet of s.projectiles) {
            g.lineStyle(bullet.radius * 1.1, bullet.color, .15);
            g.lineBetween(bullet.x, bullet.y, bullet.x - bullet.vx * .035, bullet.y - bullet.vy * .035);
            g.fillStyle(bullet.color, 1);
            g.fillCircle(bullet.x, bullet.y, bullet.radius);
        }
        s.effects.draw(g);
    }
}
