import { ScreenController, type ScreenSwitcher, type View } from 'src/types';
import type { Layer } from 'konva/lib/Layer';
import { Species } from 'src/common/types/Species';
import { GameScreenController } from 'src/screens/GameScreen/GameScreenController';
import Konva from 'konva';

/**
 * Cooking Tutorial screen that displays the tutorial image.
 * User taps anywhere to proceed to the actual cooking game.
 */
export class CookingTutorialScreenController extends ScreenController {
	private screenSwitcher: ScreenSwitcher;
	private species: Species[];
	private nextLevel: number;
	private group: Konva.Group | null = null;

	constructor(screenSwitcher: ScreenSwitcher, species: Species[], nextLevel: number) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.species = species;
		this.nextLevel = nextLevel;
	}

	getView(): View {
		return {
			getGroup: () => {
				if (!this.group) throw new Error('Group not initialized');
				return this.group;
			},
			show: () => {
				if (this.group) this.group.visible(true);
			},
			hide: () => {
				if (this.group) this.group.visible(false);
			},
		};
	}

	mount(layer?: Layer): void {
		if (!layer) return;

		const stage = layer.getStage();
		if (!stage) return;

		// Ensure stage is visible (might be hidden from previous cooking screen)
		stage.show();

		// Create group for tutorial
		this.group = new Konva.Group();

		// Load and display tutorial image
		const tutorialImg = new Image();
		tutorialImg.src = 'cooking-tutorial.png';

		const imageNode = new Konva.Image({
			x: 0,
			y: 0,
			width: stage.width(),
			height: stage.height(),
			image: undefined as unknown as HTMLImageElement,
		});

		tutorialImg.onload = () => {
			try {
				imageNode.image(tutorialImg);
				layer.batchDraw();
			} catch (e) {
				// ignore
			}
		};

		// Make entire image clickable to continue
		imageNode.on('click tap', () => {
			// Mark tutorial as seen for this game session
			GameScreenController['tutorialSeen'] = true;

			// Switch to the cooking game screen
			this.screenSwitcher.switchToScreen({
				type: 'cooking',
				species: this.species,
				nextLevel: this.nextLevel,
			});
		});

		this.group.add(imageNode);
		layer.add(this.group);
		layer.batchDraw();
	}

	show(): void {
		if (this.group) this.group.visible(true);
	}

	dispose(): void {
		if (this.group) {
			this.group.remove();
			this.group.destroy();
			this.group = null;
		}
	}
}

export default CookingTutorialScreenController;
