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

	/**
	 * Generates a random label that differs from the excluded type when possible.
	 * Falls back to any label if only one label exists.
	 * @param excludeType Label type to avoid
	 */
	static generateRandomLabelDifferent(excludeType: string | null): Label {
		// Get all available labels
		const allLabels = Label.getAllLabels();
		// If no exclusion requested or only one label exists, return any random label
		if (!excludeType || allLabels.length <= 1) {
			return this.generateRandomLabel();
		}

		// Try to pick from labels that don't match the excluded type
		const alternatives = allLabels.filter((lbl) => lbl.type !== excludeType);

		// If there is at least one alternative different from the excluded type,
		// use that filtered list; otherwise fall back to the full label list.
		let selectionPool: Label[];
		if (alternatives.length > 0) {
			selectionPool = alternatives;
		} else {
			selectionPool = allLabels;
		}

		// Pick uniformly at random from the selection pool
		const pickIndex = Math.floor(Math.random() * selectionPool.length);
		return selectionPool[pickIndex];
	}
}
