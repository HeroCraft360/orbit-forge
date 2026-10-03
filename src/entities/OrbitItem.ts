import { ITEMS } from '../config/itemConfig';
export class OrbitItem {
    x = 0;
    y = 0;
    previousX = 0;
    previousY = 0;
    age = 0;
    cooldown = 1;
    hits = new Map<number, number>();
    readonly def;
    constructor(public id: number, public type: string, public angle: number) { this.def = ITEMS[type]!; }
}
