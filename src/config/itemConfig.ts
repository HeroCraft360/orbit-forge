export type ItemRarity = 'common' | 'rare' | 'epic' | 'mythic';
export type SpecialEffect = 'none' | 'shield' | 'burn' | 'magnet' | 'cannon' | 'bomb' | 'gravity' | 'lightning';
export interface ItemDefinition {
    id: string;
    name: string;
    description: string;
    level: number;
    rarity: ItemRarity;
    damage: number;
    size: number;
    mass: number;
    rotationSpeedModifier: number;
    orbitRadiusModifier: number;
    knockback: number;
    specialEffect: SpecialEffect;
    evolutionTags: string[];
    color: number;
    shape: 'rock' | 'blade' | 'shield' | 'orb' | 'planet' | 'magnet';
}
const item = (id: string, name: string, description: string, overrides: Partial<ItemDefinition> = {}): ItemDefinition => ({
    id, name, description, level: 1, rarity: 'common', damage: 18, size: 13, mass: 1,
    rotationSpeedModifier: 1, orbitRadiusModifier: 1, knockback: 80, specialEffect: 'none',
    evolutionTags: ['stone'], color: 0xb0c7ca, shape: 'rock', ...overrides,
});
export const ITEMS: Record<string, ItemDefinition> = {
    rock: item('rock', 'Rock', 'Every constellation begins with a little debris.'),
    boulder: item('boulder', 'Boulder', 'A heavier impact. A very persuasive argument.', { level: 2, damage: 40, size: 18, mass: 2, knockback: 145, color: 0xd2e4cd }),
    blade: item('blade', 'Blade', 'A fast, clean arc through the swarm.', { damage: 15, shape: 'blade', color: 0x8dfae0, rotationSpeedModifier: 1.55, knockback: 30, evolutionTags: ['metal'] }),
    shield: item('shield', 'Aegis', 'A defensive satellite. Reduces incoming damage by 12%.', { damage: 12, size: 18, shape: 'shield', color: 0x80b7ff, specialEffect: 'shield', evolutionTags: ['metal'] }),
    fire: item('fire', 'Fire Orb', 'A captured ember that burns on contact.', { damage: 22, color: 0xffa163, specialEffect: 'burn', shape: 'orb', evolutionTags: ['fire'] }),
    magnet: item('magnet', 'Magnet', 'Pulls distant salvage into your field.', { damage: 10, shape: 'magnet', color: 0xea9afd, specialEffect: 'magnet', evolutionTags: ['field'] }),
    meteor: item('meteor', 'Meteor', 'Stone and flame. Devastating, lingering impacts.', { level: 3, rarity: 'rare', damage: 78, size: 22, mass: 3, rotationSpeedModifier: .8, color: 0xffae69, specialEffect: 'burn', knockback: 190, evolutionTags: ['stone', 'fire'] }),
    planet: item('planet', 'Mini Planet', 'Your own tiny world. Enormous consequences.', { level: 4, rarity: 'epic', damage: 150, size: 29, mass: 4, rotationSpeedModifier: .7, shape: 'planet', color: 0x84e6c8, specialEffect: 'gravity', knockback: 240 }),
    lightning: item('lightning', 'Arc Orb', 'Electricity looking for somewhere to go.', { damage: 26, shape: 'orb', color: 0xc3bcff, specialEffect: 'lightning', evolutionTags: ['storm'] }),
    storm: item('storm', 'Storm Planet', 'A world wrapped in a living thunderstorm.', { level: 5, rarity: 'mythic', damage: 220, size: 32, shape: 'planet', color: 0xb5a0ff, specialEffect: 'lightning', evolutionTags: ['storm', 'stone'] }),
    cannon: item('cannon', 'Satellite Cannon', 'Fires outward while it circles your core.', { level: 2, rarity: 'rare', damage: 36, color: 0xffd17e, shape: 'shield', specialEffect: 'cannon', evolutionTags: ['metal'] }),
    bomb: item('bomb', 'Nova Seed', 'Periodically releases an explosive pulse.', { level: 2, rarity: 'rare', damage: 46, color: 0xff7d9f, shape: 'orb', specialEffect: 'bomb', evolutionTags: ['fire'] }),
    void: item('void', 'Void Meteor', 'MUTATION · A quiet singularity with a ravenous pull.', { level: 4, rarity: 'mythic', damage: 170, size: 26, color: 0xc998ff, shape: 'planet', specialEffect: 'gravity', evolutionTags: ['void'] }),
    quantum: item('quantum', 'Quantum Blade', 'MUTATION · A blade that seems to be everywhere.', { level: 3, rarity: 'mythic', damage: 85, size: 22, color: 0xf9a8de, shape: 'blade', rotationSpeedModifier: 2, evolutionTags: ['quantum'] }),
};
export const BASE_DROPS = ['rock', 'rock', 'blade', 'shield', 'fire', 'magnet', 'lightning'] as const;
export const RARITY_COLORS = { common: '#b0c7ca', rare: '#ffc476', epic: '#91efd0', mythic: '#d8a2ff' };
