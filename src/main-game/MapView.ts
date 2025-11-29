import Konva from 'konva';
import { Viewport, Wall } from 'src/main-game/types';

export class MapView {
	// static defaults
	public static DEFAULT_WALL_COLOR = '#333333';
	private bg: Konva.Rect;
	private bgImage: HTMLImageElement;

	constructor(bgImage: HTMLImageElement) {
		this.bgImage = bgImage;

		this.bg = new Konva.Rect({
			fillPatternImage: this.bgImage,
			fillPatternRepeat: 'repeat',
		});
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
			layer.removeChildren();

			const texW = this.bgImage.width || 1;
			const texH = this.bgImage.height || 1;

			const offsetX = viewport.x % texW;
			const offsetY = viewport.y % texH;

			this.bg.fillPatternOffset({
				x: offsetX,
				y: offsetY,
			});

			this.bg.width(viewport.width);
			this.bg.height(viewport.height);
			layer.add(this.bg);
			for (const wall of walls) {
				wall.image.x(wall.minX - viewport.x);
				wall.image.y(wall.minY - viewport.y);
				layer.add(wall.image);
			}

			layer.batchDraw();
			return;
		}
	}
}
