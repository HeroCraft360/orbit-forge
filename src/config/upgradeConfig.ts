export interface BuildModifiers {
    speed: number;
    radius: number;
    damage: number;
    knockback: number;
    magnet: number;
    gravity: number;
    luck: number;
    fusion: number;
    pulse: number;
}
export interface UpgradeDefinition {
    id: string;
    name: string;
    eyebrow: string;
    description: string;
    icon: string;
    effect: Partial<BuildModifiers>;
    heal?: number;
    maxHealth?: number;
    item?: string;
}
export const UPGRADES: UpgradeDefinition[] = [
    { id: 'velocity', name: 'Velocity', eyebrow: 'ORBIT DYNAMICS', description: 'Orbit rotation speed +20%. Turn your field into a blur.', icon: '↗', effect: { speed: .2 } },
    { id: 'magnetism', name: 'Magnetism', eyebrow: 'FIELD CONTROL', description: 'Orbit radius −10%. Rotation speed +25%.', icon: '◎', effect: { radius: -.1, speed: .25 } },
    { id: 'gravity', name: 'Gravity Well', eyebrow: 'CROWD CONTROL', description: 'Pull nearby enemies toward your orbit. +35% field strength.', icon: '◉', effect: { gravity: .35 } },
    { id: 'fusion', name: 'Fusion', eyebrow: 'EVOLUTION', description: 'Merges become faster. Gain a Boulder immediately.', icon: '⋈', effect: { fusion: .3 }, item: 'boulder' },
    { id: 'mass', name: 'Mass Driver', eyebrow: 'IMPACT', description: 'Knockback +35%. Orbit damage +15%.', icon: '⬡', effect: { knockback: .35, damage: .15 } },
    { id: 'shield', name: 'Core Shield', eyebrow: 'SURVIVAL', description: 'Max integrity +25. Restore 40 integrity.', icon: '◇', effect: {}, maxHealth: 25, heal: 40 },
    { id: 'luck', name: 'Lucky Star', eyebrow: 'SALVAGE', description: 'More part drops and better rare salvage chances.', icon: '✧', effect: { luck: .3 } },
    { id: 'reach', name: 'Tractor Field', eyebrow: 'COLLECTION', description: 'Loot attraction range +45%. Reach what others leave behind.', icon: '⌁', effect: { magnet: .45 } },
    { id: 'pulse', name: 'Core Resonance', eyebrow: 'FIREPOWER', description: 'Core pulse damage +40%. Gain a Fire Orb.', icon: '⊕', effect: { pulse: .4 }, item: 'fire' },
    { id: 'arsenal', name: 'Sharp Company', eyebrow: 'ARSENAL', description: 'Gain two Blades. Watch them become something new.', icon: '⟐', effect: { damage: .1 }, item: 'blade' },
];
export const freshModifiers = (): BuildModifiers => ({ speed: 1, radius: 1, damage: 1, knockback: 1, magnet: 1, gravity: 0, luck: 0, fusion: 1, pulse: 1 });
