import { CustomerDisplayData } from "../types/CustomerDisplayData";

export class CookingView {
    constructor() {
        console.log('CookingView created');
    }

    /**
     * Initialize the view with game data
     */
    initialize(customerData: CustomerDisplayData[], label: string, score: number): void {
        console.log('CookingView.initialize called');
        console.log('Customer data:', customerData);
        console.log('Current label:', label);
        console.log('Score:', score);
        
        // Get the container element
        const container = document.getElementById('container');
        
        if (container) {
            //basic placeholder structure
            container.innerHTML += `
                <div id="view-placeholder" style="border: 2px solid blue; padding: 10px; margin-top: 20px;">
                    <h2>View Component Placeholder</h2>
                    <div id="score-display">Score: <span id="score-value">0</span></div>
                    <div id="label-display">Label: <span id="label-value">none</span></div>
                    <div id="customers-display">Customers: <span id="customers-value">[]</span></div>
                    <div id="game-status"></div>
                </div>
            `;
            
            //Update initial data
            this.updateScore(score);
            this.updateLabel(label);
            this.updateCustomers(customerData);
        }
    }

    /**
     * Updates the score display
     */
    updateScore(score: number): void {
        console.log('Updating score:', score);
        
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = score.toString();
        }
    }

    /**
     * Updates the current label display
     */
    updateLabel(label: string): void {
        console.log('Updating label:', label);
        
        const labelElement = document.getElementById('label-value');
        if (labelElement) {
            labelElement.textContent = label;
        }
    }

    /**
     * Updates the customer display with current customer data
     */
    updateCustomers(customerData: CustomerDisplayData[]): void {
        console.log('Updating customers:', customerData);
        
        const customersElement = document.getElementById('customers-value');
        if (customersElement) {
            // Simple display of customer count and types
            let customerSummary = '';
            for (let i = 0; i < customerData.length; i++) {
                customerSummary += customerData[i].customerType + '(' + customerData[i].patience + '%)';
                if (i < customerData.length - 1) {
                    customerSummary += ', ';
                }
            }
            customersElement.textContent = customerSummary || 'none';
        }
    }

    /**
     * Displays a game over message
     */
    showGameOver(finalScore: number): void {
        console.log('Game over! Final score:', finalScore);
        
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.innerHTML = `<strong style="color: red;">GAME OVER! Final Score: ${finalScore}</strong>`;
        }
    }

    /**
     * Clears the view
     */
    clear(): void {
        console.log('Clearing view');
        
        const placeholder = document.getElementById('view-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }
}