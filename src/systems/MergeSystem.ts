import { RECIPES, recipeKey, type MergeRecipe } from '../config/mergeRecipes';
const byKey = new Map(RECIPES.map(recipe => [recipeKey(recipe.inputs), recipe]));
export class MergeSystem {
    /** Pair matching is commutative. Resolve one transaction at a time to avoid consuming a part twice. */
    static find(items: readonly {
        type: string;
    }[]): {
        a: number;
        b: number;
        recipe: MergeRecipe;
    } | undefined {
        for (let a = 0; a < items.length; a++)
            for (let b = a + 1; b < items.length; b++) {
                const recipe = byKey.get(recipeKey([items[a]!.type, items[b]!.type]));
                if (recipe)
                    return { a, b, recipe };
            }
        return undefined;
    }
}
