import { CookingModel } from '../model/CookingModel';
import { Label } from '../model/Label';
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
    // Initialize progress bar in the view
    const progressInit = this.model.getProgress();
    this.view.updateProgress(progressInit.correct, progressInit.total);
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

            // Prepend test info (view placeholder is already added by initialize)
            const testDiv = document.createElement('div');
            testDiv.style.cssText = 'padding: 20px; font-family: Arial;';
            testDiv.innerHTML = `
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
            `;
            container.prepend(testDiv);
        }

        // Test view methods with delays so we can see each change
        console.log('\n=== Testing View Methods ===');
        
        setTimeout(() => {
            console.log('Test 1: updateScore(100)');
            this.view.updateScore(100);
        }, 1000);
        
        // Progress test events
        setTimeout(() => {
            console.log('Test 1a: handleCorrectAssignment()');
            this.handleCorrectAssignment();
        }, 1200);

        setTimeout(() => {
            if (this.model.getLabel() !== 'consumer') {
                console.log('Test 2: updateLabel("consumer")');
                this.view.updateLabel('consumer');
            }
            else
            {
                console.log('Test 2: updateLabel("producer")');
                this.view.updateLabel('producer');
            }
        }, 2000);
        
        setTimeout(() => {
            console.log('Test 2a: handleCorrectAssignment()');
            this.handleCorrectAssignment();
        }, 2200);

        setTimeout(() => {
            console.log('Test 3: updateCustomers() with modified patience');
            // Modify customer data to show the update is working
            const customers = this.model.getCustomerData();
            const modifiedCustomers = []; //not actually modifying model data, just for view test
            for (let i = 0; i < customers.length; i++) {
                modifiedCustomers.push({
                    customerId: customers[i].customerId,
                    customerType: customers[i].customerType,
                    patience: customers[i].patience - 50  // Reduce patience by 50%
                });
            }
            this.view.updateCustomers(modifiedCustomers);
        }, 3000);
        
        setTimeout(() => {
            console.log('Test 3a: handleCorrectAssignment()');
            this.handleCorrectAssignment();
        }, 3500);

        setTimeout(() => {
            console.log('Test 4: showGameOver(250)');
            this.view.showGameOver(250);
        }, 4000);
        
        // Don't call clear() so the view stays visible (can uncomment to see wipe)
        // setTimeout(() => {
        //     console.log('Test 5: clear()');
        //     this.view.clear();
        // }, 5000);
        
        console.log('=== View Method Tests Scheduled ===\n');
    }

    /**
     * Called when the player correctly assigns a label.
     * Updates model progress and refreshes view progress bar and score.
     */
    private handleCorrectAssignment(): void {
        const progress = this.model.serveCustomerCorrect();
        this.view.updateProgress(progress.correct, progress.total);
        this.view.updateScore(this.model.getScore());
    }

    // Potential Additional Methods: 
    // 1) a drag-and-drop event handler, 
    // 2) an update method that will be called by the game loop and also
    // the drag-and-drop event handler.
}