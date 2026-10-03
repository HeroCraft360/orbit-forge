export const BOSS_TYPES = ['boss', 'reaper', 'leviathan', 'choir'] as const;
export type BossType = typeof BOSS_TYPES[number];
export const isBossType = (type: string): type is BossType => (BOSS_TYPES as readonly string[]).includes(type);
export const BOSS_TITLES: Record<BossType, string> = {
    boss: 'THE HOLLOW SUN', reaper: 'THE GLASS REAPER', leviathan: 'GRAVITY LEVIATHAN', choir: 'THE NULL CHOIR',
};
