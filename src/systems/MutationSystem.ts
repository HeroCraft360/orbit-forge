import { MUTATIONS } from '../config/mutationConfig';
import { SeededRandom } from '../utils/SeededRandom';
export class MutationSystem {
    constructor(private random: SeededRandom) { }
    roll(recipe: string, fallback: string): {
        type: string;
        mutated: boolean;
    } {
        const mutation = MUTATIONS.find(m => m.recipe === recipe);
        const mutated = !!mutation && this.random.next() < mutation.chance;
        return { type: mutated ? mutation!.output : fallback, mutated };
    }
}
