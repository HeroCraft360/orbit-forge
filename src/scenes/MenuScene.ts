import Phaser from 'phaser';
import { screen, bind, logo, number, tag } from '../ui/UI';
import { saves } from '../managers/SaveManager';
import { DailySeedSystem } from '../systems/DailySeedSystem';
import { newRun } from './GameScene';
import { drawCore, drawItem } from '../rendering/Shapes';
import { ITEMS } from '../config/itemConfig';
import { SeededRandom } from '../utils/SeededRandom';
export class MenuScene extends Phaser.Scene {
    private art!: Phaser.GameObjects.Graphics;
    private stars: {
        x: number;
        y: number;
        alpha: number;
    }[] = [];
    private core: 'spark' | 'tide' = 'spark';
    constructor() { super('Menu'); }
    create(): void {
        saves.refresh();
        this.cameras.main.setBackgroundColor('#080f18');
        this.art = this.add.graphics();
        const random = new SeededRandom('menu-stars');
        this.stars = Array.from({ length: 130 }, () => ({ x: random.next(), y: random.next(), alpha: random.between(.12, .6) }));
        const daily = DailySeedSystem.today(), unlocked = saves.data.unlocked.includes('tide');
        screen('<main class="menu screen"><button class="techno-tab" id="techno-fusion"><span>⟫</span> TECHNO-FUSION <small>SHIP LAB</small></button><header class="site-header"><div class="brand">' + logo + '</div><div class="header-right"><span class="status-dot"></span> ALL SYSTEMS ONLINE <span class="build">EXPANSION / 0.2</span></div></header><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="line"></span> A COSMIC SURVIVAL ROGUELITE</div><h1>Small core.<br><span>Infinite</span><br><em>possibilities.</em></h1><p>Turn cosmic debris into your greatest weapon.<br>Collect. Fuse. Survive. Know when to leave.</p><div class="hero-buttons"><button class="primary play-button" id="play"><span class="play-triangle">▶</span> PLAY <span class="button-arrow">↗</span></button><button class="secondary" id="daily">DAILY ORBIT <span>◷</span></button></div><div class="control-hint"><span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span><span>move</span><i></i><span>your orbit does the rest</span></div>' + (unlocked ? '<button id="core-select" class="core-select">STARTING CORE: <strong id="core-name">SPARK</strong> ⇄</button>' : '') + '</div><div class="hero-diagram" aria-label="An evolving orbit of rocks, blades, meteors and planets"><div class="diagram-label top"><span class="tiny-cross">+</span> ORBITAL SYSTEM 001<br><small>A LITTLE CHAOS. UNDER YOUR CONTROL.</small></div><div class="diagram-label rock"><i></i><span>DEBRIS → POTENTIAL</span></div><div class="diagram-label planet"><span class="status-dot"></span><span>EVOLUTION IN PROGRESS</span></div><div class="diagram-caption"><span>◈</span> YOU ARE THE CENTER OF IT ALL.</div></div></section><section class="menu-panels"><button class="menu-card" id="discoveries"><div class="panel-icon">⟐</div><div><span class="eyebrow">THE ARCHIVE</span><h3>Discover the unexpected <span>↗</span></h3><p>' + saves.data.discoveries.length + ' / ' + Object.keys(ITEMS).length + ' orbital forms discovered</p><div class="archive-progress"><i style="width:' + saves.data.discoveries.length / Object.keys(ITEMS).length * 100 + '%"></i></div></div></button><button class="menu-card daily-card" id="daily-card"><div class="panel-icon">◎</div><div><span class="eyebrow">TODAY’S DAILY ORBIT ' + tag('SEEDED') + '</span><h3>' + daily.title.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase()) + ' <span>↗</span></h3><p>' + daily.modifiers[0] + ' · Same cosmos. New challenge.</p></div></button><div class="menu-card record-card"><div><span class="eyebrow">PERSONAL BEST</span><strong>' + number(saves.data.bestScore).padStart(6, '0') + '</strong><p>' + number(saves.data.totalRuns) + ' runs into the unknown</p></div><span class="record-star">✧</span></div></section><footer class="menu-footer"><span>FORGE SOMETHING EXTRAORDINARY.</span><div><span class="save-status">' + (saves.available ? 'LOCAL SAVE ACTIVE' : 'SESSION SAVE · STORAGE UNAVAILABLE') + '</span><button id="settings">⚙ &nbsp; SETTINGS</button></div></footer></main>');
        bind('techno-fusion', () => this.scene.start('TechnoFusion'));
        bind('play', () => this.scene.start('Game', newRun('normal', this.core)));
        bind('daily', () => this.scene.start('Daily'));
        bind('daily-card', () => this.scene.start('Daily'));
        bind('discoveries', () => this.scene.start('Discovery'));
        bind('settings', () => this.scene.start('Settings'));
        bind('core-select', () => { this.core = this.core === 'spark' ? 'tide' : 'spark'; document.getElementById('core-name')!.textContent = this.core.toUpperCase() + (this.core === 'tide' ? ' · MAGNET / WEAKER PULSE' : ' · BALANCED PULSE'); });
    }
    update(time: number): void {
        const g = this.art, w = this.scale.width, h = this.scale.height, t = time / 1000;
        const x = w * .715, y = h * .43, radius = Math.min(w * .175, h * .275);
        g.clear();
        for (const star of this.stars) {
            g.fillStyle(0xb8e0d5, star.alpha * (.8 + Math.sin(t + star.x * 12) * .2));
            g.fillCircle(star.x * w, star.y * h, star.alpha > .5 ? 1.2 : .6);
        }
        for (let i = 14; i > 0; i--) {
            g.fillStyle(0x397d6e, .008);
            g.fillCircle(x, y, radius * .4 + i * radius / 9);
        }
        g.lineStyle(1, 0x7ab5a7, .08);
        g.lineBetween(x - radius * 1.5, y, x + radius * 1.5, y);
        g.lineBetween(x, y - radius * 1.5, x, y + radius * 1.5);
        for (let ring = 1; ring <= 3; ring++) {
            const r = radius * (.35 + ring * .28);
            g.lineStyle(1, 0x83baa9, ring === 2 ? .24 : .13);
            g.strokeEllipse(x, y, r * 2, r * 1.65);
            for (let i = 0; i < 60; i++) {
                const a = i / 60 * Math.PI * 2;
                g.lineStyle(1, 0x83baa9, .12);
                g.lineBetween(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8) * .825, x + Math.cos(a) * (r + 11), y + Math.sin(a) * (r + 11) * .825);
            }
        }
        const parts = [{ type: 'planet', r: 1.17, a: -.5, speed: .10, scale: 1.4 }, { type: 'meteor', r: .93, a: 2.15, speed: .15, scale: 1.15 }, { type: 'blade', r: .65, a: -.9, speed: .23, scale: 1.3 }, { type: 'rock', r: .65, a: 2.4, speed: .23, scale: 1 }, { type: 'rock', r: 1.17, a: 3.7, speed: .10, scale: .9 }, { type: 'fire', r: .93, a: 5, speed: .15, scale: .8 }];
        for (const part of parts) {
            const a = part.a + t * part.speed, r = radius * part.r;
            for (let i = 1; i < 16; i++) {
                g.fillStyle(ITEMS[part.type]!.color, .1 * (1 - i / 16));
                g.fillCircle(x + Math.cos(a - i * .025) * r, y + Math.sin(a - i * .025) * r * .825, (15 - i) * .7);
            }
            drawItem(g, ITEMS[part.type]!, x + Math.cos(a) * r, y + Math.sin(a) * r * .825, a, part.scale * radius / 220);
        }
        drawCore(g, x, y, t, radius * .15);
        g.lineStyle(1, 0x9ef0d6, .5);
        for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + Math.PI / 4;
            g.strokeCircle(x + Math.cos(a) * radius * .3, y + Math.sin(a) * radius * .3, 2);
        }
    }
}
