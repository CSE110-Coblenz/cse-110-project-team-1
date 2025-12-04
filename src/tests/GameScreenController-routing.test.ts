import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Screen } from 'src/types';

// Minimal mocks following CookingView.test.ts pattern
vi.mock('konva', () => ({
  default: {
    Layer: class {
      add() {}
      draw() {}
      batchDraw() {}
      getStage() { return null; }
    },
    Group: class {
      public attrs: any;
      constructor(config: any = {}) {
        this.attrs = { ...config };
      }
      add() {}
      visible(val?: boolean) {
        if (val !== undefined) return this;
        return true;
      }
      remove() {}
      batchDraw() {}
    },
    Rect: class {
      public attrs: any;
      constructor(config: any = {}) {
        this.attrs = { ...config };
      }
      x(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.x ?? 0;
      }
      y(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.y ?? 0;
      }
      width(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.width ?? 0;
      }
      height(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.height ?? 0;
      }
      fill(val?: string) {
        if (val !== undefined) return this;
        return this.attrs.fill;
      }
      visible(val?: boolean) {
        if (val !== undefined) return this;
        return true;
      }
      listening(val?: boolean) {
        if (val !== undefined) return this;
        return true;
      }
      opacity(val?: number) {
        if (val !== undefined) return this;
        return 1;
      }
      cornerRadius(val?: number) {
        if (val !== undefined) return this;
        return 0;
      }
      shadowBlur(val?: number) {
        if (val !== undefined) return this;
        return 0;
      }
      shadowOffsetY(val?: number) {
        if (val !== undefined) return this;
        return 0;
      }
      shadowColor(val?: string) {
        if (val !== undefined) return this;
        return '';
      }
      position(val?: any) {
        if (val !== undefined) return this;
        return { x: 0, y: 0 };
      }
      size(val?: any) {
        if (val !== undefined) return this;
        return { width: 0, height: 0 };
      }
      on() {}
    },
    Text: class {
      public attrs: any;
      constructor(config: any = {}) {
        this.attrs = { ...config };
      }
      x(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.x ?? 0;
      }
      y(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.y ?? 0;
      }
      width(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.width ?? 0;
      }
      height(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.height ?? 0;
      }
      text(val?: string) {
        if (val !== undefined) return this;
        return this.attrs.text ?? '';
      }
      fontSize(val?: number) {
        if (val !== undefined) return this;
        return this.attrs.fontSize ?? 12;
      }
      fill(val?: string) {
        if (val !== undefined) return this;
        return this.attrs.fill;
      }
      align(val?: string) {
        if (val !== undefined) return this;
        return this.attrs.align;
      }
      verticalAlign(val?: string) {
        if (val !== undefined) return this;
        return this.attrs.verticalAlign;
      }
      visible(val?: boolean) {
        if (val !== undefined) return this;
        return true;
      }
      listening(val?: boolean) {
        if (val !== undefined) return this;
        return true;
      }
      getTextWidth() {
        return 50;
      }
      getTextHeight() {
        return 20;
      }
      position(val?: any) {
        if (val !== undefined) return this;
        return { x: 0, y: 0 };
      }
      on() {}
    },
  },
}));
vi.mock('src/main-game/GameScene', () => ({
  GameScene: class {
    constructor(_layer: any, opts: any) {
      this.opts = opts;
    }
    opts: any;
    start() {}
    stop() {}
    getAllLevelSpecies() { return [{ id: 's1' }, { id: 's2' }]; }
  },
}));

import { GameScreenController } from 'src/screens/GameScreen/GameScreenController';

describe('GameScreenController routing to cooking/tutorial', () => {
  afterEach(() => {
    (GameScreenController as any).tutorialSeen = false;
    vi.clearAllMocks();
  });

  it('first completion goes to cooking-tutorial', () => {
    const screenSwitcher = { switchToScreen: vi.fn<(screen: Screen) => void>() };
    const controller = new GameScreenController(screenSwitcher as any, 1);

    // mount with minimal layer/stage
    const stage = { add: vi.fn(), width: () => 800, height: () => 600, getStage: () => stage } as any;
    const layer = { getStage: () => stage, add: vi.fn(), draw: vi.fn() } as any;
    controller.mount(layer);

    // simulate level complete
    // access private via any for test
    const scene = (controller as any).scene;
    scene.opts.onLevelComplete();

    expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
      type: 'cooking-tutorial',
      species: [{ id: 's1' }, { id: 's2' }],
      nextLevel: 2,
    });
  });

  it('after tutorialSeen, completion goes to cooking directly', () => {
    const screenSwitcher = { switchToScreen: vi.fn<(screen: Screen) => void>() };
    (GameScreenController as any).tutorialSeen = true;
    const controller = new GameScreenController(screenSwitcher as any, 1);

    const stage = { add: vi.fn(), width: () => 800, height: () => 600 } as any;
    const layer = { getStage: () => stage, add: vi.fn(), draw: vi.fn() } as any;
    controller.mount(layer);

    const scene = (controller as any).scene;
    scene.opts.onLevelComplete();

    expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({
      type: 'cooking',
      species: [{ id: 's1' }, { id: 's2' }],
      nextLevel: 2,
    });
  });
});
