import { ScreenController, type ScreenSwitcher, type View } from 'src/types';
import type { Layer } from 'konva/lib/Layer';
import CookingController from 'src/cooking/controller/CookingController';
import { Species, ALL_SPECIES } from 'src/common/types/Species';
import Konva from 'konva';

/**
 * Cooking screen controller that integrates the actual cooking minigame.
 * The cooking game creates its own Konva stages in the DOM container.
 */
export class CookingScreenController extends ScreenController {
	private cookingController: CookingController;
	private hiddenStage: Konva.Stage | null = null;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.cookingController = new CookingController();
	}

	getView(): View {
		// The cooking view manages its own DOM, so we return a dummy view
		// that satisfies the interface but doesn't actually do anything
		return {
			getGroup: () => {
				throw new Error('CookingView manages its own DOM');
			},
			show: () => {},
			hide: () => {},
		};
	}

	mount(layer?: Layer): void {
		// The cooking game creates its own Konva stages in the container
		// We need to hide the existing stage (but not destroy it) so the cooking game
		// can take over the container
		if (layer) {
			const stage = layer.getStage();
			if (stage) {
				this.hiddenStage = stage;
				stage.hide();
			}
		}

		// Now start the cooking game - it will create its own stages in the container
		// For demo purposes: start with ALL_SPECIES so the cooking minigame can handle all types
		this.cookingController.startGame(ALL_SPECIES as Species[]);
	}

	show(): void {
		// Game already started in mount
	}

	dispose(): void {
		// Stop the game and clean up
		this.cookingController.stopGame();

		// Clear the cooking view from the DOM
		const container = document.getElementById('container');
		if (container) {
			const viewPlaceholder = document.getElementById('view-placeholder');
			if (viewPlaceholder) {
				viewPlaceholder.remove();
			}
		}

		// Restore and show the hidden stage for the next screen
		if (this.hiddenStage) {
			this.hiddenStage.show();
			this.hiddenStage = null;
		}
	}
}

export default CookingScreenController;
