import Phaser from 'phaser';
import { screen, bind, number, clock, logo, itemIcon } from '../ui/UI';
import { ITEMS } from '../config/itemConfig';
import type { RunRecord } from '../managers/SaveManager';
import { saves } from '../managers/SaveManager';
import { newRun, type RunOptions } from './GameScene';
interface Results {
    record: RunRecord;
    earned: number;
    extracted: boolean;
    discoveries: string[];
    merges: number;
    bosses: number;
    risk: number;
    run: RunOptions;
}
export class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOver'); }
    create(result: Results): void {
        this.cameras.main.setBackgroundColor('#080f18');
        const { record, extracted } = result;
        screen('<main class="results screen"><header class="site-header"><div class="brand">' + logo + '</div><span class="eyebrow">SIGNAL ' + (extracted ? 'RECOVERED' : 'LOST') + '</span></header><section class="result-content"><span class="result-symbol">' + (extracted ? '◎' : '◇') + '</span><span class="eyebrow">' + (extracted ? 'EXTRACTION SUCCESSFUL' : 'YOU COLLAPSED') + '</span><h2>' + (extracted ? 'A little wiser.<br><em>A lot more stardust.</em>' : 'Even stars fall.<br><em>Forge another.</em>') + '</h2><div class="result-score">' + number(record.score) + '</div><span class="micro">' + (record.score >= saves.data.bestScore && record.score > 0 ? 'PERSONAL BEST · ' : '') + 'FINAL SCORE / RISK ×' + result.risk + '</span><div class="result-stats"><div><strong>' + clock(record.time) + '</strong><span>TIME SURVIVED</span></div><div><strong>' + number(record.kills) + '</strong><span>ENEMIES DEFEATED</span></div><div><strong>' + result.merges + '</strong><span>FUSIONS</span></div><div><strong>+' + number(result.earned) + '</strong><span>STARDUST BANKED</span></div></div>' + (result.discoveries.length ? '<div class="new-discoveries"><span class="eyebrow">DISCOVERIES SECURED</span><div>' + result.discoveries.map(id => '<span>' + itemIcon(id) + ITEMS[id]!.name + '</span>').join('') + '</div>' : '') + (extracted ? '<p class="unlock-note">TIDE CORE UNLOCKED · Start with a Magnet and a weaker core pulse. Select it on the main menu.</p>' : '<p class="muted">Your discoveries are safe. Collapse banks partial stardust; extraction banks more.</p>') + '<div class="button-row"><button class="primary" id="again">PLAY AGAIN ↗</button><button class="secondary" id="menu">RETURN TO FORGE</button></div></section></main>');
        bind('again', () => this.scene.start('Game', result.run.mode === 'daily' ? result.run : newRun('normal', result.run.core)));
        bind('menu', () => this.scene.start('Menu'));
    }
}
