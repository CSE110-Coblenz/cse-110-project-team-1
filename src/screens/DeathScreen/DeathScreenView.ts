import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';

export class DeathScreenView implements View {
	private group: Group;
	private label: Konva.Text;
	private playAgainButton: Konva.Rect;
	private playAgainLabel: Konva.Text;

	constructor(score?: number, options?: { onPlayAgain?: () => void }) {
		this.group = new Konva.Group();

		const img = new Image();
		img.src = 'loss_background.png';
		const bg = new Konva.Image({
			x: 0,
			y: 0,
			height: window.innerHeight * 0.95,
			width: window.innerWidth * 0.95,
			image: undefined as unknown as HTMLImageElement,
		});
		img.onload = () => {
			try {
				bg.image(img);
				const layer = bg.getLayer();
				if (layer) layer.batchDraw();
			} catch (e) {}
		};

		this.label = new Konva.Text({
			x: (window.innerWidth * 0.95) / 2,
			y: 100,
			text: `GAME OVER`,
			fontSize: 48,
			fill: 'red',
			align: 'center',
			fontFamily: 'bold',
		});
		this.label.offsetX(this.label.width() / 2);

		// play again button
		const centerX = (window.innerWidth * 0.95) / 2;
		this.playAgainButton = new Konva.Rect({
			x: centerX,
			y: 220,
			width: 240,
			height: 56,
			cornerRadius: 8,
			fill: '#d32f2f',
		});
		this.playAgainButton.offsetX(this.playAgainButton.width() / 2);

		this.playAgainLabel = new Konva.Text({
			x: centerX,
			y: 236,
			width: 240,
			align: 'center',
			text: 'Play Again',
			fontSize: 24,
			fill: '#ffffff',
		});
		this.playAgainLabel.offsetX(this.playAgainLabel.width() / 2);

		if (options?.onPlayAgain) {
			this.playAgainButton.on(
				'click tap',
				() => options.onPlayAgain && options.onPlayAgain(),
			);
			this.playAgainLabel.on('click tap', () => options.onPlayAgain && options.onPlayAgain());
		}

		this.group.add(bg);
		this.group.add(this.label);
		this.group.add(this.playAgainButton);
		this.group.add(this.playAgainLabel);
	}

	getGroup(): Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
	}

	hide(): void {
		this.group.visible(false);
	}
}

export default DeathScreenView;
