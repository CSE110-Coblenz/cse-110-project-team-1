import { CookingGameConfig } from 'src/cooking/config/CookingGameConfig';
import { Label } from 'src/cooking/model/Label';
import { Species } from 'src/common/types/Species';

export class Customer {
	type: Species;
	patience: number;
	correctLabel: Label;

	constructor(type: Species, correctLabel: Label) {
		this.type = type;
		this.patience = CookingGameConfig.INITIAL_PATIENCE;
		this.correctLabel = correctLabel;
	}

	/**
	 * Updates the customer's patience based on elapsed time
	 * @param deltaSeconds - Time elapsed in seconds
	 */
	updatePatience(deltaSeconds: number): void {
		this.patience -= CookingGameConfig.PATIENCE_DECREASE_RATE * deltaSeconds;
		if (this.patience < 0) {
			this.patience = 0;
		}
	}

	isImpatient(): boolean {
		return this.patience <= 0;
	}

	public isCorrectLabel(labelType: string): boolean {
		return this.correctLabel.type === labelType;
	}
}
