import { MapModel } from './MapModel';
import { Viewport, Position } from './types';

/**
 * MapController manages the camera/viewport stored inside the MapModel.
 * The controller issues commands to the model (move, resize, center) but
 * the viewport state lives in the model itself.
 */
export class MapController {
    private model: MapModel;

    constructor(model: MapModel, viewportWidth: number, viewportHeight: number) {
        this.model = model;
        // initialize viewport size and center it on the map
        this.model.setViewportSize(viewportWidth, viewportHeight);
        const startX = Math.max(0, Math.floor(this.model.getWidth() / 2 - viewportWidth / 2));
        const startY = Math.max(0, Math.floor(this.model.getHeight() / 2 - viewportHeight / 2));
        this.model.setViewportPosition(startX, startY);
    }

    public getViewport(): Viewport {
        return this.model.getViewport();
    }

    public setViewportSize(width: number, height: number) {
        this.model.setViewportSize(width, height);
    }

    // movement in pixels
    public moveUp(pixels = 64) {
        this.model.moveViewportBy(0, -pixels);
    }
    public moveDown(pixels = 64) {
        this.model.moveViewportBy(0, pixels);
    }
    public moveLeft(pixels = 64) {
        this.model.moveViewportBy(-pixels, 0);
    }
    public moveRight(pixels = 64) {
        this.model.moveViewportBy(pixels, 0);
    }

    public getVisibleWalls() {
        const vp = this.model.getViewport();
        return this.model.getWallsInRegion(vp.x, vp.y, vp.width, vp.height);
    }

    public centerOn(position: Position) {
        this.model.centerViewportOn(position);
    }
}
