import CookingController from '../cooking/controller/CookingController';

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
        
        // Mock customer data (normally comes from main game)
        const mockCustomerTypes = [
            'mushroom',
            'rabbit', 
            'sunflower'
        ];
        
        console.log('Starting cooking game with customers:', mockCustomerTypes);
        this.cookingController.startGame(mockCustomerTypes);
    }
}