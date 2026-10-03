import { GAME } from '../config/gameConfig';
export interface MovementInput {
    x: number;
    y: number;
}
export class Player {
    x = 0;
    y = 0;
    radius = 14;
    hp = GAME.playerHealth;
    maxHp = GAME.playerHealth;
    invulnerable = 0;
    pulseCooldown = .5;
    update(dt: number, input: MovementInput): void {
        const length = Math.hypot(input.x, input.y) || 1;
        this.x = Math.max(-GAME.worldRadius, Math.min(GAME.worldRadius, this.x + input.x / length * GAME.playerSpeed * dt));
        this.y = Math.max(-GAME.worldRadius, Math.min(GAME.worldRadius, this.y + input.y / length * GAME.playerSpeed * dt));
        this.invulnerable = Math.max(0, this.invulnerable - dt);
        this.pulseCooldown -= dt;
    }
    hit(damage: number, shieldCount: number): boolean {
        if (this.invulnerable > 0)
            return false;
        this.hp = Math.max(0, this.hp - damage * Math.max(.45, 1 - shieldCount * .12));
        this.invulnerable = .65;
        return true;
    }
}
