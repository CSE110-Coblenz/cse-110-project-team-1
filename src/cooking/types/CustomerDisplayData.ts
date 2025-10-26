/**
 * Data structure for displaying a customer in the view
 */
export interface CustomerDisplayData {
    // there are 3 positions in the counter that can be occupied by customers
    // positions are 0-indexed (0, 1, 2)
    position: number;
    
    // A unique identifier assigned to each customer by the cooking game
    customerId: string;
    
    // type of the customer
    customerType: string;
    
    // patience level percentage (0 - 100)
    patience: number;
}
