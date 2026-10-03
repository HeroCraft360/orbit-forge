import { modal, closeModal, bind } from './UI';
import type { UpgradeDefinition } from '../config/upgradeConfig';
export class UpgradePanel {
    static show(level: number, choices: UpgradeDefinition[], select: (upgrade: UpgradeDefinition) => void): void {
        modal('<section class="choice-panel"><div class="eyebrow">LEVEL ' + String(level).padStart(2, '0') + ' / CORE SYNCHRONIZED</div><h2>Become a little <em>unstoppable.</em></h2><p class="muted">Choose a signal. Shape your orbit.</p><div class="upgrade-grid">' + choices.map((u, i) => '<button class="upgrade-card" id="upgrade-' + i + '"><span class="card-index">0' + (i + 1) + '</span><span class="upgrade-icon">' + u.icon + '</span><span class="eyebrow">' + u.eyebrow + '</span><h3>' + u.name + '</h3><p>' + u.description + '</p><span class="card-action">INTEGRATE <span>↗</span></span></button>').join('') + '</div><span class="micro">SIMULATION PAUSED · CHOOSE WITH MOUSE</span></section>');
        choices.forEach((u, i) => bind('upgrade-' + i, () => { closeModal(); select(u); }));
    }
}
