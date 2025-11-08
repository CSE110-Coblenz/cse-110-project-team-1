export type LabelType = 'producer' | 'consumer' | 'decomposer';

export class Label {
  private static readonly PRODUCER = new Label('producer');
  private static readonly CONSUMER = new Label('consumer');
  private static readonly DECOMPOSER = new Label('decomposer');

  private static readonly labelMap: Map<LabelType, Label> = new Map([
    ['producer', Label.PRODUCER],
    ['consumer', Label.CONSUMER],
    ['decomposer', Label.DECOMPOSER],
  ]);

  type: LabelType;

  private constructor(type: LabelType) {
    this.type = type;
  }

  static getLabel(type: LabelType): Label {
    const label = this.labelMap.get(type);
    if (!label) {
      throw new Error(`Unknown label type: ${type}`);
    }
    return label;
  }

  static getAllLabels(): Label[] {
    return Array.from(this.labelMap.values());
  }
}
