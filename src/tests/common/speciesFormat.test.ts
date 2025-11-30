import { describe, it, expect } from 'vitest';
import { formatSpeciesName } from 'src/common/types/Species';

describe('formatSpeciesName', () => {
	it('splits BerryBush into "Berry Bush"', () => {
		expect(formatSpeciesName('BerryBush')).toBe('Berry Bush');
	});
	it('splits GarterSnake into "Garter Snake"', () => {
		expect(formatSpeciesName('GarterSnake')).toBe('Garter Snake');
	});
	it('keeps Rabbit as "Rabbit"', () => {
		expect(formatSpeciesName('Rabbit')).toBe('Rabbit');
	});
});
