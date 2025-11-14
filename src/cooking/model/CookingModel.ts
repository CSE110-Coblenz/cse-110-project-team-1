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
	handleAssignment(
		customerId: string,
		labelType: string,
	): { correct: number; incorrect: number; total: number; wasCorrect: boolean } {
		const total = CookingGameConfig.NUM_CUSTOMERS;
		const totalServed = this.customersCorrect + this.customersIncorrect;

		if (totalServed >= total) {
			return {
				correct: this.customersCorrect,
				incorrect: this.customersIncorrect,
				total,
				wasCorrect: false,
			};
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
			return {
				correct: this.customersCorrect,
				incorrect: this.customersIncorrect,
				total,
				wasCorrect: false,
			};
		}

		// Check if the assignment is correct
		const isCorrect = this.isLabelCorrectForCustomer(targetCustomer, labelType);

		if (isCorrect) {
			this.customersCorrect = this.customersCorrect + 1;
			this.score = this.score + 10;
		} else {
			this.customersIncorrect = this.customersIncorrect + 1;
		}

		return {
			correct: this.customersCorrect,
			incorrect: this.customersIncorrect,
			total,
			wasCorrect: isCorrect,
		};
	}

	/**
	 * Determines if a label is correct for a given customer.
	 * This is where the business logic for correctness lives.
	 * @param customer - The customer to check
	 * @param labelType - The label type being assigned
	 * @returns true if the label matches the customer's type
	 */
	private isLabelCorrectForCustomer(customer: Customer, labelType: string): boolean {
		// label is correct if it matches the customer's correctLabel.type
		return customer.correctLabel.type === labelType;
	}

	/**
	 * Decrease patience for all active customers by deltaSeconds.
	 * This is a simple time step used for visual testing of patience bars.
	 */
	tick(deltaSeconds: number): void {
		if (deltaSeconds <= 0) {
			return;
		}
		for (let i = 0; i < this.activeCustomers.length; i++) {
			this.activeCustomers[i].updatePatience(deltaSeconds);
		}
	}
}
