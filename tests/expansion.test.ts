import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager, type StorageLike } from '../src/managers/SaveManager';
import { SHIP_UPGRADES, shipUpgradeCost, shipStats } from '../src/config/shipConfig';
import { STARS, STELLAR_SKILLS } from '../src/config/starConfig';
import { ShipSystem } from '../src/systems/ShipSystem';
import { StellarSystem } from '../src/systems/StellarSystem';
import { UpgradeSystem } from '../src/systems/UpgradeSystem';
import { BossSystem } from '../src/systems/BossSystem';
import { CompanionCombatSystem } from '../src/systems/CompanionCombatSystem';
import { StellarCombatSystem } from '../src/systems/StellarCombatSystem';
import { SeededRandom } from '../src/utils/SeededRandom';
import { Player } from '../src/entities/Player';
import { Enemy } from '../src/entities/Enemy';
import { Projectile } from '../src/entities/Projectile';
import { BOSS_TYPES, isBossType } from '../src/config/bossConfig';
import { ENEMIES } from '../src/config/enemyConfig';
import { ITEMS } from '../src/config/itemConfig';
import type { Effects } from '../src/rendering/Effects';
const memory = (raw: string | null = null): StorageLike & {
    value: string | null;
} => ({ value: raw, getItem() { return this.value; }, setItem(_key, value) { this.value = value; } });
const effects = { ring() { }, burst() { }, shake() { } } as unknown as Effects;
test('v1 migration preserves progress without inventing material quantities', () => {
    const save = new SaveManager(memory(JSON.stringify({ saveVersion: 1, discoveries: ['rock', 'storm'], bestScore: 13397865, totalRuns: 6, totalKills: 900, settings: { master: .2 }, daily: { '2026-10-03': { score: 5000, time: 180, kills: 20, evolution: 2 } } })));
    assert.equal(save.data.saveVersion, 2);
    assert.equal(save.data.bestScore, 13397865);
    assert.equal(save.data.totalRuns, 6);
    assert.deepEqual(save.data.discoveries, ['rock', 'storm']);
    assert.deepEqual(save.data.parts, {});
    assert.equal(save.data.settings.master, .2);
    assert.equal(save.data.legacyDaily['2026-10-03']?.score, 5000);
    assert.deepEqual(save.data.daily, {});
});
test('each part has an independent available balance and lifetime tally', () => {
    const store = memory(), s = new SaveManager(store);
    s.collect('rock', 150);
    s.collect('blade', 70);
    s.collect('meteor', 4);
    assert.equal(s.purchase('fireRate'), 'purchased');
    assert.equal(s.data.parts.rock, 30);
    assert.equal(s.data.parts.blade, 10);
    assert.equal(s.data.collected.rock, 150);
    assert.equal(s.data.collected.blade, 70);
    assert.equal(s.data.parts.meteor, 4);
    const next = new SaveManager(store);
    assert.equal(next.data.shipUpgrades.fireRate, 1);
    assert.equal(next.data.parts.rock, 30);
});
test('all twenty modules have valid costs, functional stats, and acyclic prerequisites', () => {
    assert.equal(SHIP_UPGRADES.length, 20);
    assert.equal(new Set(SHIP_UPGRADES.map(u => u.id)).size, 20);
    const base = shipStats();
    for (const u of SHIP_UPGRADES) {
        for (const [id, cost] of Object.entries(u.cost)) {
            assert.ok(ITEMS[id]);
            assert.ok(Number.isSafeInteger(cost) && cost > 0);
        }
        assert.ok(shipStats({ [u.id]: 1 })[u.id] > base[u.id]);
        if (u.requires)
            assert.ok(SHIP_UPGRADES.findIndex(v => v.id === u.requires) < SHIP_UPGRADES.indexOf(u));
        assert.ok(Object.values(shipUpgradeCost(u, 1)).reduce((a, b) => a + b) > Object.values(u.cost).reduce((a, b) => a + b));
    }
});
test('prerequisites, affordability, repeated purchases and max ranks are enforced', () => {
    const s = new SaveManager(memory());
    assert.equal(s.purchase('fireRate'), 'insufficient');
    assert.equal(s.purchase('boltDamage'), 'locked');
    for (const id of Object.keys(ITEMS))
        s.collect(id, 100000);
    assert.equal(s.purchase('missing'), 'unknown');
    for (let i = 0; i < 3; i++)
        assert.equal(s.purchase('fireRate'), 'purchased');
    const balance = s.data.parts.rock;
    assert.equal(s.purchase('fireRate'), 'maxed');
    assert.equal(s.data.parts.rock, balance);
    assert.equal(s.purchase('boltDamage'), 'purchased');
});
test('failed persistent purchase rolls back balances and unlock together', () => {
    const store = memory(), s = new SaveManager(store);
    s.collect('rock', 120);
    s.collect('blade', 60);
    store.setItem = () => { throw Error('quota'); };
    assert.equal(s.purchase('fireRate'), 'storage-unavailable');
    assert.equal(s.data.parts.rock, 120);
    assert.equal(s.data.shipUpgrades.fireRate ?? 0, 0);
});
test('a second open save manager cannot overwrite an already completed purchase', () => {
    const store = memory(), a = new SaveManager(store);
    a.collect('rock', 120);
    a.collect('blade', 60);
    const b = new SaveManager(store);
    assert.equal(a.purchase('fireRate'), 'purchased');
    assert.equal(b.purchase('fireRate'), 'insufficient');
    assert.equal(b.data.parts.rock, 0);
    assert.equal(b.data.shipUpgrades.fireRate, 1);
});
test('invalid negative counts, unknown part keys and excessive ranks are sanitized', () => {
    const s = new SaveManager(memory(JSON.stringify({ saveVersion: 2, parts: { rock: -4, fake: 100 }, collected: { rock: -20 }, shipUpgrades: { fireRate: 999 } })));
    assert.equal(s.data.parts.rock, 0);
    assert.equal(s.data.parts.fake, undefined);
    assert.equal(s.data.shipUpgrades.fireRate, 3);
    s.collect('rock', -2);
    s.collect('rock', Infinity);
    assert.equal(s.data.parts.rock, 0);
});
test('ship arrives once from the right at precisely 500k and orbits clockwise', () => {
    const s = new ShipSystem({ orbitSpeed: 1 }), p = { x: 100, y: 200 };
    assert.equal(s.check(499999, p, 640), false);
    assert.equal(s.check(500000, p, 640), true);
    assert.ok(s.x > p.x + 640);
    for (let i = 0; i < 180; i++)
        s.updateArrival(1 / 60, p);
    assert.equal(s.state, 'active');
    assert.equal(s.check(999999, p, 640), false);
    const a = s.angle;
    s.update(1, p);
    assert.ok(s.angle > a);
    assert.ok(Math.abs(Math.hypot((s.x - p.x) / 350, (s.y - p.y) / (350 * .86)) - 1) < .00001);
    assert.equal(new ShipSystem({}).state, 'dormant');
});
test('ship combat fires upgraded blasts, missiles and an aimed charged laser', () => {
    const ship = new ShipSystem({ boltCount: 2, laserRecharge: 2, missileRate: 1, chainDamage: 1 });
    ship.state = 'active';
    ship.laserCooldown = 0;
    ship.missileCooldown = 0;
    const p = new Player(), enemy = new Enemy(1, 'tank', 500, 0, 1, 1), bullets: Projectile[] = [];
    let laserDamage = 0;
    new CompanionCombatSystem(new SeededRandom(1)).update(1 / 60, ship, p, [enemy], bullets, 1, (_e, d) => { laserDamage += d; }, effects);
    assert.equal(bullets.filter(b => b.explosion === 0).length, 3);
    assert.ok(bullets.some(b => b.explosion > 0));
    assert.ok(bullets.some(b => b.chain > 0));
    assert.ok(ship.laserTime > 0);
    assert.ok(laserDamage > 0);
});
test('stellar changes are score gated, skip threshold backlog, and choose a different form', () => {
    const s = new StellarSystem(new SeededRandom('stars'));
    assert.equal(s.check(4999999), undefined);
    const first = s.check(5000000);
    assert.ok(first);
    assert.equal(s.points, 2);
    assert.equal(s.nextScore, 15000000);
    assert.equal(s.check(14999999), undefined);
    const second = s.check(15000000);
    assert.ok(second && second !== first);
    assert.equal(s.nextScore, 25000000);
    s.check(55000000);
    assert.equal(s.nextScore, 65000000);
    assert.equal(s.check(55000000), undefined);
});
test('each stellar form has two complete prerequisite skill paths', () => {
    for (const id of Object.keys(STARS)) {
        const nodes = STELLAR_SKILLS.filter(s => s.star === id);
        assert.equal(nodes.length, 6);
        assert.equal(new Set(nodes.map(n => n.branch)).size, 2);
        for (const n of nodes)
            if (n.requires)
                assert.ok(nodes.some(p => p.id === n.requires));
    }
});
test('stellar points are spent once and earned only while ascended', () => {
    const s = new StellarSystem(new SeededRandom(7));
    for (let i = 0; i < 9; i++)
        s.levelUp();
    assert.equal(s.points, 0);
    s.check(5000000);
    const nodes = STELLAR_SKILLS.filter(n => n.star === s.current);
    assert.equal(s.unlock(nodes[1]!.id), false);
    assert.equal(s.unlock(nodes[0]!.id), true);
    assert.equal(s.unlock(nodes[0]!.id), false);
    assert.equal(s.unlock(nodes[1]!.id), true);
    assert.equal(s.points, 0);
    for (let i = 0; i < 3; i++)
        s.levelUp();
    assert.equal(s.points, 1);
});
test('every stellar form performs its actual attack; black hole absorbs hostile fire', () => {
    for (const id of Object.keys(STARS) as (keyof typeof STARS)[]) {
        const star = new StellarSystem(new SeededRandom(3));
        star.current = id;
        star.cooldown = 0;
        const player = new Player(), enemy = new Enemy(1, 'tank', 60, 0, 1, 1), bullets = [new Projectile(40, 0, 0, 0, 10, false, 0xff0000)];
        let dealt = 0;
        new StellarCombatSystem().update(1 / 60, 0, star, player, [enemy], bullets, 1, (_enemy, d) => { dealt += d; }, effects);
        if (id === 'pulsar')
            assert.equal(bullets.filter(b => b.source === 'star' && b.piercing).length, 2);
        else
            assert.ok(dealt > 0);
        if (id === 'blackhole')
            assert.equal(bullets[0]!.life, 0);
    }
});
test('XP pacing below 100 is unchanged; late levels get progressively more expensive', () => {
    const u = new UpgradeSystem(new SeededRandom(1));
    u.level = 99;
    assert.equal(u.threshold, 703);
    u.level = 100;
    assert.equal(u.threshold, 710);
    u.level = 125;
    const a = u.threshold;
    assert.ok(a > 3 * (10 + 125 * 7));
    u.level = 150;
    assert.ok(u.threshold > a * 2);
    u.level = 200;
    assert.ok(u.threshold > 25000);
    u.gain(1000);
    assert.equal(u.pending, 0);
});
test('all bosses are larger, heavy hitting encounters', () => {
    assert.equal(BOSS_TYPES.length, 4);
    for (const type of BOSS_TYPES) {
        assert.ok(isBossType(type));
        assert.ok(ENEMIES[type].size >= 88);
        assert.ok(ENEMIES[type].damage >= 38);
    }
    assert.equal(isBossType('tank'), false);
});
test('Reaper locks then dashes; Leviathan telegraphs delayed mines; Choir summons', () => {
    const player = new Player(), reaper = new Enemy(1, 'reaper', 300, 0, 1, 1), leviathan = new Enemy(2, 'leviathan', 400, 0, 1, 1), choir = new Enemy(3, 'choir', 500, 0, 1, 1);
    const bosses = new BossSystem(new SeededRandom(4)), bullets: Projectile[] = [], summons: string[] = [];
    let blasts = 0;
    reaper.age = 4.5;
    leviathan.cooldown = 0;
    choir.cooldown = 0;
    bosses.update(1 / 60, [reaper, leviathan, choir], player, bullets, type => summons.push(type), () => { }, () => { blasts++; });
    assert.equal(bosses.hazards.length, 5);
    assert.equal(blasts, 0);
    assert.ok(bullets.length > 0);
    reaper.age = 5.7;
    const x = reaper.x;
    bosses.update(.2, [reaper, leviathan, choir], player, bullets, type => summons.push(type), () => { }, () => { blasts++; });
    assert.ok(reaper.x < x - 100);
    for (let i = 0; i < 9 * 60; i++)
        bosses.update(1 / 60, [reaper, leviathan, choir], player, bullets, type => summons.push(type), () => { }, () => { blasts++; });
    assert.equal(blasts, 5);
    assert.equal(summons.length, 5);
    assert.equal(bosses.hazards.length, 0);
});
