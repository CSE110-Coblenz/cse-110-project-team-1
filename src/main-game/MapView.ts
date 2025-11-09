import Konva from 'konva';
import { Viewport, Wall } from './types';

/**
 * MapView renders a viewport of the MapModel.
 * It preserves the original class name and API but supports rendering to
 * either a CanvasRenderingContext2D (legacy) or a Konva.Layer (preferred).
 */
export class MapView {
	// static defaults
	public static DEFAULT_BACKGROUND = '#87ceeb';
	public static DEFAULT_WALL_COLOR = '#333333';

	private backgroundColor: string;
	private wallColor: string;

	constructor(
		backgroundColor = MapView.DEFAULT_BACKGROUND,
		wallColor = MapView.DEFAULT_WALL_COLOR,
	) {
		this.backgroundColor = backgroundColor;
		this.wallColor = wallColor;
	}

	public draw(
		ctxOrLayer: CanvasRenderingContext2D | Konva.Layer,
		viewport: Viewport,
		walls: Wall[],
	) {
		// Konva path
		if (
			(ctxOrLayer as Konva.Layer).getClassName &&
			(ctxOrLayer as Konva.Layer).getClassName() === 'Layer'
		) {
			const layer = ctxOrLayer as Konva.Layer;
			layer.destroyChildren();

			const bg = new Konva.Rect({
				x: 0,
				y: 0,
				width: viewport.width,
				height: viewport.height,
				fill: this.backgroundColor,
			});
			layer.add(bg);

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
				layer.add(line);
			}

			layer.batchDraw();
			return;
		}

		// Canvas path (legacy)
		const ctx = ctxOrLayer as CanvasRenderingContext2D;
		ctx.clearRect(0, 0, viewport.width, viewport.height);
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(0, 0, viewport.width, viewport.height);

		ctx.save();
		ctx.translate(-viewport.x, -viewport.y);
		for (const wall of walls) {
			if (!wall.points.length) continue;
			ctx.beginPath();
			ctx.moveTo(wall.points[0].x, wall.points[0].y);
			for (let i = 1; i < wall.points.length; i++) {
				ctx.lineTo(wall.points[i].x, wall.points[i].y);
			}
			ctx.closePath();
			ctx.fillStyle = this.wallColor;
			ctx.fill();
			ctx.strokeStyle = 'rgba(0,0,0,0.6)';
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		ctx.restore();
	}
}
