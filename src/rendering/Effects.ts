import Phaser from 'phaser';
import { GAME } from '../config/gameConfig';
import { saves } from '../managers/SaveManager';
import { SeededRandom } from '../utils/SeededRandom';
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    size: number;
    color: number;
}
interface Ring {
    x: number;
    y: number;
    life: number;
    max: number;
    radius: number;
    color: number;
}
export class Effects {
    particles: Particle[] = [];
    rings: Ring[] = [];
    private random = new SeededRandom('cosmetic');
    private numbers: {
        text: Phaser.GameObjects.Text;
        life: number;
    }[];
    constructor(private scene: Phaser.Scene) {
        this.numbers = Array.from({ length: 24 }, () => ({ text: scene.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '12px', color: '#eafcf4' }).setDepth(10).setVisible(false), life: 0 }));
    }
    burst(x: number, y: number, color: number, count = 12, force = 100): void {
        const amount = Math.floor(count * saves.data.settings.particles);
        for (let i = 0; i < amount && this.particles.length < GAME.maxParticles; i++) {
            const a = this.random.between(0, Math.PI * 2), speed = this.random.between(force * .3, force), life = this.random.between(.2, .7);
            this.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life, max: life, size: this.random.between(1, 3), color });
        }
    }
    ring(x: number, y: number, color: number, radius = 100, duration = .45): void {
        if (this.rings.length < 24)
            this.rings.push({ x, y, color, radius, life: duration, max: duration });
    }
    damage(x: number, y: number, amount: number): void {
        if (!saves.data.settings.damageNumbers)
            return;
        const slot = this.numbers.find(n => n.life <= 0);
        if (slot) {
            slot.life = .55;
            slot.text.setText(String(Math.round(amount))).setPosition(x, y - 15).setVisible(true).setAlpha(1);
        }
    }
    shake(strength = 1): void { if (saves.data.settings.shake)
        this.scene.cameras.main.shake(100, .002 * strength * saves.data.settings.shake); }
    update(dt: number): void {
        for (const p of this.particles) {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= .97;
            p.vy *= .97;
        }
        this.particles = this.particles.filter(p => p.life > 0);
        for (const r of this.rings)
            r.life -= dt;
        this.rings = this.rings.filter(r => r.life > 0);
        for (const n of this.numbers)
            if (n.life > 0) {
                n.life -= dt;
                n.text.y -= dt * 32;
                n.text.setAlpha(Math.max(0, n.life / .55));
                n.text.setVisible(n.life > 0);
            }
    }
    draw(g: Phaser.GameObjects.Graphics): void {
        for (const p of this.particles) {
            g.fillStyle(p.color, p.life / p.max);
            g.fillCircle(p.x, p.y, p.size);
        }
        for (const r of this.rings) {
            g.lineStyle(2, r.color, r.life / r.max);
            g.strokeCircle(r.x, r.y, (1 - r.life / r.max) * r.radius);
        }
    }
}
