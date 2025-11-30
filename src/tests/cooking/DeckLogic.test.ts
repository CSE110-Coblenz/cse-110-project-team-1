import { describe, it, expect } from 'vitest';
import { DeckLogic } from 'src/cooking/model/DeckLogic';
import { Label } from 'src/cooking/model/Label';

describe('DeckLogic', () => {
	it('generateRandomLabel returns a valid Label instance', () => {
		const label = DeckLogic.generateRandomLabel();
		expect(label).toBeInstanceOf(Label);
	});
});
