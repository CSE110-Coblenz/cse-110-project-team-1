import Konva from 'konva';
import { Position, Viewport } from 'src/main-game/types';
import { Species } from 'src/common/types/Species';

export class EntityView {
	private imageNode: Konva.Image;
	private loadedImage: HTMLImageElement;
	private offscreenCanvas: HTMLCanvasElement;
	private offscreenCtx: CanvasRenderingContext2D;
	private textNode: Konva.Text;

	constructor(species: Species = Species.MOUSE) {
		this.imageNode = new Konva.Image();
		this.offscreenCanvas = document.createElement('canvas');
		this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;

		// Text node
		this.textNode = new Konva.Text({
			x: 0,
			y: 0,
			text: species,
			fontSize: 12,
			fontFamily: 'Arial',
			fill: 'black',
			shadowColor: 'black',
			shadowOffset: { x: 1, y: 1 },
		});

		const imgSrc = `sprites/${species}.png`;
		let img = new Image();
		img.src = imgSrc;
		this.loadedImage = img;

		img.onload = () => {
			this.loadedImage = img;
			this.offscreenCanvas.width = img.width;
			this.offscreenCanvas.height = img.height;

			this.offscreenCtx.clearRect(0, 0, img.width, img.height);
			this.offscreenCtx.drawImage(img, 0, 0);

			this.imageNode.image(this.offscreenCanvas);
			this.imageNode.width(img.width);
			this.imageNode.height(img.height);
		};

		img.onerror = () => {
			console.error(`Failed to load entity image at: ${imgSrc}`);
		};
	}

	public draw(
		layer: Konva.Layer,
		viewport: Viewport,
		redTint: number,
		color: string,
		position: Position,
		radius: number,
	) {
		const img = this.loadedImage;

		if (!img || img.width === 0 || img.height === 0) {
			return;
		}

		this.offscreenCtx.clearRect(0, 0, img.width, img.height);
		this.offscreenCtx.drawImage(img, 0, 0);

		if (redTint > 0) {
			this.offscreenCtx.fillStyle = `rgba(255,0,0,${redTint})`;
			this.offscreenCtx.globalCompositeOperation = 'source-atop';
			this.offscreenCtx.fillRect(0, 0, img.width, img.height);
			this.offscreenCtx.globalCompositeOperation = 'source-over';
		}

		const scale = (radius * 5) / img.width;
		this.imageNode.scale({ x: scale, y: scale });

		this.imageNode.position({
			x: position.x - viewport.x,
			y: position.y - viewport.y,
		});
		this.imageNode.offsetX(img.width / 2);
		this.imageNode.offsetY(img.height / 2);

		if (!this.imageNode.getLayer()) {
			layer.add(this.imageNode);
		}

		this.textNode.position({
			x: position.x - viewport.x,
			y: position.y - viewport.y + (img.height * scale) / 2 + 2,
		});
		this.textNode.fill(color);
		this.textNode.offsetX(this.textNode.width() / 2);
		if (!this.textNode.getLayer()) {
			layer.add(this.textNode);
		}
	}

	public undraw() {
		this.imageNode.destroy();
		this.textNode.destroy();
	}
}
