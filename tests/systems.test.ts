import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../src/utils/SeededRandom';
import { MergeSystem } from '../src/systems/MergeSystem';
import { OrbitSystem } from '../src/systems/OrbitSystem';
import { MutationSystem } from '../src/systems/MutationSystem';
import { DailySeedSystem } from '../src/systems/DailySeedSystem';
import { DifficultySystem } from '../src/systems/DifficultySystem';
import { SpawnSystem } from '../src/systems/SpawnSystem';
import { ExtractionSystem } from '../src/systems/ExtractionSystem';
import { UpgradeSystem } from '../src/systems/UpgradeSystem';
import { LootSystem } from '../src/systems/LootSystem';
import { ScoreSystem } from '../src/systems/ScoreSystem';
import { ComboSystem } from '../src/systems/ComboSystem';
import { SaveManager, type StorageLike } from '../src/managers/SaveManager';
import { RECIPES, recipeKey } from '../src/config/mergeRecipes';
import { ITEMS } from '../src/config/itemConfig';
import { freshModifiers } from '../src/config/upgradeConfig';
import { Player } from '../src/entities/Player';
import { Pickup } from '../src/entities/Pickup';
const memory = (initial: string | null = null): StorageLike & {
    value: string | null;
} => ({
    value: initial, getItem() { return this.value; }, setItem(_k, v) { this.value = v; },
});
test('same seed produces the same random sequence', () => {
    const a = new SeededRandom('2026-10-03'), b = new SeededRandom('2026-10-03');
    assert.deepEqual(Array.from({ length: 1000 }, () => a.next()), Array.from({ length: 1000 }, () => b.next()));
});
test('daily uses UTC date, fixed modifiers, and versioned seed', () => {
    const a = DailySeedSystem.today(new Date('2026-10-03T01:00:00Z'));
    assert.deepEqual(a, DailySeedSystem.today(new Date('2026-10-03T23:59:59Z')));
    assert.notEqual(a.seed, DailySeedSystem.today(new Date('2026-10-04T00:00:00Z')).seed);
});
test('all recipes reference real items, are unique, and work in either order', () => {
    assert.equal(new Set(RECIPES.map(r => recipeKey(r.inputs))).size, RECIPES.length);
    for (const recipe of RECIPES) {
        assert.ok(ITEMS[recipe.output]);
        recipe.inputs.forEach(id => assert.ok(ITEMS[id]));
        for (const ids of [recipe.inputs, [...recipe.inputs].reverse()])
            assert.equal(MergeSystem.find(ids.map(type => ({ type })))?.recipe.id, recipe.id);
    }
    assert.equal(MergeSystem.find([{ type: 'rock' }]), undefined);
    assert.equal(MergeSystem.find([{ type: 'rock' }, { type: 'magnet' }]), undefined);
});
test('orbit merge consumes exactly two parts and installs its result', () => {
    const orbit = new OrbitSystem(new SeededRandom(2));
    orbit.add('rock');
    orbit.add('shield');
    orbit.add('rock');
    const event = orbit.update(1 / 60, { x: 0, y: 0 }, freshModifiers());
    assert.equal(event?.type, 'boulder');
    assert.equal(orbit.items.length, 2);
    assert.deepEqual(orbit.items.map(i => i.type).sort(), ['boulder', 'shield']);
});
test('orbit stays finite and capped under many updates', () => {
    const orbit = new OrbitSystem(new SeededRandom(22));
    for (let i = 0; i < 30; i++)
        orbit.add('storm');
    assert.equal(orbit.items.length, 16);
    const modifiers = freshModifiers();
    modifiers.radius = -10;
    modifiers.speed = 4;
    for (let i = 0; i < 1000; i++)
        orbit.update(1 / 60, { x: i, y: -i }, modifiers);
    assert.ok(orbit.items.every(i => Number.isFinite(i.x) && Number.isFinite(i.y) && Math.hypot(i.x - 999, i.y + 999) > 20));
});
test('both mutation routes are reachable and normal outcomes remain the majority', () => {
    const mutation = new MutationSystem(new SeededRandom('mutation-test'));
    let voids = 0, quantum = 0;
    for (let i = 0; i < 10000; i++) {
        if (mutation.roll('planet', 'planet').type === 'void')
            voids++;
        if (mutation.roll('cannon', 'cannon').type === 'quantum')
            quantum++;
    }
    assert.ok(voids > 80 && voids < 230);
    assert.ok(quantum > 80 && quantum < 230);
    assert.equal(mutation.roll('boulder', 'boulder').mutated, false);
});
test('diagonal movement is normalized and arena boundaries hold', () => {
    const a = new Player(), b = new Player();
    a.update(1, { x: 1, y: 0 });
    b.update(1, { x: 1, y: 1 });
    assert.ok(Math.abs(Math.hypot(b.x, b.y) - a.x) < .0001);
    a.update(100, { x: 1, y: 0 });
    assert.equal(a.x, 1700);
});
test('damage grants invulnerability and shields have a reduction floor', () => {
    const p = new Player();
    assert.equal(p.hit(20, 99), true);
    assert.equal(p.hp, 91);
    assert.equal(p.hit(100, 0), false);
    p.update(1, { x: 0, y: 0 });
    assert.equal(p.hit(100, 0), true);
    assert.equal(p.hp, 0);
});
test('first kill guarantees a Rock and boss death is a loot explosion', () => {
    const loot = new LootSystem(new SeededRandom(7));
    assert.ok(loot.drop(0, 0, 'crawler', 0, true).some(p => p.type === 'rock' && p.kind === 'part'));
    const boss = loot.drop(0, 0, 'boss', 0, false);
    assert.equal(boss.filter(p => p.kind === 'part').length, 8);
    assert.equal(boss.filter(p => p.kind === 'energy').length, 26);
    assert.equal(boss.filter(p => p.type === 'meteor').length, 2);
    assert.ok(boss.some(p => Math.hypot(p.vx, p.vy) > 200));
});
test('magnet accelerates a pickup into collection distance', () => {
    const p = new Pickup('part', 120, 0, 100, 0);
    let collected = false;
    for (let i = 0; i < 180 && !collected; i++)
        collected = p.update(1 / 60, { x: 0, y: 0 }, 165);
    assert.equal(collected, true);
});
test('upgrades queue levels and always offer three distinct choices', () => {
    const u = new UpgradeSystem(new SeededRandom(3));
    u.gain(100);
    assert.ok(u.pending > 1);
    assert.ok(u.xp < u.threshold);
    const choices = u.choices();
    assert.equal(choices.length, 3);
    assert.equal(new Set(choices.map(c => c.id)).size, 3);
});
test('difficulty increases continuously and staying doubles risk', () => {
    const d = new DifficultySystem();
    assert.ok(d.health(180) > d.health(0));
    assert.ok(d.spawnInterval(180) < d.spawnInterval(0));
    const health = d.health(180);
    d.stay();
    assert.equal(d.risk, 2);
    assert.ok(d.health(180) > health);
});
test('natural spawn schedule includes elites and a boss at 90 seconds', () => {
    const s = new SpawnSystem(new SeededRandom(4)), d = new DifficultySystem(), spawned: string[] = [];
    for (let i = 0; i <= 90 * 60; i++)
        s.update(1 / 60, i / 60, d, 1, type => spawned.push(type));
    assert.ok(spawned.includes('elite'));
    assert.ok(spawned.includes('boss'));
    assert.ok(spawned.includes('shooter'));
});
test('extraction opens at three minutes, expires, and returns', () => {
    const e = new ExtractionSystem();
    assert.equal(e.update(179, 0, 0), undefined);
    assert.equal(e.update(180, 0, 0), 'opened');
    assert.equal(e.open, true);
    assert.equal(e.update(205, 0, 0), 'missed');
    assert.equal(e.open, false);
    assert.equal(e.update(325, 0, 0), 'opened');
    e.close(326);
    assert.equal(e.next, 446);
});
test('combo caps at sixteen and expires after a gap', () => {
    const c = new ComboSystem();
    for (let i = 0; i < 100; i++)
        c.kill();
    assert.equal(c.multiplier, 16);
    c.update(3.1);
    assert.equal(c.multiplier, 1);
});
test('score tracks elites, bosses, mutations and applies risk', () => {
    const s = new ScoreSystem();
    s.kill(100, 'elite', 2);
    assert.equal(s.value, 200);
    s.kill(1000, 'boss', 2);
    s.merge(4, true, 2);
    assert.equal(s.elites, 1);
    assert.equal(s.bosses, 1);
    assert.equal(s.mutations, 1);
    assert.equal(s.highest, 4);
});
test('save handles absent, malformed, and invalid fields', () => {
    assert.equal(new SaveManager(memory()).data.bestScore, 0);
    assert.equal(new SaveManager(memory('{broken')).data.totalRuns, 0);
    const s = new SaveManager(memory(JSON.stringify({ saveVersion: 2, discoveries: ['rock', 'fake', 'rock'], settings: { master: 9, effects: -3 }, bestScore: 'evil', daily: { '2026-10-03': { score: 'x' } } })));
    assert.deepEqual(s.data.discoveries, ['rock']);
    assert.equal(s.data.settings.master, 1);
    assert.equal(s.data.settings.effects, 0);
    assert.equal(s.data.bestScore, 0);
    assert.equal(s.data.daily['2026-10-03']?.score, 0);
});
test('discoveries and run stats survive a new SaveManager', () => {
    const store = memory(), s = new SaveManager(store);
    assert.equal(s.discover('meteor'), true);
    assert.equal(s.discover('meteor'), false);
    s.finish({ score: 3500, time: 180, kills: 55, evolution: 3 }, true, '2026-10-03');
    const next = new SaveManager(store);
    assert.ok(next.data.discoveries.includes('meteor'));
    assert.ok(next.data.unlocked.includes('tide'));
    assert.equal(next.data.currency, 100);
    assert.equal(next.data.totalKills, 55);
    assert.equal(next.data.daily['2026-10-03']?.score, 3500);
    next.finish({ score: 1, time: 1, kills: 0, evolution: 1 }, false, '2026-10-03');
    assert.equal(next.data.daily['2026-10-03']?.score, 3500);
});
test('future saves are preserved and failed storage never crashes gameplay', () => {
    const store = memory('{"saveVersion":99,"data":"future"}'), s = new SaveManager(store);
    s.discover('rock');
    assert.equal(store.value, '{"saveVersion":99,"data":"future"}');
    const bad = new SaveManager({ getItem() { throw Error('blocked'); }, setItem() { throw Error('quota'); } });
    assert.doesNotThrow(() => bad.discover('rock'));
    assert.equal(bad.available, false);
});
