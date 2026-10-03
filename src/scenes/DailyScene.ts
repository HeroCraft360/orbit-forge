import Phaser from 'phaser';
import { DailySeedSystem } from '../systems/DailySeedSystem';
import { saves } from '../managers/SaveManager';
import { screen, bind, logo, number, clock } from '../ui/UI';
import { newRun } from './GameScene';
export class DailyScene extends Phaser.Scene {
    constructor() { super('Daily'); }
    create(): void {
        this.cameras.main.setBackgroundColor('#080f18');
        const daily = DailySeedSystem.today(), best = saves.data.daily[daily.date];
        screen('<main class="subscreen screen"><header class="site-header"><div class="brand">' + logo + '</div><button class="back-button" id="back">← BACK TO FORGE</button></header><section class="daily-layout"><div><span class="eyebrow">DAILY ORBIT / ' + daily.date + ' UTC</span><h2>Same cosmos.<br><em>Make it yours.</em></h2><p class="muted">One seed for everyone. A different constellation of risks.<br>Your best run stays on this device.</p><div class="daily-modifiers">' + daily.modifiers.map((m, i) => '<div><span>0' + (i + 1) + '</span><strong>' + m + '</strong></div>').join('') + '</div><button class="primary" id="start-daily">ENTER DAILY ORBIT ↗</button><p class="micro seed-label">SEED · ' + daily.seed + '<br>FIXED SPARK CORE · NO ONLINE LEADERBOARD</p></div><div class="daily-emblem"><div class="daily-orbit-art">◎<span>✧</span></div><span class="eyebrow">' + daily.title + '</span><h3>' + (best ? number(best.score) : 'UNEXPLORED') + '</h3><p>' + (best ? 'LOCAL BEST · ' + clock(best.time) + ' · ' + best.kills + ' KILLS · EVOLUTION ' + best.evolution : 'Your first signal is still out there.') + '</p></div></section></main>');
        bind('back', () => this.scene.start('Menu'));
        bind('start-daily', () => this.scene.start('Game', newRun('daily')));
    }
}
