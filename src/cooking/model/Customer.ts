import { CookingGameConfig } from '../config/CookingGameConfig';
import { Label } from './Label';

export class Customer {
  type: string;
  patience: number;
  correctLabel: Label;

  constructor(type: string, correctLabel: Label) {
    this.type = type;
    this.patience = CookingGameConfig.INITIAL_PATIENCE;
    this.correctLabel = correctLabel;
  }

  /**
   * Updates the customer's patience based on elapsed time
   * @param deltaTime - Time elapsed in seconds
   */
  updatePatience(deltaTime: number): void {
    this.patience -= CookingGameConfig.PATIENCE_DECREASE_RATE * deltaTime;
    if (this.patience < 0) {
      this.patience = 0;
    }
  }

  isImpatient(): boolean {
    return this.patience <= 0;
  }
}
