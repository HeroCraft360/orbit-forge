import Phaser from 'phaser';
import type { ItemDefinition } from '../config/itemConfig';
export function polygon(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, sides: number, rotation = 0): void {
    g.beginPath();
    for (let i = 0; i <= sides; i++) {
        const a = i / sides * Math.PI * 2 + rotation, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        if (i === 0)
            g.moveTo(px, py);
        else
            g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
}
export function drawItem(g: Phaser.GameObjects.Graphics, item: ItemDefinition, x: number, y: number, angle = 0, scale = 1, glow = true): void {
    const r = item.size * scale, color = item.color;
    if (glow) {
        g.fillStyle(color, .05);
        g.fillCircle(x, y, r * 2);
        g.fillStyle(color, .07);
        g.fillCircle(x, y, r * 1.5);
    }
    g.fillStyle(color, .25);
    g.lineStyle(1.5, color, .95);
    if (item.shape === 'blade') {
        const points = [[-r * 1.5, 0], [0, -r * .35], [r * 1.5, 0], [0, r * .35]].map(([a, b]) => new Phaser.Math.Vector2(x + a! * Math.cos(angle) - b! * Math.sin(angle), y + a! * Math.sin(angle) + b! * Math.cos(angle)));
        g.fillPoints(points, true);
        g.strokePoints(points, true);
    }
    else if (item.shape === 'planet') {
        g.fillCircle(x, y, r);
        g.strokeCircle(x, y, r);
        g.lineStyle(2, color, .8);
        g.strokeEllipse(x, y, r * 3, r * .8);
        g.lineStyle(1, 0xffffff, .3);
        g.strokeEllipse(x, y, r * 1.5, r * .5);
    }
    else if (item.shape === 'orb') {
        g.fillCircle(x, y, r);
        g.strokeCircle(x, y, r);
        g.fillStyle(0xffffff, .8);
        g.fillCircle(x - r * .2, y - r * .2, r * .3);
        if (item.specialEffect === 'lightning') {
            g.lineStyle(2, 0xffffff, .85);
            g.lineBetween(x + 4, y - r, x - 4, y + 2);
            g.lineBetween(x - 4, y + 2, x + 5, y);
            g.lineBetween(x + 5, y, x - 4, y + r);
        }
    }
    else if (item.shape === 'magnet') {
        g.lineStyle(r * .4, color, .9);
        g.beginPath();
        g.arc(x, y, r * .65, 0, Math.PI, false);
        g.strokePath();
        g.lineBetween(x - r * .65, y, x - r * .65, y - r * .65);
        g.lineBetween(x + r * .65, y, x + r * .65, y - r * .65);
    }
    else
        polygon(g, x, y, r, item.shape === 'shield' ? 6 : 7, angle);
    if (item.rarity === 'mythic') {
        g.lineStyle(1, color, .4);
        g.strokeCircle(x, y, r + 7);
    }
}
export function drawCore(g: Phaser.GameObjects.Graphics, x: number, y: number, time: number, size = 17, hurt = false): void {
    const color = hurt ? 0xffb2a5 : 0x89f5d2;
    for (let i = 4; i > 0; i--) {
        g.fillStyle(color, .022);
        g.fillCircle(x, y, size + i * 9);
    }
    g.lineStyle(1, color, .25);
    g.strokeCircle(x, y, size * 1.8 + Math.sin(time * 2) * 2);
    g.fillStyle(color, .12);
    g.lineStyle(2, color, .95);
    polygon(g, x, y, size, 6, -Math.PI / 6);
    g.fillStyle(color, 1);
    g.lineStyle(0, 0, 0);
    polygon(g, x, y, size * .5, 6, -Math.PI / 6);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x, y, size * .12);
}
