export const SHIP_SCORE = 500000;
export interface ShipStats {
    fireRate: number;
    boltDamage: number;
    boltCount: number;
    projectileSpeed: number;
    critChance: number;
    laserRecharge: number;
    beamDamage: number;
    beamWidth: number;
    beamDuration: number;
    beamRange: number;
    orbitSpeed: number;
    armor: number;
    pickupRange: number;
    knockback: number;
    repairRate: number;
    missileDamage: number;
    missileRate: number;
    missileRadius: number;
    chainDamage: number;
    gravityStrength: number;
}
export interface ShipUpgrade {
    id: keyof ShipStats;
    name: string;
    branch: 'Ballistics' | 'Photonics' | 'Navigation' | 'Payload';
    description: string;
    icon: string;
    cost: Record<string, number>;
    amount: number;
    maxRank: number;
    requires?: keyof ShipStats;
}
const upgrade = (id: keyof ShipStats, name: string, branch: ShipUpgrade['branch'], description: string, cost: Record<string, number>, amount: number, requires?: keyof ShipStats): ShipUpgrade => ({
    id, name, branch, description, cost, amount, requires, maxRank: 3,
    icon: { Ballistics: '⟐', Photonics: 'ϟ', Navigation: '◎', Payload: '✹' }[branch],
});
export const SHIP_UPGRADES: ShipUpgrade[] = [
    upgrade('fireRate', 'Accelerator Coils', 'Ballistics', 'Blast frequency +25% per rank.', { rock: 120, blade: 60 }, .25),
    upgrade('boltDamage', 'Tungsten Hearts', 'Ballistics', 'Blast damage +35% per rank.', { boulder: 150, meteor: 35 }, .35, 'fireRate'),
    upgrade('boltCount', 'Prismatic Barrels', 'Ballistics', 'One additional blast per volley, per rank.', { blade: 240, cannon: 100 }, 1, 'boltDamage'),
    upgrade('projectileSpeed', 'Rail Injection', 'Ballistics', 'Blast travel speed +25% per rank.', { lightning: 250, magnet: 120 }, .25, 'boltCount'),
    upgrade('critChance', 'Probability Engine', 'Ballistics', 'Critical blast chance +12%. Critical hits deal triple damage.', { storm: 600, quantum: 12 }, .12, 'projectileSpeed'),
    upgrade('laserRecharge', 'Capacitor Banks', 'Photonics', 'Laser recharge speed +25% per rank.', { fire: 140, magnet: 90 }, .25),
    upgrade('beamDamage', 'White-Light Lattice', 'Photonics', 'Laser damage +40% per rank.', { meteor: 200, lightning: 140 }, .4, 'laserRecharge'),
    upgrade('beamWidth', 'Event Splitter', 'Photonics', 'Laser width +35% per rank.', { cannon: 180, planet: 90 }, .35, 'beamDamage'),
    upgrade('beamDuration', 'Sustained Radiance', 'Photonics', 'Laser duration +30% per rank.', { fire: 600, storm: 180 }, .3, 'beamWidth'),
    upgrade('beamRange', 'Horizon Lance', 'Photonics', 'Laser reach +25% per rank.', { storm: 400, void: 20 }, .25, 'beamDuration'),
    upgrade('orbitSpeed', 'Vector Thrusters', 'Navigation', 'Clockwise orbital speed +20% per rank.', { rock: 150, magnet: 80 }, .2),
    upgrade('armor', 'Escort Aegis', 'Navigation', 'Ship field reduces damage to your core by 7% per rank.', { shield: 250, boulder: 180 }, .07, 'orbitSpeed'),
    upgrade('pickupRange', 'Salvage Tethers', 'Navigation', 'Core loot attraction +20% per rank while the ship is active.', { magnet: 300, planet: 80 }, .2, 'armor'),
    upgrade('knockback', 'Inertial Hammer', 'Navigation', 'Ship blast knockback +45% per rank.', { boulder: 500, meteor: 240 }, .45, 'pickupRange'),
    upgrade('repairRate', 'Living Hull', 'Navigation', 'Repair 0.6 core integrity per second, per rank.', { shield: 700, planet: 280, void: 12 }, .6, 'knockback'),
    upgrade('missileDamage', 'Nova Warheads', 'Payload', 'Missile damage +40% per rank.', { bomb: 100, fire: 120 }, .4),
    upgrade('missileRate', 'Rapid Silos', 'Payload', 'Missile launch frequency +25% per rank.', { cannon: 180, bomb: 160 }, .25, 'missileDamage'),
    upgrade('missileRadius', 'Bloom Chambers', 'Payload', 'Missile blast radius +25% per rank.', { meteor: 350, planet: 140 }, .25, 'missileRate'),
    upgrade('chainDamage', 'Storm Relays', 'Payload', 'Ship blasts arc to a second enemy for 30% damage per rank.', { lightning: 500, storm: 240 }, .3, 'missileRadius'),
    upgrade('gravityStrength', 'Singularity Tow', 'Payload', 'Ship field pulls enemies toward the core. +0.5 strength per rank.', { planet: 600, void: 30 }, .5, 'chainDamage'),
];
export const shipUpgradeCost = (upgrade: ShipUpgrade, rank: number): Record<string, number> => Object.fromEntries(Object.entries(upgrade.cost).map(([id, amount]) => [id, Math.ceil(amount * 2.2 ** rank)]));
export const shipStats = (ranks: Record<string, number> = {}): ShipStats => {
    const result: ShipStats = { fireRate: 1, boltDamage: 1, boltCount: 1, projectileSpeed: 1, critChance: 0, laserRecharge: 1, beamDamage: 1, beamWidth: 1, beamDuration: 1, beamRange: 1, orbitSpeed: 1, armor: 0, pickupRange: 1, knockback: 1, repairRate: 0, missileDamage: 1, missileRate: 1, missileRadius: 1, chainDamage: 0, gravityStrength: 0 };
    for (const u of SHIP_UPGRADES)
        result[u.id] += Math.min(u.maxRank, Math.max(0, ranks[u.id] ?? 0)) * u.amount;
    return result;
};
