import { describe, it, expect, beforeEach } from 'vitest';
import { CookingModel } from 'src/cooking/model/CookingModel';
import { Species } from 'src/common/types/Species';
import { CustomerFactory } from 'src/cooking/model/CustomerFactory';
import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';

describe('CookingModel', () => {
	let model: CookingModel;
	beforeEach(() => {
		model = new CookingModel();
	});

	it('should initialize correctly with given customer types', () => {
		const customerTypes = [Species.RABBIT, Species.SUNFLOWER, Species.MUSHROOM];
		model.initialize(customerTypes);

		const customerData = model.getCustomerData();
		if (CookingGameConfig.MAX_ACTIVE_CUSTOMERS <= CookingGameConfig.NUM_CUSTOMERS) {
			expect(customerData.length).toBe(CookingGameConfig.MAX_ACTIVE_CUSTOMERS);
		} else {
			expect(customerData.length).toBe(CookingGameConfig.NUM_CUSTOMERS);
		}
		customerData.forEach((data) => {
			expect(customerTypes).toContain(data.customerType);
			expect(data.patience).toBe(CookingGameConfig.INITIAL_PATIENCE);
		});
		const ids = customerData.map((data) => data.customerId);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);

		const label = model.getLabel();
		expect(label).toBeDefined();

		const score = model.getScore();
		expect(score).toBe(0);

		const progress = model.getProgress();
		expect(progress.correct).toBe(0);
		expect(progress.incorrect).toBe(0);
		expect(progress.total).toBe(CookingGameConfig.NUM_CUSTOMERS);
	});

	it('should update patience of active customers', () => {
		const customerTypes = [Species.RABBIT, Species.SUNFLOWER];
		model.initialize(customerTypes);

		const deltaTime =
			CookingGameConfig.INITIAL_PATIENCE / CookingGameConfig.PATIENCE_DECREASE_RATE / 2; // half the time to deplete patience
		model.updatePatience(deltaTime);

		const customerData = model.getCustomerData();
		customerData.forEach((data) => {
			expect(data.patience).toBeCloseTo(CookingGameConfig.INITIAL_PATIENCE / 2);
		});
	});

	it('should fill active customers from the queue when some become impatient', () => {
		const customerTypes = [Species.RABBIT, Species.SUNFLOWER];
		model.initialize(customerTypes);

		// Get initial active customers's IDs
		const initialCustomerData = model.getCustomerData();
		const initialCustomerIds = initialCustomerData.map((data) => data.customerId);

		// Fast forward time to make all current active customers impatient
		const deltaTime =
			CookingGameConfig.INITIAL_PATIENCE / CookingGameConfig.PATIENCE_DECREASE_RATE + 1; // 1 millisecond more than needed to deplete
		model.updatePatience(deltaTime);

		// Ensure the number of active customers after update is correct
		const customerData = model.getCustomerData();
		if (
			CookingGameConfig.MAX_ACTIVE_CUSTOMERS <=
			CookingGameConfig.NUM_CUSTOMERS - initialCustomerData.length
		) {
			expect(customerData.length).toBe(CookingGameConfig.MAX_ACTIVE_CUSTOMERS);
		} else {
			expect(customerData.length).toBe(
				CookingGameConfig.NUM_CUSTOMERS - initialCustomerData.length,
			);
		}

		// Ensure all active customers have full patience, ID not in initialCustomerIds, and correct type
		customerData.forEach((data) => {
			expect(data.patience).toBe(CookingGameConfig.INITIAL_PATIENCE);
			expect(initialCustomerIds).not.toContain(data.customerId);
			expect(customerTypes).toContain(data.customerType);
		});

		// Ensure no duplicate IDs among active customers
		const ids = customerData.map((data) => data.customerId);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should correctly report game over state due to all customers becoming impatient', () => {
		const customerTypes = [Species.RABBIT];
		model.initialize(customerTypes);

		// Initially, game should not be over
		expect(model.isGameOver()).toBe(false);

		// Fast forward time to make all customers impatient
		const totalCustomers = CookingGameConfig.NUM_CUSTOMERS;
		for (let i = 0; i < totalCustomers; i++) {
			// at most NUM_CUSTOMERS iterations needed
			const deltaTime =
				CookingGameConfig.INITIAL_PATIENCE / CookingGameConfig.PATIENCE_DECREASE_RATE + 1; // 1 millisecond more than needed to deplete
			model.updatePatience(deltaTime);
		}

		// Now, game should be over
		expect(model.isGameOver()).toBe(true);
	});

	it('should correctly report game over state due to all customers being served', () => {
		const customerTypes = [Species.RABBIT, Species.SUNFLOWER, Species.MUSHROOM];
		model.initialize(customerTypes);

		// Serve the current label to the first active customer until all customers are served
		const totalCustomers = CookingGameConfig.NUM_CUSTOMERS;
		for (let i = 0; i < totalCustomers; i++) {
			expect(model.isGameOver()).toBe(false);
			const customerData = model.getCustomerData();
			const targetCustomerId = customerData[0].customerId;
			model.handleAssignment(targetCustomerId);
		}

		// Now, game should be over
		expect(model.isGameOver()).toBe(true);
	});

	it('should correctly report game over state when all customers are either served or impatient', () => {
		const customerTypes = [Species.RABBIT, Species.SUNFLOWER, Species.MUSHROOM];
		model.initialize(customerTypes);

		// Serve half the customers
		const totalCustomers = CookingGameConfig.NUM_CUSTOMERS;
		const customersToServe = Math.floor(totalCustomers / 2);
		for (let i = 0; i < customersToServe; i++) {
			expect(model.isGameOver()).toBe(false);
			const customerData = model.getCustomerData();
			const targetCustomerId = customerData[0].customerId;
			model.handleAssignment(targetCustomerId);
		}

		// Make remaining customers impatient
		const remainingCustomers = totalCustomers - customersToServe;
		for (let i = 0; i < remainingCustomers; i++) {
			// at most remainingCustomers iterations needed
			const deltaTime =
				CookingGameConfig.INITIAL_PATIENCE / CookingGameConfig.PATIENCE_DECREASE_RATE + 1; // 1 millisecond more than needed to deplete
			model.updatePatience(deltaTime);
		}

		// Now, game should be over
		expect(model.isGameOver()).toBe(true);
	});

	it('should handle assignment correctly, update score and progress, and refill customers when possible', () => {
		const customerTypes = [Species.RABBIT, Species.SUNFLOWER, Species.MUSHROOM];
		model.initialize(customerTypes);

		var correct_label_count = 0;
		var incorrect_label_count = 0;
		for (let i = 0; i < CookingGameConfig.NUM_CUSTOMERS; i++) {
			// run for total number of customers, ensuring active customers are refilled
			const customerData = model.getCustomerData();
			const targetCustomerId = customerData[0].customerId;
			const targetLabelType = CustomerFactory.getLabelTypeForCustomer(
				customerData[0].customerType,
			);
			if (targetLabelType === model.getLabel()) {
				correct_label_count++;
			} else {
				incorrect_label_count++;
			}
			model.handleAssignment(targetCustomerId);
		}

		expect(model.getCustomerData().length).toBe(0);

		const score = model.getScore();
		expect(score).toBe(correct_label_count * 10);

		const progress = model.getProgress();
		expect(progress.correct).toBe(correct_label_count);
		expect(progress.incorrect).toBe(incorrect_label_count);
		expect(progress.total).toBe(CookingGameConfig.NUM_CUSTOMERS);

		expect(model.isGameOver()).toBe(true);
	});

	it('should handle label discard correctly', () => {
		const customerTypes = [Species.RABBIT];
		model.initialize(customerTypes);
		model.discardLabel();
		expect(model.getLabel()).toBeDefined();
	});
});
