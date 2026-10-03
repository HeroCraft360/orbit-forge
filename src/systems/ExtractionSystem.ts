import { GAME } from '../config/gameConfig';
export class ExtractionSystem {
    next = GAME.firstPortal;
    open = false;
    expires = 0;
    x = 0;
    y = 0;
    update(time: number, x: number, y: number): 'opened' | 'missed' | undefined {
        if (!this.open && time >= this.next) {
            this.open = true;
            this.expires = time + GAME.portalDuration;
            this.x = Math.max(-1500, Math.min(1500, x + 170));
            this.y = y;
            return 'opened';
        }
        if (this.open && time >= this.expires) {
            this.close(time);
            return 'missed';
        }
        return undefined;
    }
    close(time: number): void { this.open = false; this.next = time + GAME.portalInterval; }
}
