import Konva from 'konva';
import type { Group } from 'konva/lib/Group';
import type { View } from 'src/types';

type IntroScreenOptions = {
	onContinue: () => void;
	onTutorial: () => void;
};

/**
 * Minimal intro/tutorial view.
 * Displays a simple overlay with text and a button-like rectangle that
 * triggers `onContinue` when clicked/tapped.
 */
export class IntroScreenView implements View {
	private group: Group;
	private onContinue: () => void;
	private onTutorial: () => void;

	constructor(options: IntroScreenOptions) {
		this.onContinue = options.onContinue;
		this.onTutorial = options.onTutorial;
		this.group = new Konva.Group();

		// background image for story/intro
		const bgImgEl = new Image();
		bgImgEl.src = 'background.png';
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

		const title = new Konva.Text({
			x: 120,
			y: 120,
			text: 'Welcome to the Wild',
			fontSize: 36,
			fill: '#ffffff',
		});
		const story = new Konva.Text({
			x: 120,
			y: 180,
			text: 'You Were Once a Hunter in rural Arkansas, but One Fateful Night, \nYou Were Transformed into a Creature of the Wild by a Vengeful Witch, \nAngry at Your Overhunting of Local Wildlife. Now, You Must Navigate This New Existence, \nLearning to Survive Among Predators and Prey Alike. Embrace Your Instincts, \nAdapt to Your Surroundings, and Discover the True Meaning of Survival in a World Where the \nRules Have Changed. Your Journey from Hunter to Hunted Begins Now.',
			fontSize: 24,
			fill: '#dddddd',
		});

		const continueButton = new Konva.Rect({
			x: 120,
			y: 600,
			width: 260,
			height: 60,
			cornerRadius: 8,
			fill: '#4caf50',
		});

		const continueLabel = new Konva.Text({
			x: 120,
			y: 620,
			width: 260,
			align: 'center',
			text: 'Start Game',
			fontSize: 24,
			fill: '#ffffff',
		});

		const tutorialButton = new Konva.Rect({
			x: 120,
			y: 520,
			width: 260,
			height: 60,
			cornerRadius: 8,
			fill: '#4caf50',
		});

		const tutorialLabel = new Konva.Text({
			x: 120,
			y: 540,
			width: 260,
			align: 'center',
			text: 'Tutorial',
			fontSize: 24,
			fill: '#ffffff',
		});

		continueButton.on('click tap', () => this.onContinue());
		continueLabel.on('click tap', () => this.onContinue());

		tutorialButton.on('click tap', () => this.onTutorial());
		tutorialLabel.on('click tap', () => this.onTutorial());

		this.group.add(backdrop);
		this.group.add(title);
		this.group.add(story);
		this.group.add(continueButton);
		this.group.add(continueLabel);
		this.group.add(tutorialButton);
		this.group.add(tutorialLabel);
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

export default IntroScreenView;
