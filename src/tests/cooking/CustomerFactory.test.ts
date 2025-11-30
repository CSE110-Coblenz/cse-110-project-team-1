import { describe, it, expect } from 'vitest';
import { Customer } from 'src/cooking/model/Customer';
import { Label } from 'src/cooking/model/Label';
import { Species } from 'src/common/types/Species';
import { CustomerFactory } from 'src/cooking/model/CustomerFactory';

describe('CustomerFactory', () => {
	it('creates Customer with correct type and label for MUSHROOM', () => {
		const customer: Customer = CustomerFactory.createCustomer(Species.MUSHROOM);
		expect(customer.type).toBe(Species.MUSHROOM);
		expect(customer.correctLabel).toBe(Label.getLabel('decomposer'));
	});
	it('creates Customer with correct type and label for RABBIT', () => {
		const customer: Customer = CustomerFactory.createCustomer(Species.RABBIT);
		expect(customer.type).toBe(Species.RABBIT);
		expect(customer.correctLabel).toBe(Label.getLabel('consumer'));
	});
	it('creates Customer with correct type and label for SUNFLOWER', () => {
		const customer: Customer = CustomerFactory.createCustomer(Species.SUNFLOWER);
		expect(customer.type).toBe(Species.SUNFLOWER);
		expect(customer.correctLabel).toBe(Label.getLabel('producer'));
	});

	it('throws error for unknown customer type', () => {
		expect(() => CustomerFactory.createCustomer(Species.ANT)).toThrow(
			'Unknown customer type: Ant',
		);
	});
});
