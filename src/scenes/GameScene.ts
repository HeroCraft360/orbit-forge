import Phaser from 'phaser';
import { isBossType } from '../config/bossConfig';
import { STARS } from '../config/starConfig';
import { ShipSystem } from '../systems/ShipSystem';
import { StellarSystem } from '../systems/StellarSystem';
import { BossSystem } from '../systems/BossSystem';
import { CompanionCombatSystem } from '../systems/CompanionCombatSystem';
import { StellarCombatSystem } from '../systems/StellarCombatSystem';
import { StellarPanel } from '../ui/StellarPanel';
import { root } from '../ui/UI';
import { GAME } from '../config/gameConfig';
import { ITEMS, BASE_DROPS } from '../config/itemConfig';
import type { EnemyType } from '../config/enemyConfig';
import { freshModifiers, type BuildModifiers, type UpgradeDefinition } from '../config/upgradeConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';
import { MovementController } from '../input/MovementController';
import { SeededRandom } from '../utils/SeededRandom';
import { OrbitSystem } from '../systems/OrbitSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { LootSystem } from '../systems/LootSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { ExtractionSystem } from '../systems/ExtractionSystem';
import { DailySeedSystem, type DailyChallenge } from '../systems/DailySeedSystem';
import { saves } from '../managers/SaveManager';
import { audio } from '../managers/AudioManager';
import { Effects } from '../rendering/Effects';
import { ArenaRenderer } from '../rendering/ArenaRenderer';
import { Hud } from '../ui/Hud';
import { DebugTools } from '../ui/DebugTools';
import { UpgradePanel } from '../ui/UpgradePanel';
import { ExtractionPanel } from '../ui/ExtractionPanel';
import { modal, bind, closeModal } from '../ui/UI';
export interface RunOptions {
    mode: 'normal' | 'daily';
    seed: string;
    core: 'spark' | 'tide';
    daily?: DailyChallenge;
}
export const newRun = (mode: 'normal' | 'daily' = 'normal', core: 'spark' | 'tide' = 'spark'): RunOptions => {
    const daily = mode === 'daily' ? DailySeedSystem.today() : undefined;
    return { mode, core: daily ? 'spark' : core, seed: daily?.seed ?? crypto.getRandomValues(new Uint32Array(1))[0]!.toString(36), daily };
};
export class GameScene extends Phaser.Scene {
    player!: Player;
    orbit!: OrbitSystem;
    difficulty!: DifficultySystem;
    score!: ScoreSystem;
    upgrades!: UpgradeSystem;
    extraction!: ExtractionSystem;
    modifiers!: BuildModifiers;
    effects!: Effects;
    hud!: Hud;
    run!: RunOptions;
    ship!: ShipSystem;
    stellar!: StellarSystem;
    bosses!: BossSystem;
    private companionCombat!: CompanionCombatSystem;
    private stellarCombat!: StellarCombatSystem;
    enemies: Enemy[] = [];
    pickups: Pickup[] = [];
    projectiles: Projectile[] = [];
    elapsed = 0;
    paused = false;
    ended = false;
    debugVisible = false;
    private random!: SeededRandom;
    private spawner!: SpawnSystem;
    private loot!: LootSystem;
    private movement!: MovementController;
    private arenaRenderer!: ArenaRenderer;
    private accumulator = 0;
    private enemyId = 0;
    private hudClock = 0;
    private freeze = 0;
    private discoveries: string[] = [];
    private seen = new Set<string>();
    constructor() { super('Game'); }
    create(options: RunOptions): void {
        this.run = options?.seed ? options : newRun();
        this.elapsed = 0;
        this.paused = false;
        this.ended = false;
        this.accumulator = 0;
        this.enemyId = 0;
        this.hudClock = 0;
        this.freeze = 0;
        this.enemies = [];
        this.pickups = [];
        this.projectiles = [];
        this.discoveries = [];
        this.seen = new Set();
        this.debugVisible = false;
        this.random = new SeededRandom(this.run.seed);
        saves.refresh();
        this.player = new Player();
        this.modifiers = freshModifiers();
        this.ship = new ShipSystem(this.run.mode === 'daily' ? {} : saves.data.shipUpgrades);
        this.stellar = new StellarSystem(new SeededRandom(this.run.seed + ':stars'));
        this.bosses = new BossSystem(this.random);
        this.companionCombat = new CompanionCombatSystem(this.random);
        this.stellarCombat = new StellarCombatSystem();
        this.orbit = new OrbitSystem(this.random);
        this.difficulty = new DifficultySystem();
        this.score = new ScoreSystem();
        this.upgrades = new UpgradeSystem(this.random);
        this.extraction = new ExtractionSystem();
        this.spawner = new SpawnSystem(this.random);
        this.loot = new LootSystem(this.random);
        this.movement = new MovementController(this);
        this.effects = new Effects(this);
        this.arenaRenderer = new ArenaRenderer(this);
        this.hud = new Hud(this);
        if (GAME.debug)
            new DebugTools(this);
        this.cameras.main.setBackgroundColor('#09121b');
        this.cameras.main.setScroll(-this.scale.width / 2, -this.scale.height / 2);
        if (this.run.core === 'tide') {
            this.addPart('magnet', false);
            this.modifiers.pulse = .8;
            this.modifiers.magnet = 1.35;
        }
        this.spawn('crawler', 0, 140);
        this.enemies[0]!.hp = 12;
        this.hud.toast('BUILD YOUR ORBIT', 'MOVE WITH WASD · COLLECT THE FALLEN');
        this.hud.update(0);
        const keys = this.input.keyboard!;
        keys.on('keydown-ESC', this.pauseGame, this);
        keys.on('keydown-E', this.offerExtraction, this);
        keys.on('keydown-T', this.openStellarTree, this);
        if (GAME.debug) {
            keys.on('keydown-F1', (event: KeyboardEvent) => { event.preventDefault(); this.debugVisible = !this.debugVisible; });
            keys.on('keydown-F2', (event: KeyboardEvent) => { event.preventDefault(); if (!this.paused)
                this.addPart(this.random.pick(BASE_DROPS)); });
            keys.on('keydown-F3', (event: KeyboardEvent) => { event.preventDefault(); if (!this.paused)
                this.spawn('elite', 0, 350); });
            keys.on('keydown-F4', (event: KeyboardEvent) => { event.preventDefault(); if (!this.paused)
                this.spawn('boss', 0, 400); });
            keys.on('keydown-F5', (event: KeyboardEvent) => { event.preventDefault(); if (!this.paused)
                this.upgrades.gain(this.upgrades.threshold); });
            keys.on('keydown-F6', (event: KeyboardEvent) => { event.preventDefault(); if (!this.paused)
                this.extraction.next = this.elapsed; });
        }
        const onHidden = (): void => { if (document.hidden && !this.ended)
            this.pauseGame(false); };
        document.addEventListener('visibilitychange', onHidden);
        this.events.once('shutdown', () => { keys.removeAllListeners(); document.removeEventListener('visibilitychange', onHidden); closeModal(); });
    }
    update(_time: number, delta: number): void {
        if (this.ended)
            return;
        if (!this.paused && this.ship.state === 'arriving') {
            if (this.ship.updateArrival(Math.min(delta / 1000, .1), this.player)) {
                document.getElementById('ship-cinematic')?.remove();
                this.hud.toast('ASTRAL SKIFF ONLINE', 'YOUR ORBIT HAS COMPANY');
                this.player.invulnerable = 1.5;
                this.accumulator = 0;
            }
        }
        else if (!this.paused) {
            if (this.freeze > 0)
                this.freeze = Math.max(0, this.freeze - delta / 1000);
            else {
                this.accumulator += Math.min(delta / 1000, .1);
                while (this.accumulator >= GAME.fixedStep && !this.paused && !this.ended && this.ship.state !== 'arriving') {
                    this.step(GAME.fixedStep);
                    this.accumulator -= GAME.fixedStep;
                }
            }
        }
        if (this.ended)
            return;
        const cam = this.cameras.main;
        cam.scrollX += (this.player.x - cam.width / 2 - cam.scrollX) * .12;
        cam.scrollY += (this.player.y - cam.height / 2 - cam.scrollY) * .12;
        this.arenaRenderer.draw();
        this.hudClock += delta / 1000;
        if (this.hudClock >= .1) {
            this.hud.update(this.paused ? 0 : this.hudClock);
            this.hudClock = 0;
        }
    }
    /** Simulation advances at 60 Hz; menus and hit emphasis never advance the run clock. */
    step(dt: number): void {
        this.elapsed += dt;
        this.player.update(dt, this.movement.read());
        if (this.player.hp <= 0) {
            this.finish(false);
            return;
        }
        if (this.ship.check(this.score.value, this.player, this.scale.width / 2)) {
            const cinematic = document.createElement('div');
            cinematic.id = 'ship-cinematic';
            cinematic.innerHTML = '<span>500,000 / DISTRESS SIGNAL ANSWERED</span><strong>YOU ARE NOT ALONE.</strong><small>ASTRAL SKIFF · ESCORT PROTOCOL ACTIVE</small>';
            root.appendChild(cinematic);
            audio.play('portal');
            return;
        }
        const form = this.stellar.check(this.score.value);
        if (form) {
            saves.star(form);
            this.effects.ring(this.player.x, this.player.y, STARS[form].color, 380, 1);
            this.effects.burst(this.player.x, this.player.y, STARS[form].color, 100, 400);
            this.effects.shake(3);
            audio.play('mutation');
            this.hud.toast(STARS[form].name.toUpperCase(), 'STELLAR ASCENSION · PRESS T FOR YOUR SKILL TREE');
            this.player.hp = this.player.maxHp;
            this.player.invulnerable = 2;
            this.freeze = .12;
        }
        this.score.update(dt, this.difficulty.risk);
        this.effects.update(dt);
        this.spawner.update(dt, this.elapsed, this.difficulty, this.run.daily?.bossRate ?? 1, (type, angle, distance) => this.spawn(type, angle, distance));
        const merge = this.orbit.update(dt, this.player, { ...this.modifiers, speed: this.modifiers.speed * (this.stellar.current === 'pulsar' ? 1.25 : 1) });
        if (merge) {
            saves.collect(merge.type);
            saves.recipe(merge.recipe);
            if (merge.mutated)
                saves.mutation(merge.type);
            this.discover(merge.type);
            this.score.merge(ITEMS[merge.type]!.level, merge.mutated, this.difficulty.risk);
            this.effects.burst(this.player.x, this.player.y, ITEMS[merge.type]!.color, 60, 260);
            this.effects.ring(this.player.x, this.player.y, ITEMS[merge.type]!.color, 170);
            this.effects.shake(1.7);
            audio.play(merge.mutated ? 'mutation' : 'merge');
            this.freeze = .065;
            this.hud.toast(ITEMS[merge.type]!.name.toUpperCase(), merge.mutated ? 'RARE MUTATION DISCOVERED' : 'FUSION COMPLETE');
        }
        this.corePulse();
        this.updateEnemies(dt);
        this.updateOrbitCombat();
        this.companionCombat.update(dt, this.ship, this.player, this.enemies, this.projectiles, this.modifiers.damage, this.hitEnemy.bind(this), this.effects);
        this.stellarCombat.update(dt, this.elapsed, this.stellar, this.player, this.enemies, this.projectiles, this.modifiers.damage, this.hitEnemy.bind(this), this.effects);
        this.bosses.update(dt, this.enemies, this.player, this.projectiles, (type, a, d) => this.spawn(type, a, d), damage => this.hitPlayer(damage), (x, y, r) => { this.effects.ring(x, y, 0xb199ff, r, .35); this.effects.burst(x, y, 0xb199ff, 24, r); });
        this.updateProjectiles(dt);
        this.resolveDeaths();
        this.updatePickups(dt);
        const portalEvent = this.extraction.update(this.elapsed, this.player.x, this.player.y);
        if (portalEvent === 'opened') {
            audio.play('portal');
            this.hud.toast('THE WAY HOME IS OPEN', 'PRESS E TO EXTRACT OR ESCALATE');
        }
        if (portalEvent === 'missed')
            this.hud.toast('PORTAL CLOSED', 'ANOTHER WINDOW OPENS IN TWO MINUTES');
        if (this.extraction.open && Math.hypot(this.player.x - this.extraction.x, this.player.y - this.extraction.y) < 48)
            this.offerExtraction();
        if (this.player.hp <= 0) {
            this.finish(false);
            return;
        }
        if (this.upgrades.pending && !this.paused)
            this.offerUpgrade();
    }
    spawn(type: EnemyType, angle = 0, distance = 500): void {
        if (this.enemies.length >= GAME.maxEnemies)
            return;
        const e = new Enemy(++this.enemyId, type, this.player.x + Math.cos(angle) * distance, this.player.y + Math.sin(angle) * distance, this.difficulty.health(this.elapsed), this.difficulty.speed(this.elapsed));
        this.enemies.push(e);
        if (isBossType(type)) {
            audio.play('boss');
            this.effects.shake(3);
            this.hud.toast(e.def.name, 'MASSIVE GRAVITY SIGNATURE DETECTED', '#ffad90');
        }
        if (type === 'elite')
            this.hud.toast('RIFT WARDEN INBOUND', 'HIGH-VALUE SALVAGE DETECTED', '#ffd198');
    }
    addPart(type: string, countMaterial = true): void {
        if (countMaterial)
            saves.collect(type);
        this.discover(type);
        this.score.highest = Math.max(this.score.highest, ITEMS[type]!.level);
        if (!this.orbit.add(type)) {
            this.upgrades.gain(8);
            this.hud.toast('ORBIT AT CAPACITY', 'SALVAGE CONVERTED TO ENERGY');
            return;
        }
        this.effects.ring(this.player.x, this.player.y, ITEMS[type]!.color, 90, .3);
    }
    private discover(type: string): void {
        if (!this.seen.has(type)) {
            this.seen.add(type);
            this.score.value += 250 * this.difficulty.risk;
        }
        if (saves.discover(type)) {
            this.discoveries.push(type);
            this.hud.toast(ITEMS[type]!.name.toUpperCase(), 'NEW DISCOVERY');
        }
    }
    private corePulse(): void {
        if (this.player.pulseCooldown > 0)
            return;
        let nearest: Enemy | undefined, distance = 320;
        for (const e of this.enemies) {
            const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
            if (d < distance && !e.dead) {
                nearest = e;
                distance = d;
            }
        }
        if (!nearest)
            return;
        const a = Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x);
        this.projectiles.push(new Projectile(this.player.x, this.player.y, Math.cos(a) * 520, Math.sin(a) * 520, 15 * this.modifiers.pulse, true, 0x9effdf, 4));
        this.player.pulseCooldown = .7;
    }
    private updateEnemies(dt: number): void {
        const gravity = (this.modifiers.gravity + this.orbit.count('gravity') * .2 + (this.stellar.current === 'blackhole' ? 1.4 : 0) + (this.ship.state === 'active' ? this.ship.stats.gravityStrength : 0)) * (this.run.daily?.gravity ?? 1);
        for (const e of this.enemies) {
            e.update(dt, this.player, gravity);
            if (e.burn > 0) {
                e.burn -= dt;
                e.hp -= dt * 12 * this.modifiers.damage;
            }
            if (e.hp <= 0)
                e.dead = true;
            if (e.dead)
                continue;
            if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < e.def.size + this.player.radius)
                this.hitPlayer(e.def.damage);
            if (e.cooldown <= 0 && e.type === 'shooter' && this.projectiles.length < 220) {
                const count = 1;
                const aim = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                for (let i = 0; i < count; i++) {
                    const a = aim + i / count * Math.PI * 2;
                    this.projectiles.push(new Projectile(e.x, e.y, Math.cos(a) * 160, Math.sin(a) * 160, e.def.damage * .65, false, 0xffa78c, 6));
                }
                e.cooldown = 3;
                this.effects.ring(e.x, e.y, e.def.color, e.def.size * 1.8, .3);
            }
            // Recycle distant ordinary foes around the active arena; boss and elite encounters persist.
            if (Math.hypot(e.x - this.player.x, e.y - this.player.y) > 1200 && !isBossType(e.type) && e.type !== 'elite') {
                const a = this.random.between(0, Math.PI * 2);
                e.x = this.player.x + Math.cos(a) * 600;
                e.y = this.player.y + Math.sin(a) * 600;
            }
        }
    }
    private updateOrbitCombat(): void {
        for (const item of this.orbit.items) {
            if (item.age < .02)
                continue;
            const fire = item.def.specialEffect === 'burn' ? (this.run.daily?.fire ?? 1) * (this.stellar.current === 'sun' ? 1.4 : 1) : 1;
            const damage = item.def.damage * this.modifiers.damage * fire * (this.stellar.current === 'supernova' ? 1.25 : 1);
            for (const e of this.enemies) {
                if (e.dead || item.hits.has(e.id))
                    continue;
                if (Math.hypot(e.x - item.x, e.y - item.y) < e.def.size + item.def.size) {
                    this.hitEnemy(e, damage, item.def.knockback * this.modifiers.knockback, item.x, item.y);
                    item.hits.set(e.id, item.def.shape === 'blade' ? .18 : .35);
                    if (item.def.specialEffect === 'burn')
                        e.burn = 2;
                    if (item.def.specialEffect === 'lightning') {
                        const other = this.enemies.find(o => o !== e && !o.dead && Math.hypot(o.x - e.x, o.y - e.y) < 120);
                        if (other) {
                            this.hitEnemy(other, damage * .5, 20, e.x, e.y);
                            this.effects.ring(e.x, e.y, item.def.color, 110, .15);
                        }
                    }
                }
            }
            if (item.cooldown <= 0) {
                if (item.def.specialEffect === 'cannon' && this.projectiles.length < 220)
                    this.projectiles.push(new Projectile(item.x, item.y, Math.cos(item.angle) * 450, Math.sin(item.angle) * 450, damage, true, item.def.color));
                if (item.def.specialEffect === 'bomb') {
                    for (const e of this.enemies)
                        if (!e.dead && Math.hypot(e.x - item.x, e.y - item.y) < 130)
                            this.hitEnemy(e, damage, 150, item.x, item.y);
                    this.effects.ring(item.x, item.y, item.def.color, 130);
                    this.effects.burst(item.x, item.y, item.def.color, 15, 160);
                }
                item.cooldown = item.def.specialEffect === 'bomb' ? 3 : 1.1;
            }
        }
    }
    private updateProjectiles(dt: number): void {
        for (const b of this.projectiles) {
            if (b.life <= 0)
                continue;
            b.update(dt);
            if (b.life <= 0)
                continue;
            if (b.friendly) {
                const target = this.enemies.find(e => !e.dead && !b.hits.has(e.id) && Math.hypot(e.x - b.x, e.y - b.y) < e.def.size + b.radius);
                if (target) {
                    this.hitEnemy(target, b.damage, b.knockback, b.x - b.vx, b.y - b.vy);
                    b.hits.add(target.id);
                    if (b.explosion) {
                        for (const other of this.enemies)
                            if (other !== target && !other.dead && Math.hypot(other.x - b.x, other.y - b.y) < b.explosion + other.def.size)
                                this.hitEnemy(other, b.damage * .7, b.knockback, b.x, b.y);
                        this.effects.ring(b.x, b.y, b.color, b.explosion, .35);
                        this.effects.burst(b.x, b.y, b.color, 20, b.explosion);
                    }
                    if (b.chain) {
                        const other = this.enemies.find(e => e !== target && !e.dead && Math.hypot(e.x - target.x, e.y - target.y) < 180);
                        if (other) {
                            this.hitEnemy(other, b.damage * b.chain, 20, target.x, target.y);
                            this.effects.ring(target.x, target.y, 0xaddfff, 180, .2);
                        }
                    }
                    if (!b.piercing)
                        b.life = 0;
                }
            }
            else {
                const shield = this.orbit.items.find(i => i.def.specialEffect === 'shield' && Math.hypot(i.x - b.x, i.y - b.y) < i.def.size + b.radius);
                if (shield) {
                    b.life = 0;
                    this.effects.burst(b.x, b.y, shield.def.color, 7);
                }
                else if (Math.hypot(this.player.x - b.x, this.player.y - b.y) < this.player.radius + b.radius) {
                    this.hitPlayer(b.damage);
                    b.life = 0;
                }
            }
        }
        this.projectiles = this.projectiles.filter(b => b.life > 0);
    }
    private hitEnemy(e: Enemy, damage: number, knockback: number, x: number, y: number): void {
        if (e.dead)
            return;
        e.hp -= damage;
        e.flash = .08;
        const a = Math.atan2(e.y - y, e.x - x);
        e.vx += Math.cos(a) * knockback * e.def.resistance;
        e.vy += Math.sin(a) * knockback * e.def.resistance;
        this.effects.burst(e.x, e.y, e.def.color, 4, 65);
        this.effects.damage(e.x, e.y, damage);
        audio.play('hit');
        if (e.hp <= 0)
            e.dead = true;
    }
    private hitPlayer(damage: number): void {
        const protection = Math.max(.35, 1 - this.stellar.value('shield') - (this.ship.state === 'active' ? this.ship.stats.armor : 0));
        if (this.player.hit(damage * protection, this.orbit.count('shield'))) {
            this.effects.shake(2);
            this.effects.burst(this.player.x, this.player.y, 0xffa5a0, 14);
            audio.play('hit');
        }
    }
    private resolveDeaths(): void {
        for (const e of this.enemies)
            if (e.dead) {
                const first = this.score.kills === 0;
                const previous = this.score.combo.multiplier;
                this.score.kill(e.def.score, e.type, this.difficulty.risk);
                const loot = this.loot.drop(e.x, e.y, e.type, this.modifiers.luck + this.difficulty.stays * .7, first);
                this.pickups.push(...loot);
                this.effects.burst(e.x, e.y, e.def.color, isBossType(e.type) ? 100 : e.type === 'elite' ? 40 : 12, isBossType(e.type) ? 450 : 130);
                audio.play(isBossType(e.type) ? 'merge' : 'death');
                if (previous < this.score.combo.multiplier)
                    audio.play('combo');
                if (isBossType(e.type)) {
                    this.effects.ring(e.x, e.y, e.def.color, 340, .8);
                    this.effects.shake(4);
                    this.hud.toast('A STAR FALLS. YOUR ORBIT RISES.', e.def.name + ' DEFEATED', '#ffc68f');
                }
            }
        this.enemies = this.enemies.filter(e => !e.dead);
        if (this.pickups.length > GAME.maxPickups) {
            // Keep all valuable parts; compress excess energy into one pickup instead of losing rewards.
            const energy = this.pickups.filter(p => p.kind === 'energy');
            const valuable = this.pickups.filter(p => p.kind !== 'energy');
            const keep = Math.max(0, GAME.maxPickups - valuable.length - 1);
            const overflow = energy.splice(keep);
            if (overflow.length)
                valuable.push(new Pickup('energy', overflow[0]!.x, overflow[0]!.y, 0, 0, overflow.reduce((sum, p) => sum + p.value, 0)));
            this.pickups = [...valuable.slice(-GAME.maxPickups), ...energy].slice(0, GAME.maxPickups);
        }
    }
    private updatePickups(dt: number): void {
        const range = (165 + this.orbit.count('magnet') * 80) * this.modifiers.magnet * (this.run.daily?.magnet ?? 1) * (this.ship.state === 'active' ? this.ship.stats.pickupRange : 1);
        this.pickups = this.pickups.filter(p => {
            if (p.update(dt, this.player, range)) {
                if (p.kind === 'part')
                    this.addPart(p.type);
                else if (p.kind === 'heal')
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + p.value);
                else
                    this.upgrades.gain(p.value);
                audio.play('pickup');
                this.effects.burst(p.x, p.y, p.kind === 'part' ? ITEMS[p.type]!.color : 0x8beed0, 4, 45);
                return false;
            }
            return p.age < 100 || p.kind === 'part';
        });
    }
    private offerUpgrade(): void {
        this.paused = true;
        audio.play('level');
        UpgradePanel.show(this.upgrades.level, this.upgrades.choices(), upgrade => {
            this.applyUpgrade(upgrade);
            this.stellar.levelUp();
            this.upgrades.pending--;
            this.paused = false;
            this.accumulator = 0;
            if (this.upgrades.pending)
                this.offerUpgrade();
        });
    }
    private applyUpgrade(upgrade: UpgradeDefinition): void {
        for (const [key, value] of Object.entries(upgrade.effect))
            this.modifiers[key as keyof BuildModifiers] += value!;
        this.player.maxHp += upgrade.maxHealth ?? 0;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + (upgrade.heal ?? 8));
        if (upgrade.item) {
            this.addPart(upgrade.item);
            if (upgrade.id === 'arsenal')
                this.addPart(upgrade.item);
        }
        audio.play('upgrade');
        this.effects.ring(this.player.x, this.player.y, 0x88f4d2, 160);
    }
    openStellarTree(): void {
        if (!this.stellar.current || this.paused || this.ended || this.ship.state === 'arriving')
            return;
        this.paused = true;
        StellarPanel.show(this.stellar, () => { this.paused = false; this.accumulator = 0; });
    }
    offerExtraction(): void {
        if (!this.extraction.open || this.paused || this.ended || this.ship.state === 'arriving')
            return;
        this.paused = true;
        ExtractionPanel.show(this.score.value, this.difficulty.risk, extract => {
            if (extract)
                this.finish(true);
            else {
                this.difficulty.stay();
                this.extraction.close(this.elapsed);
                this.paused = false;
                this.accumulator = 0;
                this.hud.toast('DEEPER INTO THE FORGE', 'RISK ×' + this.difficulty.risk + ' · SALVAGE BOOSTED', '#ffc489');
            }
        });
    }
    pauseGame(toggle = true): void {
        if (this.ended)
            return;
        if (this.paused) {
            if (toggle && document.getElementById('resume')) {
                closeModal();
                this.paused = false;
                this.accumulator = 0;
            }
            return;
        }
        this.paused = true;
        modal('<section class="dialog"><span class="eyebrow">SIGNAL HELD</span><h2>Catch your <em>breath.</em></h2><p>WASD or arrows to move. Your weapons fire automatically.<br>Collect parts to grow your orbit; matching parts fuse automatically.</p><button class="primary" id="resume">RESUME RUN ↗</button><button class="text-button" id="end-run">End run & bank partial salvage</button></section>');
        bind('resume', () => { closeModal(); this.paused = false; this.accumulator = 0; });
        bind('end-run', () => this.finish(false));
    }
    finish(extracted: boolean): void {
        if (this.ended)
            return;
        this.ended = true;
        closeModal();
        audio.play(extracted ? 'extract' : 'collapse');
        const record = { score: Math.floor(this.score.value), time: this.elapsed, kills: this.score.kills, evolution: this.score.highest };
        const earned = saves.finish(record, extracted, this.run.daily?.date);
        this.scene.start('GameOver', { record, earned, extracted, discoveries: this.discoveries, merges: this.score.merges, bosses: this.score.bosses, risk: this.difficulty.risk, run: this.run });
    }
}
