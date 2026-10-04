# Verification — Orbit Forge 0.2

## Automated checks

- `npm test`: **35 tests passed, zero failures**.
- `npm run build`: strict TypeScript check and Vite production bundle passed.
- Production launcher HTTP smoke check passed: HTML and all three referenced assets returned 200; missing files and an encoded path outside dist returned 404.
- Portable dependency lock verified with 98 entries, including Windows, Linux, and macOS native build dependencies. Installed dependency versions are unchanged.
- A fresh, isolated `npm ci --offline` completed successfully after disk space was freed (22 installed packages).
- Development controls are guarded by Vite's development flag.

Coverage includes seeded randomness, daily dates, every fusion recipe, orbit limits, mutation routes, movement and health, guaranteed opening loot, boss loot, upgrade choices, difficulty, extraction, combo, scoring, and save recovery.

Expansion coverage includes version 1 migration, independent available/lifetime tallies, all 20 ship modules, prerequisites, maximum ranks, insufficient funds, persistent-write rollback, stale-tab purchase prevention, ship arrival at 500,000, clockwise flight, blasts/missiles/laser attacks, stellar score gates, all four forms' attacks, black-hole projectile absorption, all skill prerequisites, stellar point spending, level-100 XP pacing, boss dimensions/damage, and three new boss patterns.

## Published game

GitHub Pages successfully built deployment commit `df23803` from `gh-pages`. The live HTML, JavaScript, CSS, and favicon returned HTTP 200. The hosted menu rendered and clicking PLAY entered the live arena.

## Browser observations and limits

The initial playable build was inspected in the in-app browser: the menu, first enemy/rock pickup, live orbit, multiple parts, fusion, and three-choice upgrade panel were observed. No browser errors were reported during those observed flows.

The version 0.2 expansion has **not received a complete visual or end-to-end browser pass**. The in-app browser connection repeatedly timed out; an isolated Playwright browser also closed during launch. The new mechanics are covered by system tests and compile successfully, but their final screen composition and extended combat balance need a human playtest.

In particular, do not treat the automated system tests as proof of 20-minute survival balance, frame rate under maximum pressure, or all browser/platform combinations.

## Reproducible manual expansion check

Use an isolated browser profile or `http://localhost:5175` rather than the existing `127.0.0.1` profile. Development buttons modify that origin's real local save.

1. Start Play, press F1, and use **Ship milestone**. Check that the ship enters from the right, the run clock pauses during the cutscene, and clockwise flight/automatic attacks resume afterward.
2. Use **Stellar milestone**. Press T, purchase a skill, and verify its prerequisite and point deduction. Repeat at later milestones to inspect all four forms.
3. Spawn Reaper, Leviathan, and Choir from the development lab. Dodge the charge warning, mine circles, and rotating salvos.
4. Use **Level 100**, then grant XP; compare subsequent thresholds with the documented progression.
5. Grant **Test materials**, end the run, and open Techno-fusion from the menu's left tab. Buy a module, inspect the unlock animation, reload, and confirm the purchase remains.
6. Check the archive: available parts decrease after spending; collected-all-time totals remain unchanged.
7. Start another normal run and trigger the ship again. Confirm installed modules return. A daily run intentionally uses the standard ship.
8. Check extraction, death, immediate restart, keyboard navigation, screen sizes, and production mode without debug controls.

The prior save format never stored item quantities, so migration cannot recover historical per-part totals. Existing discoveries, settings, scores, and run statistics are retained; new material accounting starts with version 0.2.
