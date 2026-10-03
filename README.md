# Orbit Forge

A playable, original browser survival roguelite built with **Phaser 3, strict TypeScript, Vite, and npm**. No accounts, backend, external art, or remote font services are required.

## Play

Open the running development preview at **http://127.0.0.1:5175**.

The release ZIP includes a production build. For a source checkout, run `npm ci` and `npm run build` first.

For the production build on Windows, double-click **Play-Orbit-Forge.cmd**, then open **http://127.0.0.1:4173**. The launcher uses Node on PATH or the existing Codex bundled Node runtime. It serves only this project's `dist` directory on localhost.

For development, install Node.js 22+ and npm, open a terminal in this folder, and run:

```sh
npm ci
npm run dev -- --port 5175
```

```sh
npm test          # deterministic systems, progression, migration and economy checks
npm run build    # strict TypeScript check + production bundle
npm run preview  # serve the production bundle
```

## Controls

- **WASD / arrow keys:** move; core and orbital weapons attack automatically.
- **Esc:** pause and resume.
- **E:** choose extraction or escalation while a portal is open.
- **T:** open the current stellar skill tree after ascension.
- Mouse / keyboard focus: choose upgrades and use menus.

Your first enemy is deliberately weak and guarantees a Rock. It is pulled in, enters your orbit, and becomes a contact weapon. Parts fuse automatically when a recipe matches.

## What's playable

- 14 orbital forms, 8 commutative fusion recipes, 2 rare mutation routes.
- 10 run upgrades, three choices at a time.
- Crawler, Runner, Tank, Swarm, Shooter, Elite, and four bosses.
- Physical circular/elliptical orbits, contact damage, shields, burn, gravity, chain attacks, cannons, and nova explosions.
- Energy drops, salvage bursts, healing, combo scoring, escalating enemy pressure.
- First boss at 90 seconds; further boss encounters accelerate as risk rises.
- First portal at 3 minutes. Extract to bank more stardust and unlock the Tide starting core, or stay to double the risk multiplier. A portal returns 2 minutes after the previous one closes.
- Instant restart, persistent discoveries, settings, local bests, daily seeded runs.
- Procedural shapes, trails, hit flashes, damage numbers, bounded particles, synthesized sound.

## Version 0.2 expansion

### Astral Skiff

At **500,000 score in each run**, an escort enters from the right during a 2.8-second cutscene. Combat and the run clock pause during the arrival. The ship then follows the large inner circumference clockwise, centered on your moving core (350 world-unit radius), as indicated in the supplied reference.

The ship automatically fires aimed blasts, charged lasers, and explosive missiles. It is separate from the 16 debris slots and cannot consume a merge ingredient.

### Stellar ascension

First ascension occurs at **5 million run score**. Further changes occur at **15M, 25M, 35M, ...**, interpreted as an additional 10 million score between transformations. Crossing several milestones at once produces one transformation rather than a backlog of cutscenes.

Four forms have different original visuals and abilities:

| Form | Identity | Main behavior |
|---|---|---|
| Solar Sovereign | Sun-like star | Burning solar flares, fire amplification, passive warmth |
| Polar Sentinel | Neutron star / pulsar | Opposing piercing jets, faster debris rotation |
| Quiet Oblivion | Stellar black hole | Gravity, crushing pulses, hostile projectile absorption |
| Afterlight | Supernova remnant | Huge shockwaves, knockback, greater impact damage |

Each form has **six skills across two prerequisite paths**. First encountering a form grants two stellar points. Every three levels gained while ascended grants another point. Skills persist for the current run; returning to a form restores its purchased skills. Ship modules are permanent; stellar skills are run progression.

### Techno-fusion

The left-side menu tab opens a dedicated ship engineering screen. There are **20 modules, three ranks each**, grouped into Ballistics, Photonics, Navigation, and Payload. Every rank affects a live gameplay system. Each path requires the previous module, and later ranks cost more.

Materials are earned immediately from collected parts, upgrade-granted parts, and newly fused outputs, across successful and failed runs. Starting-core equipment does not grant free materials. A full orbit still credits collected materials before converting excess salvage to XP.

Archive cards show both:

- **Available:** spendable parts. Purchases deduct this balance.
- **Collected all time:** the lifetime tally, which never decreases.

Purchases are made only in Techno-fusion. The save transaction checks requirements and funds, then stores the balance deduction and unlock together. If writing the save fails, both changes are rolled back. Daily runs use an unmodified standard ship so permanent purchases do not change the daily starting conditions.

### Bosses and leveling

The Hollow Sun is larger and stronger. Three new encounters join the rotation:

- **The Glass Reaper:** enormous triangular blades, a directional warning, then a locked high-speed lunge.
- **Gravity Leviathan:** a heavily armored giant, drifting movement, radial barrages and delayed gravity mine zones.
- **The Null Choir:** circling movement, rotating salvos and summoned swarms.

The original early XP curve is preserved through level 100. After 100, a continuous quadratic multiplier increases the energy needed for each level. Threshold examples: level 100 requires 710 XP; level 125 requires 3,344; level 150 8,422; level 200 28,827.

## Saves

All storage lives in `SaveManager` under `orbit-forge:save`. Save version 2 preserves version 1 discoveries, scores, settings, unlocks, and cumulative run statistics. Version 1 did not record part quantities; migration starts new material counters at zero rather than inventing a balance. Previous daily records remain in `legacyDaily` because the expanded rules use a new daily seed version.

Unknown future saves are protected from overwrite. Corrupt, missing, or blocked storage falls back safely to an in-memory session. Ship purchases are disabled when persistent storage is unavailable. Saves are local to a browser profile and origin: `localhost` and `127.0.0.1` have separate saves.

Daily seeds use the **UTC date**, a versioned seed, fixed simulation steps, and gameplay-only random streams. Rendering and particles use separate randomness. There is no online leaderboard.

## Architecture

- `config/`: items, recipes, mutations, upgrades, enemies, boss roster, ship modules, stellar skill trees.
- `entities/`: player, enemies, orbit items, projectiles and pickups.
- `systems/`: independent orbit, fusion, loot, scoring, difficulty, spawning, extraction, daily, ship, star and boss logic.
- `scenes/`: menu, arena, archive, daily, settings, engineering lab and results.
- `rendering/`: Phaser Graphics silhouettes, environment, effects, ship and stellar artwork.
- `input/`: movement adapter, ready for a future touch input source.
- `ui/`: lightweight semantic DOM overlays managed by Phaser scenes; no React.
- `managers/`: versioned persistence and procedural audio.
- `tests/`: deterministic, render-independent tests of real gameplay systems.

`GameScene` orchestrates the systems. Combat, enemies, and animations are rendered by Phaser. HTML overlays keep menus responsive and keyboard-focusable without adding a UI framework.

Simulation runs at 60 Hz with catch-up capped after long frames. Enemy, pickup, projectile and particle populations are bounded. Damage-number text objects are pooled. Desktop is the first target; menu layouts adapt to smaller screens, but touch movement is not implemented.

## Development controls

Debug controls are enabled only in a Vite development build and can be disabled with `VITE_DEBUG=false`.

- F1: statistics and the development lab.
- F2: add a random orbit part.
- F3: spawn an elite.
- F4: spawn a boss.
- F5: grant a level.
- F6: open an extraction portal.

The F1 lab also exposes ship/star milestone triggers, the new bosses, material grants, level 100, and forced collapse. These controls intentionally change local test scores and materials. Use an isolated browser profile/origin for testing. Production runs expose neither the lab nor the inspection handle.

## Publish later

`npm run build` creates a static `dist/` folder with relative asset paths. Upload its contents to a static web host. There are no API secrets or server requirements. Public deployment and online services are not included.

See `VERIFICATION.md` for executed checks and remaining validation limits.
