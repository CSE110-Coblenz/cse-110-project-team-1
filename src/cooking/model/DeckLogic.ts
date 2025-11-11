import { Label } from 'src/cooking/model/Label';

export class DeckLogic {
	/**
	 * Generates a random label from the available label types
	 * @returns A randomly selected Label instance
	 */
	static generateRandomLabel(): Label {
		const allLabels = Label.getAllLabels();
		const randomIndex = Math.floor(Math.random() * allLabels.length);
		return allLabels[randomIndex];
	}
}
