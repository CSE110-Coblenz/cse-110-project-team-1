import { CookingModel } from '../model/CookingModel';
import { CookingView } from '../view/CookingView';

export default class CookingController {
    private model: CookingModel;
    private view: CookingView;

    constructor() {
        this.model = new CookingModel();
        this.view = new CookingView();
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
        this.model.initialize(customerTypes);
        this.view.initialize(this.model.getCustomerData(), this.model.getLabel(), this.model.getScore());
        // TODO: Game loop
        
        // For now, just show we're working
        this.showTestMessage(customerTypes);
    }

    /**
     * Temporary test method to verify setup is working and display model data
     */
    private showTestMessage(customerTypes: string[]): void {
        const container = document.getElementById('container');
        if (container) {
            const customerData = this.model.getCustomerData();
            const currentLabel = this.model.getLabel();
            const score = this.model.getScore();

            container.innerHTML = `
                <div style="padding: 20px; font-family: Arial;">
                    <h1>Cooking Game - Model Initialization Test</h1>
                    <p>MockGameCoordinator successfully started CookingController</p>

                    <h3>Customer Types Received:</h3>
                    <ul>
                        ${customerTypes.map(type => `<li>${type}</li>`).join('')}
                    </ul>

                    <hr>

                    <h3>Model Data:</h3>
                    <p><strong>Current Label:</strong> ${currentLabel}</p>
                    <p><strong>Score:</strong> ${score}</p>

                    <h3>Active Customers:</h3>
                    <ul>
                        ${customerData.map(customer => `
                            <li>
                                <strong>ID:</strong> ${customer.customerId} |
                                <strong>Type:</strong> ${customer.customerType} |
                                <strong>Patience:</strong> ${customer.patience}
                            </li>
                        `).join('')}
                    </ul>

                    <p style="margin-top: 20px; color: green;">✓ Model initialization successful!</p>
                </div>
            `;
        }
    }

    // Potential Additional Methods: 
    // 1) a drag-and-drop event handler, 
    // 2) an update method that will be called by the game loop and also
    // the drag-and-drop event handler.
}