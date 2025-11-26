import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Species } from 'src/common/types/Species';

const mockStages: any[] = [];

// Konva mock with proper getter/setter methods matching the real API
// Must define classes inline in vi.mock to avoid hoisting issues
vi.mock('konva', () => ({
  default: {
    Stage: class {
      constructor(opts: any) { mockStages.push(opts); }
      add() {}
      destroy() {}
      width(val?: number) { if (val !== undefined) return this; return 480; }
      height(val?: number) { if (val !== undefined) return this; return 260; }
    },
    Layer: class {
      add() {}
      draw() {}
    },
    Rect: class {
      public attrs: any;
      constructor(config: any = {}) { this.attrs = { ...config }; }
      x(val?: number) { if (val !== undefined) { this.attrs.x = val; return this; } return this.attrs.x ?? 0; }
      y(val?: number) { if (val !== undefined) { this.attrs.y = val; return this; } return this.attrs.y ?? 0; }
      width(val?: number) { if (val !== undefined) { this.attrs.width = val; return this; } return this.attrs.width ?? 0; }
      height(val?: number) { if (val !== undefined) { this.attrs.height = val; return this; } return this.attrs.height ?? 0; }
      fill(val?: string) { if (val !== undefined) { this.attrs.fill = val; return this; } return this.attrs.fill; }
      stroke(val?: string | null) { if (val !== undefined) { this.attrs.stroke = val; return this; } return this.attrs.stroke; }
      strokeWidth(val?: number) { if (val !== undefined) { this.attrs.strokeWidth = val; return this; } return this.attrs.strokeWidth ?? 0; }
      opacity(val?: number) { if (val !== undefined) { this.attrs.opacity = val; return this; } return this.attrs.opacity ?? 1; }
      draggable(val?: boolean) { if (val !== undefined) { this.attrs.draggable = val; return this; } return this.attrs.draggable ?? false; }
      to(_opts: any) { return this; }
      destroy() {}
      on(_event: string, _handler: any) {}
    },
    Text: class {
      public attrs: any;
      constructor(config: any = {}) { this.attrs = { ...config }; }
      x(val?: number) { if (val !== undefined) { this.attrs.x = val; return this; } return this.attrs.x ?? 0; }
      y(val?: number) { if (val !== undefined) { this.attrs.y = val; return this; } return this.attrs.y ?? 0; }
      width(val?: number) { if (val !== undefined) { this.attrs.width = val; return this; } return this.attrs.width ?? 0; }
      height(val?: number) { if (val !== undefined) { this.attrs.height = val; return this; } return this.attrs.height ?? 0; }
      text(val?: string) { if (val !== undefined) { this.attrs.text = val; return this; } return this.attrs.text ?? ''; }
      fontSize(val?: number) { if (val !== undefined) { this.attrs.fontSize = val; return this; } return this.attrs.fontSize ?? 12; }
      fill(val?: string) { if (val !== undefined) { this.attrs.fill = val; return this; } return this.attrs.fill; }
      listening(val?: boolean) { if (val !== undefined) { this.attrs.listening = val; return this; } return this.attrs.listening ?? true; }
      to(_opts: any) { return this; }
      destroy() {}
    },
    Group: class {
      public attrs: any;
      public children: any[] = [];
      constructor(config: any = {}) { this.attrs = { ...config }; }
      x(val?: number) { if (val !== undefined) { this.attrs.x = val; return this; } return this.attrs.x ?? 0; }
      y(val?: number) { if (val !== undefined) { this.attrs.y = val; return this; } return this.attrs.y ?? 0; }
      add(child: any) { this.children.push(child); }
      to(_opts: any) { return this; }
      on(_event: string, _handler: any) {}
      getClientRect() { return { x: this.attrs.x ?? 0, y: this.attrs.y ?? 0, width: 64, height: 64 }; }
    },
    Tween: class { constructor(_opts: any) {} play() {} },
    Easings: { EaseOut: 'EaseOut', EaseInOut: 'EaseInOut' },
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

  it('initializes minimal view elements', () => {
    const view = new CookingView();
    view.initialize(customers, 'producer', 42);

    // Wrapper and required containers exist
    expect(document.getElementById('view-placeholder')).toBeTruthy();
    expect(document.getElementById('progress-konva-container')).toBeTruthy();
    expect(document.getElementById('game-stage-container')).toBeTruthy();
    // Score initialized
    expect(document.getElementById('score-value')!.textContent).toBe('42');
    // Current label tracked internally
    expect(view.getCurrentLabel()).toBe('producer');
    // Progress stage created
    expect(mockStages.find((s: any) => s.container === 'progress-konva-container')).toBeTruthy();
  });

  it('updates score and label internally', () => {
    const view = new CookingView();
    view.initialize(customers, 'consumer', 0);

    view.updateScore(100);
    expect(document.getElementById('score-value')!.textContent).toBe('100');

    view.updateLabel('producer');
    expect(view.getCurrentLabel()).toBe('producer');
  });
});
