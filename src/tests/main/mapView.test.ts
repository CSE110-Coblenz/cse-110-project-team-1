import { describe, it, expect, vi } from 'vitest';
import Konva from 'konva';
import { MapView } from '../../main-game/MapView';

describe('MapView (Konva Layer)', () => {
    it('draws background and walls using Konva shapes', () => {
        // Create a real Konva layer (isolated from DOM)
        const layer = new Konva.Layer();

        // Spy on methods to verify interactions
        vi.spyOn(layer, 'destroyChildren');
        vi.spyOn(layer, 'add');
        vi.spyOn(layer, 'draw');

        // Construct the MapView with this layer
        const view = new MapView(layer, '#abc', '#333333');

        // Define viewport and test wall data
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

        // Call draw (MapView should populate the layer)
        view.addWallstoView(vp, walls as any);
        view.draw();

        // ✅ Verify Konva interactions
        expect(layer.destroyChildren).toHaveBeenCalledTimes(1);
        expect(layer.add).toHaveBeenCalled(); // background + walls added
        expect(layer.draw).toHaveBeenCalledTimes(1);

        // ✅ Optionally verify correct shape types added
        const addedShapes = (layer.add as any).mock.calls.map((call: any) => call[0]);

        // The first shape is usually the background (Rect)
        expect(addedShapes[0]).toBeInstanceOf(Konva.Rect);

        // The next shape should be the wall (Line or Polygon)
        expect(
            addedShapes.some((shape: any) => shape instanceof Konva.Line)
        ).toBe(true);
    });
});
