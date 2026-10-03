import { STARS, STELLAR_SKILLS } from '../config/starConfig';
import type { StellarSystem } from '../systems/StellarSystem';
import { modal, bind, closeModal } from './UI';
import { audio } from '../managers/AudioManager';
export class StellarPanel {
    static show(system: StellarSystem, close: () => void): void {
        if (!system.current)
            return;
        const star = STARS[system.current];
        modal('<section class="stellar-panel"><span class="eyebrow">' + star.kind + ' / RUN SKILL TREE</span><h2>' + star.name + ' <em>' + star.icon + '</em></h2><p class="muted">' + star.trait + '</p><div class="stellar-points">' + system.points + ' STELLAR POINTS <small>+1 EVERY 3 LEVELS WHILE ASCENDED</small></div><div class="stellar-grid">' + STELLAR_SKILLS.filter(s => s.star === star.id).map(skill => {
            const installed = system.skills.has(skill.id), ready = system.canUnlock(skill.id);
            return '<button id="stellar-' + skill.id + '" class="stellar-node ' + (installed ? 'learned' : '') + '" ' + (!ready ? 'disabled' : '') + '><span class="eyebrow">' + skill.branch + '</span><h3>' + skill.name + '</h3><p>' + skill.description + '</p><span class="micro">' + (installed ? 'INTEGRATED' : skill.requires && !system.skills.has(skill.requires) ? 'REQUIRES ' + STELLAR_SKILLS.find(s => s.id === skill.requires)!.name.toUpperCase() : '1 STELLAR POINT') + '</span></button>';
        }).join('') + '</div><button class="primary" id="stellar-close">RETURN TO THE COSMOS ↗</button><p class="micro">SKILLS LAST FOR THIS RUN · RETURNING TO A FORM RESTORES ITS SKILLS</p></section>');
        for (const skill of STELLAR_SKILLS)
            bind('stellar-' + skill.id, () => { if (system.unlock(skill.id)) {
                audio.play('upgrade');
                this.show(system, close);
            } });
        bind('stellar-close', () => { closeModal(); close(); });
    }
}
