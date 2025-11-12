import { describe, it, expect, beforeEach } from 'vitest';
import { Customer } from 'src/cooking/model/Customer';
import { Label } from 'src/cooking/model/Label';
import { Species } from 'src/common/types/Species';
import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';

describe('Customer', () => {
	let customer: Customer;
	let label: Label;

	beforeEach(() => {
		label = Label.getLabel('consumer');
		customer = new Customer(Species.RABBIT, label);
	});

	it('initializes with correct type, label and patience', () => {
		expect(customer.type).toBe(Species.RABBIT);
		expect(customer.correctLabel).toBe(label);
		expect(customer.patience).toBe(CookingGameConfig.INITIAL_PATIENCE);
	});

	it('decreases patience based on deltaTime', () => {
		const initialPatience = customer.patience;
		const deltaTime = initialPatience / CookingGameConfig.PATIENCE_DECREASE_RATE / 2; // half the time to deplete patience

		customer.updatePatience(deltaTime);

		expect(customer.patience).toBeCloseTo(initialPatience / 2);
	});

	it('patience goes to zero when updated with full deltaTime', () => {
		const initialPatience = customer.patience;
		const deltaTime = initialPatience / CookingGameConfig.PATIENCE_DECREASE_RATE;
		customer.updatePatience(deltaTime);

		expect(customer.patience).toBe(0);
	});

	it('patience does not go below zero', () => {
		const initialPatience = customer.patience;
		const deltaTime = initialPatience / CookingGameConfig.PATIENCE_DECREASE_RATE + 1; // 1 second more than needed to deplete
		customer.updatePatience(deltaTime);

		expect(customer.patience).toBe(0);
	});

	it('isImpatient returns false when patience is above zero', () => {
		expect(customer.isImpatient()).toBe(false);
	});

	it('isImpatient returns true when patience reaches zero', () => {
		customer.patience = 0;
		expect(customer.isImpatient()).toBe(true);
	});
});
