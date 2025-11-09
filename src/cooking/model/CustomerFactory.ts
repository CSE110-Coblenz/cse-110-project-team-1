import { Customer } from '../model/Customer';
import { Label, LabelType } from '../model/Label';
import { Species } from '../../common/types/Species';

export class CustomerFactory {
	private static readonly customerToLabelMap: Partial<Record<Species, LabelType>> = {
		// Define your customer type to label mappings here
		[Species.MUSHROOM]: 'decomposer',
		[Species.RABBIT]: 'consumer',
		[Species.SUNFLOWER]: 'producer',
	};

	static createCustomer(customerType: Species): Customer {
		const labelType = this.customerToLabelMap[customerType];
		if (!labelType) {
			throw new Error(`Unknown customer type: ${customerType}`);
		}
		const label = Label.getLabel(labelType);
		return new Customer(customerType, label);
	}
}
