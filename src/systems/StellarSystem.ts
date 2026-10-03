import { STARS, STELLAR_SKILLS, STAR_FIRST_SCORE, STAR_SCORE_INTERVAL, type StarId, type StellarStat } from '../config/starConfig';
import { SeededRandom } from '../utils/SeededRandom';
export class StellarSystem {
    current?: StarId;
    nextScore = STAR_FIRST_SCORE;
    cooldown = 1;
    points = 0;
    earnedLevels = 0;
    skills = new Set<string>();
    discovered = new Set<StarId>();
    constructor(private random: SeededRandom) { }
    check(score: number): StarId | undefined {
        if (score < this.nextScore)
            return;
        const ids = (Object.keys(STARS) as StarId[]).filter(id => id !== this.current);
        this.current = this.random.pick(ids);
        this.nextScore = STAR_FIRST_SCORE + (Math.floor((score - STAR_FIRST_SCORE) / STAR_SCORE_INTERVAL) + 1) * STAR_SCORE_INTERVAL;
        if (!this.discovered.has(this.current)) {
            this.discovered.add(this.current);
            this.points += 2;
        }
        this.cooldown = .5;
        return this.current;
    }
    levelUp(): void { if (this.current && ++this.earnedLevels % 3 === 0)
        this.points++; }
    value(stat: StellarStat): number {
        return STELLAR_SKILLS.filter(s => s.star === this.current && s.stat === stat && this.skills.has(s.id)).reduce((sum, s) => sum + s.amount, 0);
    }
    canUnlock(id: string): boolean {
        const skill = STELLAR_SKILLS.find(s => s.id === id);
        return !!skill && skill.star === this.current && this.points > 0 && !this.skills.has(id) && (!skill.requires || this.skills.has(skill.requires));
    }
    unlock(id: string): boolean { if (!this.canUnlock(id))
        return false; this.skills.add(id); this.points--; return true; }
}
