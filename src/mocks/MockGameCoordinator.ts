import CookingController from 'src/cooking/controller/CookingController';
import { Species, ALL_SPECIES } from 'src/common/types/Species';

export default class MockGameCoordinator {
	private cookingController: CookingController;

	constructor() {
		this.cookingController = new CookingController();
		console.log('MockGameCoordinator initialized');
	}

	/**
	 * Transition from main game to cooking minigame
	 */
	transitionToCookingGame(): void {
		console.log('Transitioning to cooking game...');

		// Mock customer data (normally comes from main game). Use ALL_SPECIES for richer demo.
		const mockCustomerTypes: Species[] = ALL_SPECIES as Species[];
		console.log('Starting cooking game with customers:', mockCustomerTypes);
		this.cookingController.startGame(mockCustomerTypes);
	}
}
