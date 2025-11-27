import { describe, it, expect, vi } from 'vitest';
import { EntityView } from 'src/main-game/EntityView';

describe('EntityView.undraw', () => {
	it('destroys the circle and clears the reference', () => {
		const v = new EntityView();
		(v as any).imageNode = {
			destroy: vi.fn(),
			destroyed: vi.fn(() => true),
		};
		(v as any).textNode = {
			destroy: vi.fn(),
			destroyed: vi.fn(() => true),
		};

		v.undraw();
		expect((v as any).imageNode.destroyed()).toBe(true);
		expect((v as any).textNode.destroyed()).toBe(true);
	});
});
