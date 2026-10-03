export type StarId = 'sun' | 'pulsar' | 'blackhole' | 'supernova';
export interface StarDefinition {
    id: StarId;
    name: string;
    kind: string;
    description: string;
    trait: string;
    color: number;
    icon: string;
    cooldown: number;
}
export const STARS: Record<StarId, StarDefinition> = {
    sun: { id: 'sun', name: 'Solar Sovereign', kind: 'SUN-LIKE STAR', description: 'A golden furnace. Solar flares burn an expanding circle around your core.', trait: 'Fire damage +40% · warm plasma restores integrity.', color: 0xffcf76, icon: '☀', cooldown: 3.5 },
    pulsar: { id: 'pulsar', name: 'Polar Sentinel', kind: 'NEUTRON STAR / PULSAR', description: 'A cobalt heart with twin rotating jets. Periodically fires opposing lances through the arena.', trait: 'Orbit rotation +25% · piercing neutron lances.', color: 0x91cfff, icon: '✦', cooldown: 2 },
    blackhole: { id: 'blackhole', name: 'Quiet Oblivion', kind: 'STELLAR BLACK HOLE', description: 'A collapsed star crowned by an accretion disk. Crushes nearby enemies and consumes hostile fire.', trait: 'Strong gravity · periodic projectile absorption.', color: 0xc0a0ff, icon: '◉', cooldown: 5 },
    supernova: { id: 'supernova', name: 'Afterlight', kind: 'SUPERNOVA REMNANT', description: 'The beautiful violence left after a star explodes. Repeated shockwaves hurl enemies away.', trait: 'Impact damage +25% · enormous shockwave knockback.', color: 0xff95b5, icon: '✹', cooldown: 4.5 },
};
export type StellarStat = 'damage' | 'range' | 'haste' | 'heal' | 'shield' | 'echo';
export interface StellarSkill {
    id: string;
    star: StarId;
    name: string;
    branch: string;
    description: string;
    stat: StellarStat;
    amount: number;
    requires?: string;
}
const tree = (star: StarId, entries: [
    string,
    string,
    string,
    StellarStat,
    number
][]): StellarSkill[] => entries.map(([name, branch, description, stat, amount], i) => ({
    id: star + '-' + i, star, name, branch, description, stat, amount, requires: i % 3 === 0 ? undefined : star + '-' + (i - 1),
}));
export const STELLAR_SKILLS: StellarSkill[] = [
    ...tree('sun', [
        ['Corona', 'FLARE', 'Solar ability damage +45%.', 'damage', .45],
        ['Prominence', 'FLARE', 'Solar flare radius +30%.', 'range', .3],
        ['Daybreak', 'FLARE', 'Every flare echoes once at half power.', 'echo', 1],
        ['Warmth', 'HEARTH', 'Restore an additional 1 integrity per second.', 'heal', 1],
        ['Chromosphere', 'HEARTH', 'Incoming damage −12%.', 'shield', .12],
        ['Perpetual Dawn', 'HEARTH', 'Solar flare frequency +40%.', 'haste', .4],
    ]),
    ...tree('pulsar', [
        ['Polar Focus', 'JET', 'Neutron lance damage +50%.', 'damage', .5],
        ['Light Cylinder', 'JET', 'Lance reach +35%.', 'range', .35],
        ['Binary Beat', 'JET', 'Fire two additional perpendicular lances.', 'echo', 1],
        ['Fast Clock', 'SPIN', 'Neutron burst frequency +30%.', 'haste', .3],
        ['Degenerate Shell', 'SPIN', 'Incoming damage −12%.', 'shield', .12],
        ['Recycled Pulsar', 'SPIN', 'Restore 1.2 integrity per second.', 'heal', 1.2],
    ]),
    ...tree('blackhole', [
        ['Tidal Teeth', 'COLLAPSE', 'Crush damage +60%.', 'damage', .6],
        ['Photon Sphere', 'COLLAPSE', 'Crush and absorption radius +35%.', 'range', .35],
        ['Hawking Echo', 'COLLAPSE', 'Absorption pulses emit an extra outward burst.', 'echo', 1],
        ['Accretion', 'HUNGER', 'Restore 1 integrity per second.', 'heal', 1],
        ['Time Dilation', 'HUNGER', 'Crush frequency +35%.', 'haste', .35],
        ['No Escape', 'HUNGER', 'Incoming damage −18%.', 'shield', .18],
    ]),
    ...tree('supernova', [
        ['Oxygen Flash', 'EXPANSION', 'Shockwave damage +50%.', 'damage', .5],
        ['Nebula Bloom', 'EXPANSION', 'Shockwave radius +40%.', 'range', .4],
        ['Light Echo', 'EXPANSION', 'A second shock follows every explosion.', 'echo', 1],
        ['Hot Ejecta', 'AFTERGLOW', 'Explosion frequency +35%.', 'haste', .35],
        ['Stellar Nursery', 'AFTERGLOW', 'Restore 1.3 integrity per second.', 'heal', 1.3],
        ['Iron Heart', 'AFTERGLOW', 'Incoming damage −15%.', 'shield', .15],
    ]),
];
export const STAR_FIRST_SCORE = 5000000;
export const STAR_SCORE_INTERVAL = 10000000;
