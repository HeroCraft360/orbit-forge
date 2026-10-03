export interface EnemyDefinition {
    name: string;
    hp: number;
    speed: number;
    size: number;
    damage: number;
    color: number;
    score: number;
    resistance: number;
    sides: number;
}
export const ENEMIES = {
    crawler: { name: 'Crawler', hp: 22, speed: 66, size: 14, damage: 10, color: 0xe88991, score: 40, resistance: 1, sides: 5 },
    runner: { name: 'Runner', hp: 20, speed: 130, size: 12, damage: 9, color: 0xffb16e, score: 55, resistance: 1, sides: 3 },
    tank: { name: 'Tank', hp: 160, speed: 42, size: 27, damage: 19, color: 0x9a8ad1, score: 150, resistance: .25, sides: 6 },
    swarm: { name: 'Swarm', hp: 13, speed: 96, size: 8, damage: 6, color: 0xf2b9bd, score: 25, resistance: 1.5, sides: 3 },
    shooter: { name: 'Spitter', hp: 56, speed: 58, size: 17, damage: 12, color: 0xf1d38c, score: 90, resistance: .8, sides: 4 },
    elite: { name: 'Rift Warden', hp: 440, speed: 58, size: 34, damage: 24, color: 0xffbd77, score: 650, resistance: .2, sides: 6 },
    boss: { name: 'THE HOLLOW SUN', hp: 3600, speed: 34, size: 96, damage: 38, color: 0xff8b78, score: 5000, resistance: .05, sides: 8 },
    reaper: { name: 'THE GLASS REAPER', hp: 4200, speed: 55, size: 88, damage: 45, color: 0xff7eaa, score: 7500, resistance: .04, sides: 3 },
    leviathan: { name: 'GRAVITY LEVIATHAN', hp: 6800, speed: 26, size: 128, damage: 52, color: 0xaf96ff, score: 10000, resistance: .02, sides: 7 },
    choir: { name: 'THE NULL CHOIR', hp: 4800, speed: 42, size: 102, damage: 40, color: 0xe7bdff, score: 8500, resistance: .03, sides: 8 },
} satisfies Record<string, EnemyDefinition>;
export type EnemyType = keyof typeof ENEMIES;
