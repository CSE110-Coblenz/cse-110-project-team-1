/**
 * Valid species types in the game
 */
export type Species = 'rabbit' | 'mushroom' | 'sunflower';

export const ALL_SPECIES: readonly Species[] = ['rabbit', 'mushroom', 'sunflower'] as const;

export function isSpecies(value: string): value is Species {
    return ALL_SPECIES.includes(value as Species);
}
