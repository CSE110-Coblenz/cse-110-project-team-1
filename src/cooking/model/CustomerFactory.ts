import { Customer } from 'src/cooking/model/Customer';
import { Label, LabelType } from 'src/cooking/model/Label';
import { Species, ALL_SPECIES } from 'src/common/types/Species';

export class CustomerFactory {
	// TEMP Map all Species to a label type so the cooking minigame can accept any species.
	// Default mapping:
	//  - producers map to 'producer' label
	//  - mushroom maps to 'decomposer'
	//  - all other species map to 'consumer'
	private static readonly customerToLabelMap: Partial<Record<Species, LabelType>> = ((): Partial<
		Record<Species, LabelType>
	> => {
		const map: Partial<Record<Species, LabelType>> = {};
		// Producers
		map[Species.GRASS] = 'producer';
		map[Species.SUNFLOWER] = 'producer';
		map[Species.BERRY_BUSH] = 'producer';
		// MUSHROOM is a decomposer (treated specially)
		map[Species.MUSHROOM] = 'decomposer';
		// All other species considered consumers in this activity
		for (const s of ALL_SPECIES as Species[]) {
			if (map[s]) continue; // skip if already assigned
			map[s] = 'consumer';
		}
		return map;
	})();

	static createCustomer(customerType: Species): Customer {
		const labelType = this.customerToLabelMap[customerType];
		if (!labelType) {
			throw new Error(`Unknown customer type: ${customerType}`);
		}
		const label = Label.getLabel(labelType);
		return new Customer(customerType, label);
	}

	static getLabelTypeForCustomer(customerType: Species): LabelType {
		const labelType = this.customerToLabelMap[customerType];
		if (!labelType) {
			throw new Error(`Unknown customer type: ${customerType}`);
		}
		return labelType;
	}
}
