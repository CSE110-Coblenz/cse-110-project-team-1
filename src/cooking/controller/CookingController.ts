import { CookingModel } from 'src/cooking/model/CookingModel';
import { CookingView } from 'src/cooking/view/CookingView';
import { Species } from 'src/common/types/Species';
import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';

export default class CookingController {
	private model: CookingModel;
	private view: CookingView;
	private lastUpdateTime: number = Date.now();
	private gameLoopInterval: number | null = null;
	private onGameComplete?: () => void;

	constructor() {
		this.model = new CookingModel();
		this.view = new CookingView();
	}

	/**
	 * Starts the cooking game with the given customer types that's passed from the main game
	 * @param customerTypes - Array of customer species from main game
	 * @param onComplete - Optional callback to run when the game is over
	 */
	public startGame(customerTypes: Species[], onComplete?: () => void): void {
		this.onGameComplete = onComplete;
		// Clear any existing game loop
		if (this.gameLoopInterval !== null) {
			this.stopGame();
		}
		// Initialize model and view
		this.model.initialize(customerTypes);
		this.view.initialize(
			this.model.getCustomerData(),
			this.model.getLabel(),
			this.model.getScore(),
			this.model.getProgress(), // pass initial progress so initialize handles it
		);
		// Wire view drop handler directly to controller method
		this.view.setDropHandler((dropTarget: 'customer' | 'trashcan', customerId?: string) =>
			this.handleDrop(dropTarget, customerId),
		);
		// Progress already initialized via view.initialize
		// Game loop
		this.lastUpdateTime = Date.now();
		this.gameLoopInterval = setInterval(() => {
			this.update(this.getDeltaTime());
			if (this.model.isGameOver()) {
				this.stopGame();
			}
		}, CookingGameConfig.FRAME_TIME);
	}

	private update(deltaTime: number): void {
		// Update model state
		// Convert milliseconds to seconds for model/customer update logic
		this.model.updatePatience(deltaTime / 1000);

		// Get updated data from model
		const customerData = this.model.getCustomerData();
		const currentLabel = this.model.getLabel();
		const score = this.model.getScore();
		const progress = this.model.getProgress();

		// Update view with new data
		this.view.updateCustomers(customerData);
		this.view.updateLabel(currentLabel);
		this.view.updateScore(score);
		this.view.updateProgress(progress.correct, progress.incorrect, progress.total);

		// Update last update time
		this.lastUpdateTime = Date.now();
	}

	public stopGame(): void {
		if (this.gameLoopInterval !== null) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}

		// Pass the completion callback to showGameOver so it's called when user clicks close
		this.view.showGameOver(this.model.getScore(), this.onGameComplete);
		this.onGameComplete = undefined;
	}

	public handleDrop(dropTarget: 'customer' | 'trashcan', customerId?: string): void {
		if (dropTarget === 'customer') {
			if (!customerId) {
				console.error('Customer ID is required when dropping on a customer');
				return;
			}
			this.model.handleAssignment(customerId);
		} else if (dropTarget === 'trashcan') {
			this.model.discardLabel();
		}

		// Immediately reflect changes in the view to avoid perceived lag/mismatch
		const customerData = this.model.getCustomerData();
		const currentLabel = this.model.getLabel();
		const score = this.model.getScore();
		const progress = this.model.getProgress();
		this.view.updateCustomers(customerData);
		this.view.updateLabel(currentLabel);
		this.view.updateScore(score);
		this.view.updateProgress(progress.correct, progress.incorrect, progress.total);
	}

	private getDeltaTime(): number {
		return Date.now() - this.lastUpdateTime; // in milliseconds
	}

	// temporary test method to simulate drop events, made it in ms so that it actually shows in testing
	private testDropEvent(): void {
		const fullPatienceTime =
			(CookingGameConfig.INITIAL_PATIENCE / CookingGameConfig.PATIENCE_DECREASE_RATE) * 1000;

		setTimeout(() => {
			const customerData = this.model.getCustomerData();
			const firstCustomerID = customerData[0].customerId;
			this.handleDrop('customer', firstCustomerID);
		}, fullPatienceTime * 0.5);

		setTimeout(() => {
			this.handleDrop('trashcan');
		}, fullPatienceTime);

		setTimeout(() => {
			this.handleDrop('trashcan');
		}, fullPatienceTime * 1.5);
	}

	/**
	 * Temporary test method to verify setup is working and display model data
	 */
	// private showTestMessage(customerTypes: Species[]): void {
	// 	const container = document.getElementById('container');
	// 	if (container) {
	// 		const customerData = this.model.getCustomerData();
	// 		const currentLabel = this.model.getLabel();
	// 		const score = this.model.getScore();

	// 		// Prepend test info (view placeholder is already added by initialize)
	// 		const testDiv = document.createElement('div');
	// 		testDiv.style.cssText = 'padding: 20px; font-family: Arial;';
	// 		testDiv.innerHTML = `
	//             <h1>Cooking Game - Model Initialization Test</h1>
	//             <p>MockGameCoordinator successfully started CookingController</p>

	//             <h3>Customer Types Received:</h3>
	//             <ul>
	//                 ${customerTypes.map((type) => `<li>${type}</li>`).join('')}
	//             </ul>

	//             <hr>

	//             <h3>Model Data:</h3>
	//             <p><strong>Current Label:</strong> ${currentLabel}</p>
	//             <p><strong>Score:</strong> ${score}</p>

	//             <h3>Active Customers:</h3>
	//             <ul>
	//                 ${customerData
	// 					.map(
	// 						(customer) => `
	//                     <li>
	//                         <strong>ID:</strong> ${customer.customerId} |
	//                         <strong>Type:</strong> ${customer.customerType} |
	//                         <strong>Patience:</strong> ${customer.patience}
	//                     </li>
	//                 `,
	// 					)
	// 					.join('')}
	//             </ul>

	//             <p style="margin-top: 20px; color: green;">✓ Model initialization successful!</p>
	//         `;
	// 		container.prepend(testDiv);
	// 	}

	// 	// Test view methods with delays so we can see each change
	// 	console.log('\n=== Testing View Methods ===');

	// 	setTimeout(() => {
	// 		console.log('Test 1: updateScore(100)');
	// 		this.view.updateScore(100);
	// 	}, 1000);

	// 	// Progress test events
	// 	setTimeout(() => {
	// 		console.log('Test 1a: handleAssignment() - correct assignment');
	// 		const customerData = this.model.getCustomerData();
	// 		// Simpler: assume first customer exists and has correctLabel
	// 		const firstCustomer = this.model['activeCustomers'][0];
	// 		if (customerData.length > 0 && firstCustomer && firstCustomer.correctLabel) {
	// 			this.handleAssignment(customerData[0].customerId, firstCustomer.correctLabel.type);
	// 		}
	// 	}, 1200);

	// 	setTimeout(() => {
	// 		if (this.model.getLabel() !== 'consumer') {
	// 			console.log('Test 2: updateLabel("consumer")');
	// 			this.view.updateLabel('consumer');
	// 		} else {
	// 			console.log('Test 2: updateLabel("producer")');
	// 			this.view.updateLabel('producer');
	// 		}
	// 	}, 2000);

	// 	setTimeout(() => {
	// 		console.log('Test 2a: handleAssignment() - correct assignment');
	// 		const customerData = this.model.getCustomerData();
	// 		const firstCustomer = this.model['activeCustomers'][0];
	// 		if (customerData.length > 0 && firstCustomer && firstCustomer.correctLabel) {
	// 			this.handleAssignment(customerData[0].customerId, firstCustomer.correctLabel.type);
	// 		}
	// 	}, 2200);

	// 	setTimeout(() => {
	// 		console.log('Test 3: updateCustomers() with modified patience');
	// 		// Modify customer data to show the update is working
	// 		const customers = this.model.getCustomerData();
	// 		const modifiedCustomers = []; //not actually modifying model data, just for view test
	// 		for (let i = 0; i < customers.length; i++) {
	// 			modifiedCustomers.push({
	// 				customerId: customers[i].customerId,
	// 				customerType: customers[i].customerType,
	// 				patience: customers[i].patience - 50, // Reduce patience by 50%
	// 			});
	// 		}
	// 		this.view.updateCustomers(modifiedCustomers);
	// 	}, 3000);

	// 	setTimeout(() => {
	// 		console.log('Test 3a: handleAssignment() - correct assignment');
	// 		const customerData = this.model.getCustomerData();
	// 		const firstCustomer = this.model['activeCustomers'][0];
	// 		if (customerData.length > 0 && firstCustomer && firstCustomer.correctLabel) {
	// 			this.handleAssignment(customerData[0].customerId, firstCustomer.correctLabel.type);
	// 		}
	// 	}, 3500);

	// 	setTimeout(() => {
	// 		console.log('Test 3b: handleAssignment() - incorrect assignment');
	// 		const customerData = this.model.getCustomerData();
	// 		if (customerData.length > 0) {
	// 			this.handleAssignment(customerData[0].customerId, 'wrongLabel');
	// 		}
	// 	}, 3700);

	// 	setTimeout(() => {
	// 		console.log('Test 4: showGameOver(250)');
	// 		this.view.showGameOver(250);
	// 	}, 4000);

	// 	// Don't call clear() so the view stays visible (can uncomment to see wipe)
	// 	// setTimeout(() => {
	// 	//     console.log('Test 5: clear()');
	// 	//     this.view.clear();
	// 	// }, 5000);

	// 	console.log('=== View Method Tests Scheduled ===\n');
	// }

	// /**
	//  * Handles a label assignment to a customer.
	//  * Controller simply passes the data to Model for validation and processing,
	//  * then updates the View with the results.
	//  * @param customerId - The ID of the customer receiving the label
	//  * @param labelType - The type of label being assigned
	//  */
	// private handleAssignment(customerId: string, labelType: string): void {
	// 	const result = this.model.handleAssignment(customerId, labelType);
	// 	this.view.updateProgress(result.correct, result.incorrect, result.total);
	// 	this.view.updateScore(this.model.getScore());

	// 	// Optional: Provide feedback about whether assignment was correct
	// 	if (result.wasCorrect) {
	// 		console.log('Correct assignment!');
	// 	} else {
	// 		console.log('Incorrect assignment!');
	// 	}
	// }
}
