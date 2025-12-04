import { ScreenController, type ScreenSwitcher, type View } from 'src/types';
import type { Layer } from 'konva/lib/Layer';
import CookingController from 'src/cooking/controller/CookingController';
import { Species } from 'src/common/types/Species';
import { CookingInfoButtonView } from 'src/screens/CookingScreen/CookingInfoButtonView';
import { CookingHelpPopupView } from 'src/screens/CookingScreen/CookingHelpPopupView';
import Konva from 'konva';

/**
 * Cooking screen controller that integrates the actual cooking minigame.
 * The cooking game creates its own Konva stages in the DOM container.
 */
export class CookingScreenController extends ScreenController {
	private cookingController: CookingController;
	private hiddenStage: Konva.Stage | null = null;
	private screenSwitcher: ScreenSwitcher;
	private species: Species[];
	private nextLevel: number;
	private infoButtonView: CookingInfoButtonView;
	private helpPopupView: CookingHelpPopupView;

	constructor(screenSwitcher: ScreenSwitcher, species: Species[], nextLevel: number) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.species = species;
		this.nextLevel = nextLevel;
		this.cookingController = new CookingController();
		this.infoButtonView = new CookingInfoButtonView(() => this.showHelpPopup());
		this.helpPopupView = new CookingHelpPopupView();
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

		// Add cooking-screen class to body for scoped CSS
		document.body.classList.add('cooking-screen');

		// Show info button
		this.infoButtonView.show();

		// Start the cooking game
		this.cookingController.startGame(this.species, (score: number) => {
			// When cooking is complete, go to the next level with speed boost
			this.screenSwitcher.switchToScreen({ 
				type: 'game', 
				level: this.nextLevel,
				speedBoost: this.calculateSpeedBoost(score)
			});
		});
	}

	show(): void {
		// Game already started in mount
	}

	private calculateSpeedBoost(score: number): number {
		// +50 speed on cooking game success
		return 20;
	}

	private showHelpPopup(): void {
		this.helpPopupView.show();
	}

	dispose(): void {
		// Stop the game and clean up
		this.cookingController.stopGame();

		// Remove cooking-screen class from body
		document.body.classList.remove('cooking-screen');

		// Clear the cooking view from the DOM
		const container = document.getElementById('container');
		if (container) {
			const viewPlaceholder = document.getElementById('view-placeholder');
			if (viewPlaceholder) {
				viewPlaceholder.remove();
			}
		}

		// Hide info button and help popup
		this.infoButtonView.hide();
		this.helpPopupView.hide();

		// Restore and show the hidden stage for the next screen
		if (this.hiddenStage) {
			this.hiddenStage.show();
			this.hiddenStage = null;
		}
	}
}

export default CookingScreenController;
