import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';

type TutorialScreenOptions = {
	onContinue: () => void;
	onStart: () => void;
};

/**
 * Tutorial Screen
 * shows user how to play with simple instructions/image.
 * has a cont button that goes back to intro screen
 */
export class TutorialScreenView implements View {
	private group: Group;
	private onContinue: () => void;
	private onStart: () => void;

	constructor(options: TutorialScreenOptions) {
		this.onContinue = options.onContinue;
		this.onStart = options.onStart;
		this.group = new Konva.Group();

		// background image for instructions
		const bgImgEl = new Image();
		bgImgEl.src = 'TutorialScreenOption1.png';
		const backdrop = new Konva.Image({
			x: 0,
			y: 0,
			height: window.innerHeight * 0.95,
			width: window.innerWidth * 0.95,
			image: undefined as unknown as HTMLImageElement,
		});
		bgImgEl.onload = () => {
			try {
				backdrop.image(bgImgEl);
				const layer = backdrop.getLayer();
				if (layer) layer.batchDraw();
			} catch (e) {
				// ignore
			}
		};

		const returnButton = new Konva.Rect({
			x: 430,
			y: 710,
			width: 260,
			height: 60,
			cornerRadius: 8,
			fill: '#ef5807ff',
		});

		const returnLabel = new Konva.Text({
			x: 430,
			y: 730,
			width: 260,
			align: 'center',
			text: 'Return',
			fontSize: 24,
			fill: '#ffffff',
		});

		const startButton = new Konva.Rect({
			x: 740,
			y: 710,
			width: 260,
			height: 60,
			cornerRadius: 8,
			fill: '#ef5807ff',
		});

		const startLabel = new Konva.Text({
			x: 740,
			y: 730,
			width: 260,
			align: 'center',
			text: 'Start Game',
			fontSize: 24,
			fill: '#ffffff',
		});

		returnButton.on('click tap', () => this.onContinue());
		returnLabel.on('click tap', () => this.onContinue());

		startButton.on('click tap', () => this.onStart());
		startLabel.on('click tap', () => this.onStart());

		this.group.add(backdrop);
		this.group.add(returnButton);
		this.group.add(returnLabel);
		this.group.add(startButton);
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

export default TutorialScreenView;
