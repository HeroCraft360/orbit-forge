import Phaser from 'phaser';
import './style.css';
import { GAME } from './config/gameConfig';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { DiscoveryScene } from './scenes/DiscoveryScene';
import { DailyScene } from './scenes/DailyScene';
import { SettingsScene } from './scenes/SettingsScene';
import { TechnoFusionScene } from './scenes/TechnoFusionScene';
const game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', backgroundColor: '#080f18',
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, pixelArt: false, powerPreference: 'high-performance' },
    fps: { target: 60, forceSetTimeOut: false },
    input: { keyboard: true }, audio: { noAudio: true },
    scene: [MenuScene, GameScene, GameOverScene, DiscoveryScene, DailyScene, SettingsScene, TechnoFusionScene],
});
// Development-only inspection handle; absent from production bundles.
if (GAME.debug)
    Object.assign(window, { __ORBIT_FORGE__: game });
