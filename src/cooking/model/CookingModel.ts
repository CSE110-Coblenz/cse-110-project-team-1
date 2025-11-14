import { Customer } from 'src/cooking/model/Customer';
import { Label } from 'src/cooking/model/Label';
import { CustomerFactory } from 'src/cooking/model/CustomerFactory';
import { DeckLogic } from 'src/cooking/model/DeckLogic';
import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';
import { CustomerDisplayData } from 'src/cooking/types/CustomerDisplayData';
import { Species } from 'src/common/types/Species';

export class CookingModel {
	private customerQueue: Customer[] = [];
	private activeCustomers: Customer[] = [];
	private customerIdMap: Map<Customer, string> = new Map();
	private currentLabel: Label | null = null;
	private score: number = 0;
	private customersCorrect: number = 0;
	private customersIncorrect: number = 0;

	constructor() {
		// Empty constructor - actual initialization happens in initialize()
	}

	initialize(customerTypes: Species[]) {
		// Initialize all customers based on the config
		// Randomly select NUM_CUSTOMERS from the provided customerTypes
		this.customerQueue = [];
		this.customerIdMap.clear();

		for (let i = 0; i < CookingGameConfig.NUM_CUSTOMERS; i++) {
			const randomIndex = Math.floor(Math.random() * customerTypes.length);
			const customerType = customerTypes[randomIndex];
			const customer = CustomerFactory.createCustomer(customerType);
			this.customerQueue.push(customer);
			this.customerIdMap.set(customer, `customer${i}`);
		}

		// Initialize active customers with up to MAX_ACTIVE_CUSTOMERS
		this.activeCustomers = [];
		this.fillActiveCustomers();

		// Generate the first random label
		this.currentLabel = DeckLogic.generateRandomLabel();

		// Reset score and customers served
		this.score = 0;
		this.customersCorrect = 0;
		this.customersIncorrect = 0;
	}

	/**
	 * Fills active customers up to MAX_ACTIVE_CUSTOMERS from the queue
	 */
	private fillActiveCustomers(): void {
		while (
			this.activeCustomers.length < CookingGameConfig.MAX_ACTIVE_CUSTOMERS &&
			this.customerQueue.length > 0
		) {
			const nextCustomer = this.customerQueue.shift();
			if (nextCustomer) {
				this.activeCustomers.push(nextCustomer);
			}
		}
	}

	/**
	 * Returns display data for all active customers
	 * Converts Customer model objects to CustomerDisplayData format for the view
	 * @returns Array of CustomerDisplayData containing customer ID, type, and current patience level
	 * @throws Error if a customer is missing from the ID map (indicates programming error)
	 */
	getCustomerData(): CustomerDisplayData[] {
		return this.activeCustomers.map((customer) => {
			const customerId = this.customerIdMap.get(customer);
			if (!customerId) {
				throw new Error('Customer ID not found in map');
			}
			return {
				customerId,
				customerType: customer.type,
				patience: customer.patience,
			};
		});
	}

	/**
	 * Returns the current label (top of the deck) for display
	 * @returns The label type string (e.g., "producer")
	 * @throws Error if called before initialize() (no current label exists)
	 */
	getLabel(): string {
		if (!this.currentLabel) {
			throw new Error('No current label available - initialize() must be called first');
		}
		return this.currentLabel.type;
	}

	getScore() {
		// Return score data for the view
		return this.score;
	}

	/**
	 * Returns current progress towards total correct assignments
	 * correct = customersServed, total = configured NUM_CUSTOMERS
	 */
	getProgress(): { correct: number; incorrect: number; total: number } {
		return {
			correct: this.customersCorrect,
			incorrect: this.customersIncorrect,
			total: CookingGameConfig.NUM_CUSTOMERS,
		};
	}

	/**
	 * Handles a label assignment to a customer.
	 * Validates if the assignment is correct and updates state accordingly.
	 * @param customerId - The ID of the customer receiving the label
	 * @param labelType - The type of label being assigned
	 * @returns Object with updated progress and whether assignment was correct
	 */
	handleAssignment(customerId: string): void {
		// Check if label exists
		if (!this.currentLabel) {
			throw new Error('No current label available - initialize() must be called first');
		}

		// Find the customer by ID
		let targetCustomer: Customer | null = null;
		for (const customer of this.activeCustomers) {
			const id = this.customerIdMap.get(customer);
			if (id === customerId) {
				targetCustomer = customer;
				break;
			}
		}
		if (!targetCustomer) {
			throw new Error(`Customer with ID ${customerId} not found among active customers`);
		}

		// Check if the assignment is correct, and update state
		const isCorrect = targetCustomer.isCorrectLabel(this.currentLabel.type);
		if (isCorrect) {
			this.customersCorrect += 1;
			this.score += 10;
		} else {
			this.customersIncorrect += 1;
		}
		const index = this.activeCustomers.indexOf(targetCustomer);
		this.activeCustomers.splice(index, 1);
		this.fillActiveCustomers();
		this.currentLabel = DeckLogic.generateRandomLabel();
	}

	/**
	 * Handle discarding the current label and generating a new one.
	 */
	public discardLabel(): void {
		this.currentLabel = DeckLogic.generateRandomLabel();
	}

	/**
	 * Updates the model state, including customer patience.
	 * Should be called every frame with the elapsed time since last update.
	 * @param deltaTime - Time elapsed in milliseconds since last update
	 */
	public updatePatience(deltaTime: number): void {
		// Iterate backwards to safely remove items
		for (let i = this.activeCustomers.length - 1; i >= 0; i--) {
			const customer = this.activeCustomers[i];
			customer.updatePatience(deltaTime);
			if (customer.isImpatient()) {
				this.customersIncorrect += 1;
				this.activeCustomers.splice(i, 1);
			}
		}

		this.fillActiveCustomers();
	}

	/**
	 * Checks if the game is over (all customers served)
	 * @returns true if all customers have been served
	 */
	isGameOver(): boolean {
		return this.customersCorrect + this.customersIncorrect >= CookingGameConfig.NUM_CUSTOMERS;
	}
}
