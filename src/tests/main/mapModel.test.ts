import { describe, it, expect } from 'vitest';
import { MapModel } from '../../main-game/MapModel';

describe('MapModel (rectangles)', () => {
	it('isPointInsideWall returns true for points inside rectangle bbox and false otherwise', () => {
		const model = new MapModel({ width: 200, height: 200, wallCount: 0 });
		// inject a single rectangle wall at 10..30 x and 10..30 y
		(model as any).walls = [
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

		expect(model.isPointInsideWall(20, 20)).toBe(true);
		expect(model.isPointInsideWall(10, 10)).toBe(true); // on edge
		expect(model.isPointInsideWall(9, 9)).toBe(false);
		expect(model.isPointInsideWall(31, 20)).toBe(false);
	});

	it('getWallsInRegion returns only walls overlapping the region', () => {
		const model = new MapModel({ width: 400, height: 400, wallCount: 0 });
		(model as any).walls = [
			{
				id: 'a',
				points: [
					{ x: 10, y: 10 },
					{ x: 50, y: 10 },
					{ x: 50, y: 50 },
					{ x: 10, y: 50 },
				],
			},
			{
				id: 'b',
				points: [
					{ x: 200, y: 200 },
					{ x: 240, y: 200 },
					{ x: 240, y: 240 },
					{ x: 200, y: 240 },
				],
			},
		];

		const found = model.getWallsInRegion(0, 0, 100, 100);
		expect(found.map((w) => w.id)).toEqual(['a']);

		const found2 = model.getWallsInRegion(190, 190, 50, 50);
		expect(found2.map((w) => w.id)).toEqual(['b']);
	});
});

describe('MapModel viewport API', () => {
	it('can set/get viewport size and position and clamps to map bounds', () => {
		const model = new MapModel({ width: 400, height: 300, wallCount: 0 });

		model.setViewportSize(200, 150);
		model.setViewportPosition(100, 50);
		let vp = model.getViewport();
		expect(vp.width).toBe(200);
		expect(vp.height).toBe(150);
		expect(vp.x).toBe(100);
		expect(vp.y).toBe(50);

		// moving by deltas
		model.moveViewportBy(50, 50);
		vp = model.getViewport();
		expect(vp.x).toBe(150);
		expect(vp.y).toBe(100);

		// move beyond right/bottom, should clamp to max
		model.moveViewportBy(1000, 1000);
		vp = model.getViewport();
		expect(vp.x).toBe(Math.max(0, 400 - 200));
		expect(vp.y).toBe(Math.max(0, 300 - 150));

		// set negative position clamps to 0
		model.setViewportPosition(-50, -60);
		vp = model.getViewport();
		expect(vp.x).toBe(0);
		expect(vp.y).toBe(0);
	});

	it('centerViewportOn recenters correctly', () => {
		const model = new MapModel({ width: 400, height: 300, wallCount: 0 });
		model.setViewportSize(200, 150);

		// center on a point in the middle
		model.centerViewportOn({ x: 200, y: 150 });
		const vp = model.getViewport();
		expect(vp.x).toBe(Math.floor(200 - vp.width / 2));
		expect(vp.y).toBe(Math.floor(150 - vp.height / 2));
	});

	it('centerViewportOn clamps near edges', () => {
		const model = new MapModel({ width: 400, height: 300, wallCount: 0 });
		model.setViewportSize(200, 150);

		// center near bottom-right should clamp so viewport stays inside map
		model.centerViewportOn({ x: 1000, y: 1000 });
		const vp = model.getViewport();
		expect(vp.x).toBe(Math.max(0, 400 - vp.width));
		expect(vp.y).toBe(Math.max(0, 300 - vp.height));
	});
});
