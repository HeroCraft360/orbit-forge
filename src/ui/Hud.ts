import { isBossType } from '../config/bossConfig';
import { STARS } from '../config/starConfig';
import { clock, number, logo, screen, bind, itemIcon } from './UI';
import type { GameScene } from '../scenes/GameScene';
import { RARITY_COLORS } from '../config/itemConfig';
export class Hud {
    private inventory = '';
    private toastTime = 0;
    constructor(private scene: GameScene) {
        screen('<div class="hud"><header class="hud-top"><div class="vitals"><div class="micro"><span>CORE INTEGRITY</span><strong id="hp-text"></strong></div><div class="bar health"><i id="hp"></i></div><div class="xp-row"><span id="level">LV 01</span><div class="bar xp"><i id="xp"></i></div></div></div><div class="score-block"><span class="micro">RUN SCORE</span><strong id="score">000000</strong><span id="combo"></span></div><div class="run-time"><strong id="timer">00:00</strong><span id="risk">RISK ×1</span><button class="icon-button" id="pause" aria-label="Pause">Ⅱ</button></div></header><div id="boss-bar"></div><div id="toast" role="status"></div><div id="debug"></div><footer class="hud-bottom"><div class="mini-brand">' + logo + '</div><div class="orbit-loadout"><span class="micro">YOUR ORBIT <b id="slots"></b></span><div id="inventory"></div></div><div class="hud-hint" id="hint"></div></footer></div>');
        const stellarButton = document.createElement('button');
        stellarButton.id = 'stellar-tree';
        stellarButton.className = 'stellar-button';
        stellarButton.hidden = true;
        document.getElementById('ui')!.appendChild(stellarButton);
        bind('stellar-tree', () => scene.openStellarTree());
        bind('pause', () => scene.pauseGame());
    }
    toast(title: string, subtitle = '', color = '#95f7d5'): void {
        const el = document.getElementById('toast')!;
        el.innerHTML = '<span class="micro">' + subtitle + '</span><strong style="color:' + color + '">' + title + '</strong>';
        el.classList.add('visible');
        this.toastTime = 3.5;
    }
    update(dt: number): void {
        const s = this.scene;
        const set = (id: string, value: string): void => { const el = document.getElementById(id); if (el && el.textContent !== value)
            el.textContent = value; };
        set('hp-text', Math.ceil(s.player.hp) + ' / ' + s.player.maxHp);
        document.getElementById('hp')!.style.width = s.player.hp / s.player.maxHp * 100 + '%';
        document.getElementById('xp')!.style.width = s.upgrades.xp / s.upgrades.threshold * 100 + '%';
        set('level', 'LV ' + String(s.upgrades.level).padStart(2, '0'));
        set('score', number(s.score.value));
        set('timer', clock(s.elapsed));
        set('risk', 'RISK ×' + s.difficulty.risk);
        set('combo', s.score.combo.multiplier > 1 ? '×' + s.score.combo.multiplier + '  CHAIN REACTION' : '');
        set('slots', s.orbit.items.length + '/16');
        set('hint', s.extraction.open ? 'PORTAL OPEN · press E to choose · ' + Math.ceil(s.extraction.expires - s.elapsed) + 's' : s.elapsed < 12 ? 'MOVE  W A S D  /  ↑ ← ↓ →    ·    WEAPONS FIRE AUTOMATICALLY' : 'NEXT EXTRACTION ' + clock(Math.max(0, s.extraction.next - s.elapsed)) + '    ·    ESC PAUSE');
        const key = s.orbit.items.map(i => i.type).join(',');
        if (key !== this.inventory) {
            this.inventory = key;
            document.getElementById('inventory')!.innerHTML = s.orbit.items.map(i => '<span class="loadout-item" title="' + i.def.name + ' · ' + i.def.description + '">' + itemIcon(i.type, RARITY_COLORS[i.def.rarity]) + '</span>').join('');
        }
        const stellarButton = document.getElementById('stellar-tree')!;
        stellarButton.hidden = !s.stellar.current;
        if (s.stellar.current)
            stellarButton.textContent = STARS[s.stellar.current].icon + ' ' + STARS[s.stellar.current].name + ' · ' + s.stellar.points + ' POINTS [T]';
        const boss = s.enemies.find(e => isBossType(e.type));
        const bossEl = document.getElementById('boss-bar')!;
        bossEl.innerHTML = boss ? '<span class="micro">' + boss.def.name + '</span><div class="bar"><i style="width:' + boss.hp / boss.maxHp * 100 + '%"></i></div>' : '';
        this.toastTime -= dt;
        if (this.toastTime <= 0)
            document.getElementById('toast')!.classList.remove('visible');
        const lab = document.getElementById('debug-tools');
        if (lab)
            lab.hidden = !s.debugVisible;
        set('debug', s.debugVisible ? 'DEV · ' + Math.round(s.game.loop.actualFps) + ' FPS · ' + s.enemies.length + ' ENEMIES · ' + s.pickups.length + ' LOOT · SEED ' + s.run.seed : '');
    }
}
