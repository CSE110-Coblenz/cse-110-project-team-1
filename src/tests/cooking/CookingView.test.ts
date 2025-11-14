import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Species } from 'src/common/types/Species';

const mockStages: any[] = [];

vi.mock('konva', () => ({
  default: {
    Stage: class { constructor(opts: any) { mockStages.push(opts); } add() {} destroy() {} },
    Layer: class { add() {} },
    Rect: class { constructor(public attrs: any) {} },
    Text: class { constructor(public attrs: any) {} text() {} },
    Tween: class { constructor(_opts: any) {} play() {} },
    Easings: { EaseInOut: 'EaseInOut' },
  },
}));

import { CookingView } from 'src/cooking/view/CookingView';

beforeEach(() => {
  document.body.innerHTML = '<div id="container"></div>';
  mockStages.length = 0;
});

describe('CookingView', () => {
  const customers = [
    { customerId: 'c1', customerType: Species.RABBIT, patience: 100 },
    { customerId: 'c2', customerType: Species.MUSHROOM, patience: 100 },
  ];

  it('initializes and creates DOM elements', () => {
    const view = new CookingView();
    view.initialize(customers, 'producer', 42);

    expect(document.getElementById('view-placeholder')).toBeTruthy();
    expect(document.getElementById('progress-konva-container')).toBeTruthy();
    expect(document.getElementById('patience-konva-container')).toBeTruthy();
    expect(document.getElementById('score-value')!.textContent).toBe('42');
    expect(document.getElementById('label-value')!.textContent).toBe('producer');
    expect(mockStages.find((s: any) => s.container === 'progress-konva-container')).toBeTruthy();
    expect(mockStages.find((s: any) => s.container === 'patience-konva-container')).toBeTruthy();
  });

  it('updates score and label', () => {
    const view = new CookingView();
    view.initialize(customers, 'consumer', 0);

    view.updateScore(100);
    expect(document.getElementById('score-value')!.textContent).toBe('100');

    view.updateLabel('producer');
    expect(document.getElementById('label-value')!.textContent).toBe('producer');
  });
});
