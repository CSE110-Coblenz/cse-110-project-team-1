import Konva from 'konva';
import { Viewport, Wall, View } from './types';

/**
 * MapView renders a viewport of the MapModel.
 * It preserves the original class name and API but supports rendering to
 * either a CanvasRenderingContext2D (legacy) or a Konva.Layer (preferred).
 */
export class MapView extends View{
    private backgroundColor: string;
    private wallColor: string;

    constructor(layer : Konva.Layer, backgroundColor = '#87ceeb', wallColor = '#333333') {
        super(layer, []);
        this.backgroundColor = backgroundColor;
        this.wallColor = wallColor;
    }

    public draw(viewport: Viewport, walls: Wall[]): void {
        // Konva path
        this.layer.destroyChildren();
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
            fill: this.backgroundColor,
        });
        this.layer.add(bg);

        for (const wall of walls) {
            if (!wall.points || wall.points.length === 0) continue;
            const points: number[] = [];
            for (const p of wall.points) {
                points.push(p.x - viewport.x, p.y - viewport.y);
            }
            const line = new Konva.Line({
                points,
                closed: true,
                fill: this.wallColor,
            });
            this.layer.add(line);
        }

        this.layer.batchDraw();
    }
}
