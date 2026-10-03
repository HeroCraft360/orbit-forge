import { GAME } from '../config/gameConfig';
import type { BuildModifiers } from '../config/upgradeConfig';
import { OrbitItem } from '../entities/OrbitItem';
import { MergeSystem } from './MergeSystem';
import { MutationSystem } from './MutationSystem';
import { SeededRandom } from '../utils/SeededRandom';
export interface MergeEvent {
    type: string;
    recipe: string;
    mutated: boolean;
}
export class OrbitSystem {
    items: OrbitItem[] = [];
    private nextId = 1;
    private mergeTimer = 0;
    private mutation: MutationSystem;
    constructor(random: SeededRandom) { this.mutation = new MutationSystem(random); }
    add(type: string): boolean {
        if (this.items.length >= GAME.maxOrbit)
            return false;
        this.items.push(new OrbitItem(this.nextId++, type, this.items.length * 2.39996));
        this.space();
        return true;
    }
    private space(): void {
        const first = this.items[0]?.angle ?? 0;
        this.items.forEach((item, index) => { item.angle = first + index / this.items.length * Math.PI * 2; });
    }
    count(effect: string): number { return this.items.filter(i => i.def.specialEffect === effect).length; }
    update(dt: number, core: {
        x: number;
        y: number;
    }, modifiers: BuildModifiers): MergeEvent | undefined {
        this.mergeTimer -= dt;
        for (const item of this.items) {
            item.age += dt;
            item.cooldown -= dt;
            item.previousX = item.x;
            item.previousY = item.y;
            item.angle += dt * 1.9 * modifiers.speed * item.def.rotationSpeedModifier / Math.pow(item.def.mass, .12);
            const radius = (GAME.orbitRadius + Math.floor(this.items.indexOf(item) / 8) * 45) * Math.max(.55, modifiers.radius) * item.def.orbitRadiusModifier;
            item.x = core.x + Math.cos(item.angle) * radius;
            item.y = core.y + Math.sin(item.angle) * radius * .86;
            if (item.age <= dt) {
                item.previousX = item.x;
                item.previousY = item.y;
            }
            for (const [id, remaining] of item.hits) {
                if (remaining <= dt)
                    item.hits.delete(id);
                else
                    item.hits.set(id, remaining - dt);
            }
        }
        if (this.mergeTimer > 0)
            return;
        const pair = MergeSystem.find(this.items);
        if (!pair)
            return;
        const result = this.mutation.roll(pair.recipe.id, pair.recipe.output);
        this.items.splice(pair.b, 1);
        this.items.splice(pair.a, 1);
        this.add(result.type);
        this.mergeTimer = 1.3 / modifiers.fusion;
        return { ...result, recipe: pair.recipe.id };
    }
}
