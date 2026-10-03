import Phaser from 'phaser';
import { saves } from '../managers/SaveManager';
import { audio } from '../managers/AudioManager';
import { screen, bind, logo } from '../ui/UI';
export class SettingsScene extends Phaser.Scene {
    constructor() { super('Settings'); }
    create(): void {
        this.cameras.main.setBackgroundColor('#080f18');
        const sliders = [{ key: 'master', name: 'Master volume', description: 'The overall signal level.' }, { key: 'effects', name: 'Effects volume', description: 'Synthesized impacts, fusions, and pickups.' }, { key: 'shake', name: 'Screen shake', description: 'Set to zero for a steadier view.' }, { key: 'particles', name: 'Particle density', description: 'Less visual noise, more breathing room.' }] as const;
        screen('<main class="subscreen screen"><header class="site-header"><div class="brand">' + logo + '</div><button class="back-button" id="back">← BACK TO FORGE</button></header><section class="settings-page"><span class="eyebrow">YOUR SIGNAL. YOUR RULES.</span><h2>Tune the <em>cosmos.</em></h2>' + sliders.map(s => '<label class="setting-row"><span><strong>' + s.name + '</strong><small>' + s.description + '</small></span><input id="' + s.key + '" type="range" min="0" max="100" value="' + saves.data.settings[s.key] * 100 + '" /><output id="' + s.key + '-value">' + Math.round(saves.data.settings[s.key] * 100) + '%</output></label>').join('') + '<label class="setting-row"><span><strong>Damage numbers</strong><small>Show damage dealt to enemies.</small></span><input id="damageNumbers" type="checkbox" ' + (saves.data.settings.damageNumbers ? 'checked' : '') + ' /></label><p class="muted">Changes save automatically on this device. Audio is synthesized locally.<br>WASD / arrow keys to move · Esc to pause · E at an extraction window.</p></section></main>');
        for (const s of sliders)
            document.getElementById(s.key)!.addEventListener('input', event => {
                saves.data.settings[s.key] = Number((event.target as HTMLInputElement).value) / 100;
                document.getElementById(s.key + '-value')!.textContent = Math.round(saves.data.settings[s.key] * 100) + '%';
                saves.persist();
            });
        document.getElementById('damageNumbers')!.addEventListener('change', event => { saves.data.settings.damageNumbers = (event.target as HTMLInputElement).checked; saves.persist(); });
        document.getElementById('effects')!.addEventListener('change', () => { audio.unlock(); audio.play('merge'); });
        bind('back', () => this.scene.start('Menu'));
    }
}
