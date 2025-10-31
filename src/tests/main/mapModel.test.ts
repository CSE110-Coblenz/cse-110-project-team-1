import { describe, it, expect } from 'vitest';
import { MapModel } from '../../main-game/Map/MapModel';

describe('MapModel (rectangles)', () => {
    it('isPointInsideWall returns true for points inside rectangle bbox and false otherwise', () => {
        const model = new MapModel({ width: 200, height: 200, wallCount: 0 });
        // inject a single rectangle wall at 10..30 x and 10..30 y
        (model as any).walls = [
            {
                id: 'w1', points: [
                    { x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 30 }, { x: 10, y: 30 }
                ]
            }
        ];

        expect(model.isPointInsideWall(20, 20)).toBe(true);
        expect(model.isPointInsideWall(10, 10)).toBe(true); // on edge
        expect(model.isPointInsideWall(9, 9)).toBe(false);
        expect(model.isPointInsideWall(31, 20)).toBe(false);
    });

    it('getWallsInRegion returns only walls overlapping the region', () => {
        const model = new MapModel({ width: 400, height: 400, wallCount: 0 });
        (model as any).walls = [
            { id: 'a', points: [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 50 }, { x: 10, y: 50 }] },
            { id: 'b', points: [{ x: 200, y: 200 }, { x: 240, y: 200 }, { x: 240, y: 240 }, { x: 200, y: 240 }] }
        ];

        const found = model.getWallsInRegion(0, 0, 100, 100);
        expect(found.map(w => w.id)).toEqual(['a']);

        const found2 = model.getWallsInRegion(190, 190, 50, 50);
        expect(found2.map(w => w.id)).toEqual(['b']);
    });
});
