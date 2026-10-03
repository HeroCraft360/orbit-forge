import Phaser from 'phaser';
import { ITEMS, RARITY_COLORS } from '../config/itemConfig';
import { RECIPES } from '../config/mergeRecipes';
import { saves } from '../managers/SaveManager';
import { screen, bind, logo, itemIcon, number } from '../ui/UI';
export class DiscoveryScene extends Phaser.Scene {
    constructor() { super('Discovery'); }
    create(): void {
        saves.refresh();
        this.cameras.main.setBackgroundColor('#080f18');
        screen('<main class="subscreen screen"><header class="site-header"><div class="brand">' + logo + '</div><button class="back-button" id="back">← BACK TO FORGE</button></header><div class="page-heading"><div><span class="eyebrow">THE ARCHIVE / PERSISTENT DISCOVERIES</span><h2>Nothing lost.<br><em>Everything discovered.</em></h2></div><div class="archive-count">' + saves.data.discoveries.length + '<span> / ' + Object.keys(ITEMS).length + '<small>ORBITAL FORMS</small></span></div></div><p class="muted">Collect parts and fuse them in a run to reveal their identities. Discoveries survive every collapse.</p><div class="discovery-grid">' + Object.values(ITEMS).map(item => {
            const known = saves.data.discoveries.includes(item.id);
            const relations = RECIPES.filter(r => r.output === item.id || r.inputs.includes(item.id)).map(r => saves.data.recipes.includes(r.id) ? r.inputs.map(id => ITEMS[id]!.name).join(' + ') + ' → ' + ITEMS[r.output]!.name : '??? + ??? → ???');
            return '<article class="discovery-card ' + (known ? '' : 'unknown') + '">' + (known ? itemIcon(item.id, RARITY_COLORS[item.rarity]) : '<span class="item-icon">◇</span>') + '<span class="eyebrow">' + (known ? item.rarity + ' / FORM ' + String(item.level).padStart(2, '0') : 'UNIDENTIFIED SIGNAL') + '</span><h3>' + (known ? item.name : '???') + '</h3><p>' + (known ? item.description : 'Somewhere in the debris, a possibility waits.') + '</p><div class="part-tally"><strong>' + number(saves.data.parts[item.id] ?? 0) + ' <small>AVAILABLE</small></strong><span>' + number(saves.data.collected[item.id] ?? 0) + ' COLLECTED ALL TIME</span></div><div class="recipe-list">' + (known ? relations.slice(0, 3).join('<br>') || 'Rare mutation · alternate fusion outcome' : 'DISCOVER TO REVEAL') + '</div></article>';
        }).join('') + '</div><footer class="page-foot">RECIPES FOUND ' + saves.data.recipes.length + ' / ' + RECIPES.length + ' <span>MUTATIONS FOUND ' + saves.data.mutations.length + ' / 2</span></footer></main>');
        bind('back', () => this.scene.start('Menu'));
    }
}
