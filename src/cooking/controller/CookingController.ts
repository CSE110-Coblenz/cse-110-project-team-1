export default class CookingController {
    constructor() {
        console.log('CookingController created');
    }

    /**
     * Starts the cooking game with the given customer types that's passed from the main game
     * @param customerTypes - Array of customer type IDs from main game (we assume it's a list of string for now)
     */
    startGame(customerTypes: string[]): void {
        console.log('CookingController.startGame called');
        console.log('Customer types:', customerTypes);
        
        // TODO: Initialize model and view
        // TODO: Game loop
        
        // For now, just show we're working
        this.showTestMessage(customerTypes);
    }

    /**
     * Temporary test method to verify setup is working
     */
    private showTestMessage(customerTypes: string[]): void {
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; font-family: Arial;">
                    <h1>Cooking Game Setup Working!</h1>
                    <p>MockGameCoordinator successfully started CookingController</p>
                    <h3>Customer Types Received:</h3>
                    <ul>
                        ${customerTypes.map(type => `<li>${type}</li>`).join('')}
                    </ul>
                    <p>Ready to implement game logic!</p>
                </div>
            `;
        }
    }

    // Potential Additional Methods: 
    // 1) a drag-and-drop event handler, 
    // 2) an update method that will be called by the game loop and also
    // the drag-and-drop event handler.
}