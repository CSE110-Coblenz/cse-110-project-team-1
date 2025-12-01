import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';

type MenuScreenOptions = {
	onStart: () => void;
};

export class MenuScreenView implements View {
	private group: Group;
	private onStart: () => void;

	constructor(options: MenuScreenOptions) {
		this.onStart = options.onStart;
		this.group = new Konva.Group();

		// background image (title screen)
		const bgImgEl = new Image();
		bgImgEl.src = 'background.png';
		const bg = new Konva.Image({
			x: 0,
			y: 0,
			height: window.innerHeight * 0.95,
			width: window.innerWidth * 0.95,
			image: undefined as unknown as HTMLImageElement,
		});
		bgImgEl.onload = () => {
			try {
				bg.image(bgImgEl);
				const layer = bg.getLayer();
				if (layer) layer.batchDraw();
			} catch (e) {
				// ignore
			}
		};

		const centerX = (window.innerWidth * 0.95) / 2;
		const label = new Konva.Text({
			x: centerX,
			y: 100,
			text: 'An Oddesy of Change',
			fontSize: 64,
			fill: 'white',
			align: 'center',
			fontFamily: 'bold',
		});
		// center the label so x,y is its center
		label.offsetX(label.width() / 2);

		// start button (centered)
		const startBtn = new Konva.Rect({
			x: centerX,
			y: 220,
			width: 240,
			height: 56,
			cornerRadius: 8,
			fill: '#1976d2',
		});
		startBtn.offsetX(startBtn.width() / 2);

		const startLabel = new Konva.Text({
			x: centerX,
			y: 236,
			width: 240,
			align: 'center',
			text: 'Start',
			fontSize: 28,
			fill: '#fff',
		});
		startLabel.offsetX(startLabel.width() / 2);

		startBtn.on('click tap', () => this.onStart());
		startLabel.on('click tap', () => this.onStart());

		this.group.add(bg);
		this.group.add(label);
		this.group.add(startBtn);
		this.group.add(startLabel);
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

export default MenuScreenView;
