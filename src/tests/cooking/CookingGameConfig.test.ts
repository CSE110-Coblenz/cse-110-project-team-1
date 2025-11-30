import { describe, it, expect } from 'vitest';
import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';

describe('CookingGameConfig', () => {
	it('should have positive number of customers', () => {
		expect(CookingGameConfig.NUM_CUSTOMERS).toBeGreaterThan(0);
	});

	it('should have positive max active customers', () => {
		expect(CookingGameConfig.MAX_ACTIVE_CUSTOMERS).toBeGreaterThan(0);
	});

	it('should have positive initial patience', () => {
		expect(CookingGameConfig.INITIAL_PATIENCE).toBeGreaterThan(0);
	});

	it('should have positive patience decrease rate', () => {
		expect(CookingGameConfig.PATIENCE_DECREASE_RATE).toBeGreaterThan(0);
	});

	it('should have frame time within game performance range (30-60 FPS)', () => {
		expect(CookingGameConfig.FRAME_TIME).toBeGreaterThanOrEqual(1000 / 60);
		expect(CookingGameConfig.FRAME_TIME).toBeLessThanOrEqual(1000 / 30);
	});
});
