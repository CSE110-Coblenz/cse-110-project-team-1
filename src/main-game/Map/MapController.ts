import { MapModel } from './MapModel';
import { Viewport, Position } from '../types';

/**
 * MapController manages the camera/viewport inside the MapModel.
 * It exposes moveUp/Down/Left/Right methods and clamps the viewport to map bounds.
 */
export class MapController {
    private model: MapModel;
    private viewport: Viewport;

    constructor(model: MapModel, viewportWidth: number, viewportHeight: number) {
        this.model = model;
        // center viewport on map center by default
        const startX = Math.max(0, Math.floor(model.getWidth() / 2 - viewportWidth / 2));
        const startY = Math.max(0, Math.floor(model.getHeight() / 2 - viewportHeight / 2));
        this.viewport = { x: startX, y: startY, width: viewportWidth, height: viewportHeight };
    }

    public getViewport(): Viewport {
        return { ...this.viewport };
    }

    public setViewportSize(width: number, height: number) {
        this.viewport.width = width;
        this.viewport.height = height;
        this.clampViewport();
    }

    private clampViewport() {
        const maxX = Math.max(0, this.model.getWidth() - this.viewport.width);
        const maxY = Math.max(0, this.model.getHeight() - this.viewport.height);
        if (this.viewport.x < 0) this.viewport.x = 0;
        if (this.viewport.y < 0) this.viewport.y = 0;
        if (this.viewport.x > maxX) this.viewport.x = maxX;
        if (this.viewport.y > maxY) this.viewport.y = maxY;
    }

    // movement in pixels
    public moveUp(pixels = 64) {
        this.viewport.y -= pixels;
        this.clampViewport();
    }
    public moveDown(pixels = 64) {
        this.viewport.y += pixels;
        this.clampViewport();
    }
    public moveLeft(pixels = 64) {
        this.viewport.x -= pixels;
        this.clampViewport();
    }
    public moveRight(pixels = 64) {
        this.viewport.x += pixels;
        this.clampViewport();
    }

    public getVisibleWalls() {
        return this.model.getWallsInRegion(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
    }

    public centerOn(position: Position) {
        this.viewport.x = Math.floor(position.x - this.viewport.width / 2);
        this.viewport.y = Math.floor(position.y - this.viewport.height / 2);
        this.clampViewport();
    }
}
