import Phaser from 'phaser';
import type { MovementInput } from '../entities/Player';
export class MovementController {
    private keys: Record<string, Phaser.Input.Keyboard.Key>;
    constructor(scene: Phaser.Scene) {
        this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') as Record<string, Phaser.Input.Keyboard.Key>;
    }
    read(): MovementInput {
        const down = (a: string, b: string): number => Number(this.keys[a]!.isDown || this.keys[b]!.isDown);
        return { x: down('D', 'RIGHT') - down('A', 'LEFT'), y: down('S', 'DOWN') - down('W', 'UP') };
    }
}
