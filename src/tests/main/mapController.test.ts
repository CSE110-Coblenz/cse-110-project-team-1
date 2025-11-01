import { describe, it, expect, vi } from 'vitest';
import { MapController } from '../../main-game/MapController';

describe('MapController', () => {
    it('initializes viewport centered', () => {
        const model: any = {
            getWidth: () => 800,
            getHeight: () => 600,
            getWallsInRegion: vi.fn(() => [])
        };

        const controller = new MapController(model, 200, 150);
        const vp = controller.getViewport();
        // centered start
        expect(vp.width).toBe(200);
        expect(vp.height).toBe(150);
        expect(vp.x).toBe(Math.floor(800 / 2 - 200 / 2));
        expect(vp.y).toBe(Math.floor(600 / 2 - 150 / 2));
    });

    it('clamps viewport when moving beyond bounds', () => {
        const model: any = {
            getWidth: () => 800,
            getHeight: () => 600,
            getWallsInRegion: vi.fn(() => [])
        };

        const controller = new MapController(model, 200, 150);

        // moving beyond bounds clamps
        controller.moveLeft(10000);
        expect(controller.getViewport().x).toBe(0);
        controller.moveUp(10000);
        expect(controller.getViewport().y).toBe(0);

        controller.moveRight(10000);
        expect(controller.getViewport().x).toBe(Math.max(0, 800 - 200));
        controller.moveDown(10000);
        expect(controller.getViewport().y).toBe(Math.max(0, 600 - 150));
    });

    it('getVisibleWalls calls model.getWallsInRegion with viewport bounds', () => {
        const getWallsInRegion = vi.fn(() => ['wallA']);
        const model: any = {
            getWidth: () => 500,
            getHeight: () => 400,
            getWallsInRegion
        };
        const controller = new MapController(model, 100, 100);
        const vp = controller.getViewport();
        const visible = controller.getVisibleWalls();
        expect(getWallsInRegion).toHaveBeenCalledWith(vp.x, vp.y, vp.width, vp.height);
        expect(visible).toEqual(['wallA']);
    });
});
