import { Customer } from '../model/Customer';
import { Label, LabelType } from '../model/Label';

export class CustomerFactory {
  private static readonly customerToLabelMap: Record<string, LabelType> = {
    // Define your customer type to label mappings here
    // Example:
    'mushroom': 'decomposer',
    'rabbit': 'consumer',
    'sunflower': 'producer',
  };

  static createCustomer(customerType: string): Customer {
    const labelType = this.customerToLabelMap[customerType];
    if (!labelType) {
      throw new Error(`Unknown customer type: ${customerType}`);
    }
    const label = Label.getLabel(labelType);
    return new Customer(customerType, label);
  }
}
