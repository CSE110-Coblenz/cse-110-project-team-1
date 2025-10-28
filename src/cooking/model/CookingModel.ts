import { Customer } from './Customer';
import { Label } from './Label';
import { CustomerFactory } from './CustomerFactory';
import { DeckLogic } from './DeckLogic';
import { CookingGameConfig } from '../config/CookingGameConfig';
import { CustomerDisplayData } from '../types/CustomerDisplayData';

export class CookingModel {
    private customerQueue: Customer[] = [];
    private activeCustomers: Customer[] = [];
    private customerIdMap: Map<Customer, string> = new Map();
    private currentLabel: Label | null = null;
    private score: number = 0;
    private customersServed: number = 0;

    constructor() {
        // Empty constructor - actual initialization happens in initialize()
    }

    initialize(customerTypes: string[]) {
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
        this.customersServed = 0;
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
        return this.activeCustomers.map(customer => {
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
}