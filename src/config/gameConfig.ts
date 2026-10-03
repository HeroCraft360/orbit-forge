export const GAME = {
    width: 1440, height: 900, worldRadius: 1700, fixedStep: 1 / 60,
    maxEnemies: 180, maxPickups: 240, maxParticles: 240, maxOrbit: 16,
    playerSpeed: 225, playerHealth: 100, orbitRadius: 84,
    firstPortal: 180, portalInterval: 120, portalDuration: 24,
    firstBoss: 90, bossInterval: 100, eliteInterval: 27,
    debug: import.meta.env?.DEV && import.meta.env?.VITE_DEBUG !== 'false',
};
