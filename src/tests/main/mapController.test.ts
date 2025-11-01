import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapController } from '../../main-game/MapController';

// shared mock model factory and variable for tests
let mockModel: any;
function makeMockModel(initialViewport = { x: 0, y: 0, width: 0, height: 0 }, w = 800, h = 600) {
    const vp = { ...initialViewport };
    return {
        getWidth: () => w,
        getHeight: () => h,
        setViewportSize: vi.fn((width: number, height: number) => { vp.width = width; vp.height = height; }),
        setViewportPosition: vi.fn((x: number, y: number) => { vp.x = x; vp.y = y; }),
        getViewport: vi.fn(() => ({ ...vp })),
        moveViewportBy: vi.fn((dx: number, dy: number) => { vp.x += dx; vp.y += dy; }),
        getWallsInRegion: vi.fn(() => [])
    };
}

beforeEach(() => {
    mockModel = makeMockModel();
});

describe('MapController', () => {
    it('initializes viewport centered and delegates to model', () => {
        const controller = new MapController(mockModel, 200, 150);
        // ensure model was instructed to initialize viewport
        expect(mockModel.setViewportSize).toHaveBeenCalledWith(200, 150);

        const vp = controller.getViewport();
        // centered start (default mockModel size is 800x600)
        expect(vp.width).toBe(200);
        expect(vp.height).toBe(150);
        expect(vp.x).toBe(Math.floor(800 / 2 - 200 / 2));
        expect(vp.y).toBe(Math.floor(600 / 2 - 150 / 2));
    });

    it('delegates movement calls to model.moveViewportBy', () => {
        // recreate mockModel with an initial viewport
        mockModel = makeMockModel({ x: 100, y: 100, width: 200, height: 150 });
        const controller = new MapController(mockModel, 200, 150);

        controller.moveLeft(50);
        expect(mockModel.moveViewportBy).toHaveBeenCalledWith(-50, 0);

        controller.moveUp(30);
        expect(mockModel.moveViewportBy).toHaveBeenCalledWith(0, -30);

        controller.moveRight(10);
        expect(mockModel.moveViewportBy).toHaveBeenCalledWith(10, 0);

        controller.moveDown(5);
        expect(mockModel.moveViewportBy).toHaveBeenCalledWith(0, 5);
    });

    it('getVisibleWalls calls model.getWallsInRegion with viewport bounds', () => {
        const initialViewport = { x: 5, y: 6, width: 100, height: 100 };
        const getWallsInRegion = vi.fn(() => ['wallA']);
        mockModel = makeMockModel(initialViewport, 500, 400);
        mockModel.getWallsInRegion = getWallsInRegion;

        const controller = new MapController(mockModel, 100, 100);
        const vp = controller.getViewport();
        const visible = controller.getVisibleWalls();
        expect(getWallsInRegion).toHaveBeenCalledWith(vp.x, vp.y, vp.width, vp.height);
        expect(visible).toEqual(['wallA']);
    });
});
