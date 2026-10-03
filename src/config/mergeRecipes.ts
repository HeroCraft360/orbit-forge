export interface MergeRecipe {
    id: string;
    inputs: readonly [
        string,
        string
    ];
    output: string;
}
export const RECIPES: MergeRecipe[] = [
    { id: 'boulder', inputs: ['rock', 'rock'], output: 'boulder' },
    { id: 'meteor', inputs: ['boulder', 'fire'], output: 'meteor' },
    { id: 'dense-meteor', inputs: ['boulder', 'boulder'], output: 'meteor' },
    { id: 'planet', inputs: ['meteor', 'meteor'], output: 'planet' },
    { id: 'storm', inputs: ['planet', 'lightning'], output: 'storm' },
    { id: 'cannon', inputs: ['blade', 'blade'], output: 'cannon' },
    { id: 'bomb', inputs: ['fire', 'fire'], output: 'bomb' },
    { id: 'magnetic-cannon', inputs: ['magnet', 'shield'], output: 'cannon' },
];
export const recipeKey = (inputs: readonly string[]): string => [...inputs].sort().join('+');
