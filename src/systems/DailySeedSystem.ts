import { SeededRandom } from '../utils/SeededRandom';
export interface DailyChallenge {
    date: string;
    seed: string;
    title: string;
    modifiers: string[];
    gravity: number;
    fire: number;
    bossRate: number;
    magnet: number;
}
const challenges = [
    { title: 'HEAVY HEAVENS', modifiers: ['Gravity ×1.5', 'Fire damage +30%', 'Magnet range −20%'], gravity: 1.5, fire: 1.3, bossRate: 1, magnet: .8 },
    { title: 'SOLAR PRESSURE', modifiers: ['Boss frequency ×1.5', 'Fire damage +30%', 'Magnet range +20%'], gravity: 1, fire: 1.3, bossRate: 1.5, magnet: 1.2 },
    { title: 'EVENT HORIZON', modifiers: ['Gravity ×1.5', 'Boss frequency ×1.5', 'Magnet range +20%'], gravity: 1.5, fire: 1, bossRate: 1.5, magnet: 1.2 },
];
export class DailySeedSystem {
    static today(date = new Date()): DailyChallenge {
        const day = date.toISOString().slice(0, 10), seed = 'orbit-forge:v2:' + day;
        return { date: day, seed, ...new SeededRandom(seed).pick(challenges) };
    }
}
