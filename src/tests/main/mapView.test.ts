import { describe, it, expect, vi } from 'vitest';
import { MapView } from '../../main-game/MapView';

function makeMockCtx() {
	const ctx: any = {
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		closePath: vi.fn(),
		fill: vi.fn(),
		stroke: vi.fn(),
		save: vi.fn(),
		restore: vi.fn(),
		translate: vi.fn(),
		createPattern: vi.fn(() => ({ pattern: true })),
		// allow fillStyle to be assigned
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
	};
	return ctx;
}

describe('MapView (canvas path)', () => {
	it('draws background and walls using solid fill', () => {
		const view = new MapView('#abc', '#333333');
		const ctx = makeMockCtx();
		const vp = { x: 0, y: 0, width: 200, height: 150 };
		const walls = [
			{
				id: 'w1',
				points: [
					{ x: 10, y: 10 },
					{ x: 30, y: 10 },
					{ x: 30, y: 30 },
					{ x: 10, y: 30 },
				],
			},
		];

		view.draw(ctx as CanvasRenderingContext2D, vp, walls as any);

		expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 200, 150);
		expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
		// ensure path was created and filled
		expect(ctx.beginPath).toHaveBeenCalled();
		expect(ctx.fill).toHaveBeenCalled();
		expect(ctx.stroke).toHaveBeenCalled();
	});
});
