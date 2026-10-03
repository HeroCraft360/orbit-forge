import type { GameScene } from '../scenes/GameScene';
import { GAME } from '../config/gameConfig';
import { root, bind } from './UI';
import { saves } from '../managers/SaveManager';
import { ITEMS } from '../config/itemConfig';
/** Accessible development controls. This module and its call site are gated by Vite's DEV flag. */
export class DebugTools {
    constructor(scene: GameScene) {
        if (!GAME.debug)
            return;
        const el = document.createElement('aside');
        el.id = 'debug-tools';
        el.hidden = true;
        el.innerHTML = '<span>DEVELOPMENT LAB · F1</span>' + [
            ['debug-rock', 'Add Rock'], ['debug-build', 'Evolved orbit'], ['debug-elite', 'Spawn elite'],
            ['debug-boss', 'Spawn boss'], ['debug-loot', 'Defeat enemies'], ['debug-xp', 'Level up'],
            ['debug-portal', 'Open portal'], ['debug-collapse', 'Collapse core'], ['debug-ship', 'Ship milestone'], ['debug-star', 'Stellar milestone'], ['debug-reaper', 'Spawn Reaper'], ['debug-leviathan', 'Spawn Leviathan'], ['debug-choir', 'Spawn Choir'], ['debug-materials', 'Test materials'], ['debug-level100', 'Level 100'],
        ].map(([id, label]) => '<button id="' + id + '">' + label + '</button>').join('');
        root.appendChild(el);
        const active = (action: () => void): void => { if (!scene.paused && !scene.ended)
            action(); };
        bind('debug-rock', () => active(() => scene.addPart('rock')));
        bind('debug-build', () => active(() => ['planet', 'meteor', 'blade', 'shield', 'fire', 'lightning', 'magnet'].forEach(id => scene.addPart(id))));
        bind('debug-elite', () => active(() => scene.spawn('elite', 0, 300)));
        bind('debug-boss', () => active(() => scene.spawn('boss', 0, 380)));
        bind('debug-loot', () => active(() => scene.enemies.forEach(enemy => { enemy.hp = 0; enemy.dead = true; })));
        bind('debug-xp', () => active(() => scene.upgrades.gain(scene.upgrades.threshold)));
        bind('debug-portal', () => active(() => { scene.extraction.next = scene.elapsed; }));
        bind('debug-ship', () => active(() => { scene.score.value = Math.max(scene.score.value, 500000); }));
        bind('debug-star', () => active(() => { scene.score.value = scene.stellar.nextScore; }));
        bind('debug-reaper', () => active(() => scene.spawn('reaper', 0, 400)));
        bind('debug-leviathan', () => active(() => scene.spawn('leviathan', 0, 450)));
        bind('debug-choir', () => active(() => scene.spawn('choir', 0, 400)));
        bind('debug-materials', () => active(() => { for (const id of Object.keys(ITEMS))
            saves.collect(id, 1000); scene.hud.toast('TEST MATERIALS GRANTED', 'DEVELOPMENT ONLY'); }));
        bind('debug-level100', () => active(() => { scene.upgrades.level = 100; scene.upgrades.xp = 0; scene.upgrades.pending = 0; }));
        bind('debug-collapse', () => active(() => { scene.player.hp = 0; }));
    }
}
