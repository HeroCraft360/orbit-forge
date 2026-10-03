import Phaser from 'phaser';
import { SHIP_UPGRADES, shipUpgradeCost } from '../config/shipConfig';
import { ITEMS } from '../config/itemConfig';
import { saves } from '../managers/SaveManager';
import { audio } from '../managers/AudioManager';
import { screen, bind, logo, number, itemIcon } from '../ui/UI';
export class TechnoFusionScene extends Phaser.Scene {
    private branch = 'Ballistics';
    private announcement = '';
    constructor() { super('TechnoFusion'); }
    create(): void { this.cameras.main.setBackgroundColor('#080f18'); saves.refresh(); this.render(); }
    private render(): void {
        const total = Object.values(saves.data.parts).reduce((a, b) => a + b, 0);
        const ranks = Object.values(saves.data.shipUpgrades).reduce((a, b) => a + b, 0);
        screen('<main class="subscreen screen lab"><header class="site-header"><div class="brand">' + logo + '</div><button class="back-button" id="back">← BACK TO FORGE</button></header><div class="page-heading"><div><span class="eyebrow">TECHNO-FUSION / PERMANENT SHIP ENGINEERING</span><h2>Build your <em>second heart.</em></h2><p class="muted">Your escort arrives at 500,000 run score. Every installed module returns with it.</p></div><div class="lab-stats"><strong>' + ranks + ' / 60</strong><span>MODULE RANKS INSTALLED</span><small>' + number(total) + ' parts available</small></div></div><div class="lab-overview"><div class="ship-blueprint" aria-label="Astral Skiff spacecraft blueprint"><svg viewBox="0 0 240 140" aria-hidden="true"><ellipse cx="120" cy="70" rx="102" ry="48" fill="none" stroke="#527d8655"/><path d="M30 70H210M120 15V125" stroke="#527d8644"/><path d="M184 70 75 25 93 70 75 115Z" fill="#284653" stroke="#9fdfe7" stroke-width="2"/><path d="M89 58 35 70 89 82" fill="#85ebff44"/><path d="M135 57 156 70 135 83 116 70Z" fill="#b9f8ff"/><circle cx="86" cy="43" r="3" fill="#ffcf8c"/><circle cx="86" cy="97" r="3" fill="#ffcf8c"/></svg><b>ASTRAL SKIFF / MK ' + (ranks + 1) + '</b></div><div><span class="eyebrow">THE RULES OF THE FORGE</span><p>20 modules · 3 ranks each · 4 engineering paths.</p><p class="muted">Buy a preceding module to open the next. Costs increase with each rank. Materials are earned from pickups and fusions, even on failed runs. Lifetime collection totals never decrease.</p><span class="micro">DAILY ORBIT USES A STANDARD SHIP FOR AN EVEN START.</span></div></div><nav class="lab-tabs" aria-label="Engineering paths">' + ['Ballistics', 'Photonics', 'Navigation', 'Payload'].map(branch => '<button class="' + (branch === this.branch ? 'selected' : '') + '" id="branch-' + branch + '">' + branch + '</button>').join('') + '</nav><div id="lab-announcement" class="lab-announcement ' + (this.announcement ? 'unlocked' : '') + '" role="status">' + this.announcement + '</div><div class="tech-grid">' + SHIP_UPGRADES.filter(u => u.branch === this.branch).map((u, index) => {
            const rank = saves.data.shipUpgrades[u.id] ?? 0, status = saves.canPurchase(u.id), cost = shipUpgradeCost(u, rank);
            return '<article class="tech-card ' + (rank ? 'installed' : '') + '"><div class="tech-top"><span class="upgrade-icon">' + u.icon + '</span><span class="micro">0' + (index + 1) + ' / RANK ' + rank + ' OF ' + u.maxRank + '</span></div><h3>' + u.name + '</h3><p>' + u.description + '</p><div class="rank-pips">' + [0, 1, 2].map(i => '<i class="' + (rank > i ? 'on' : '') + '"></i>').join('') + '</div><div class="material-costs">' + (status === 'maxed' ? '<span class="maxed-label">FULLY INTEGRATED</span>' : Object.entries(cost).map(([id, amount]) => '<div class="' + ((saves.data.parts[id] ?? 0) >= amount ? 'enough' : 'missing') + '">' + itemIcon(id) + '<span>' + ITEMS[id]!.name + '</span><strong>' + number(saves.data.parts[id] ?? 0) + ' / ' + number(amount) + '</strong></div>').join('')) + '</div><button id="buy-' + u.id + '" class="secondary" ' + (status !== 'purchased' || !saves.available ? 'disabled' : '') + '>' + (status === 'maxed' ? 'MAX RANK' : status === 'locked' ? 'REQUIRES ' + SHIP_UPGRADES.find(p => p.id === u.requires)!.name.toUpperCase() : status === 'insufficient' ? 'MORE MATERIALS NEEDED' : rank ? 'UPGRADE TO RANK ' + (rank + 1) + ' ↗' : 'UNLOCK MODULE ↗') + '</button></article>';
        }).join('') + '</div><p class="page-foot">MATERIALS ARE TRACKED FROM VERSION 0.2 ONWARD. EXISTING DISCOVERIES ARE PRESERVED.</p></main>');
        bind('back', () => this.scene.start('Menu'));
        for (const branch of ['Ballistics', 'Photonics', 'Navigation', 'Payload'])
            bind('branch-' + branch, () => { this.branch = branch; this.announcement = ''; this.render(); });
        for (const u of SHIP_UPGRADES)
            bind('buy-' + u.id, () => {
                const result = saves.purchase(u.id);
                this.announcement = result === 'purchased' ? '✧ YOU JUST UNLOCKED · ' + u.name.toUpperCase() + ' / RANK ' + saves.data.shipUpgrades[u.id] : result === 'storage-unavailable' ? 'Save unavailable. No materials were spent.' : 'Requirements changed. No materials were spent.';
                if (result === 'purchased')
                    audio.play('mutation');
                this.render();
                document.getElementById('lab-announcement')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
    }
}
