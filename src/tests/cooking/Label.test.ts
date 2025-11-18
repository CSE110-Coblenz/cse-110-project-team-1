import { describe, it, expect } from 'vitest';
import { Label, LabelType } from 'src/cooking/model/Label';

describe('Label', () => {
	it('returns singleton instances for each label type', () => {
		const producer1 = Label.getLabel('producer');
		const producer2 = Label.getLabel('producer');
		expect(producer1).toBe(producer2); // same instance

		const consumer = Label.getLabel('consumer');
		expect(consumer).not.toBe(producer1);
	});

	it('has correct type property for each label', () => {
		expect(Label.getLabel('producer').type).toBe('producer');
		expect(Label.getLabel('consumer').type).toBe('consumer');
		expect(Label.getLabel('decomposer').type).toBe('decomposer');
	});

	it('throws error for unknown label type', () => {
		expect(() => Label.getLabel('invalid' as LabelType)).toThrow('Unknown label type: invalid');
	});

	it('getAllLabels returns all three label types', () => {
		const allLabels = Label.getAllLabels();
		expect(allLabels).toHaveLength(3);

		const types = allLabels.map((label) => label.type);
		expect(types).toContain('producer');
		expect(types).toContain('consumer');
		expect(types).toContain('decomposer');
	});

	it('getAllLabels returns the same instances as getLabel', () => {
		const allLabels = Label.getAllLabels();
		expect(allLabels).toContain(Label.getLabel('producer'));
		expect(allLabels).toContain(Label.getLabel('consumer'));
		expect(allLabels).toContain(Label.getLabel('decomposer'));
	});
});
