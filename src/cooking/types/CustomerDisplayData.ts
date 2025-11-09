import { Species } from '../../common/types/Species';

/**
 * Data structure for displaying a customer in the view
 */
export interface CustomerDisplayData {
	// A unique identifier assigned to each customer by the cooking game
	// e.g., if we have in total 3 customers, their IDs might be "customer0", "customer1", "customer2"
	customerId: string;

	// species type of the customer, e.g., "mushroom", "rabbit", "sunflower"
	customerType: Species;

	// patience level percentage (0 - 100)
	patience: number;
}
