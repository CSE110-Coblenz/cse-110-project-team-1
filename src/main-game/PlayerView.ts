import Konva from 'konva';
import { Position, Viewport } from './types';

// Later we can accept an image and draw that instead.
export class PlayerView {
    private readonly color = '#ffcc00';

    public constructor() {

    }

    public draw(target: CanvasRenderingContext2D | Konva.Layer, viewport: Viewport, position: Position, radius: number) {
        // If target looks like a Konva layer, add a simple circle node
        if ((target as Konva.Layer).getClassName && (target as Konva.Layer).getClassName() === 'Layer') {
            const layer = target as Konva.Layer;
            const circle = new Konva.Circle({
                x: position.x - viewport.x,
                y: position.y - viewport.y,
                radius,
                fill: this.color,
            });
            layer.add(circle);
            return;
        }

    }
}
