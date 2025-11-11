/**
 * Valid species types in the game
 */

export enum Species {
	SPEC1 = 'Species 1',
	SPEC2 = 'Species 2',
	ANTEATER = 'Anteater',
	CAT = 'Cat',
	TEST = 'Test',
	MUSHROOM = 'Mushroom',
	RABBIT = 'Rabbit',
	SUNFLOWER = 'Sunflower',
}

export const MaptoNextSpecies = new Map<Species, Species>([
	[Species.SPEC1, Species.SPEC2],
	[Species.SPEC2, Species.ANTEATER],
	[Species.ANTEATER, Species.SPEC1],
]);

export const ALL_SPECIES = Object.values(Species);
