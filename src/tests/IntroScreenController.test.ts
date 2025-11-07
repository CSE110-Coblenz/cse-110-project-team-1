import { describe, it, expect, vi, afterEach } from "vitest";
import type { Screen } from "../types";

const mockViewInstances: any[] = [];

vi.mock("../screens/IntroScreen/IntroScreenView", () => {
  class MockIntroScreenView {
    public onContinue: () => void;
    public group = { remove: vi.fn() };
    public show = vi.fn();
    public hide = vi.fn();

    constructor(options: { onContinue: () => void }) {
      this.onContinue = options.onContinue;
      mockViewInstances.push(this);
    }

    getGroup() {
      return this.group;
    }

    triggerContinue() {
      this.onContinue();
    }
  }

  return {
    IntroScreenView: MockIntroScreenView,
    default: MockIntroScreenView,
  };
});

import { IntroScreenController } from "../screens/IntroScreen/IntroScreenController";

describe("IntroScreenController", () => {
  afterEach(() => {
    mockViewInstances.length = 0;
    vi.clearAllMocks();
  });

  it("mounts its view onto a provided layer", () => {
    const screenSwitcher = { switchToScreen: vi.fn<(screen: Screen) => void>() };
    const controller = new IntroScreenController(screenSwitcher);

    const layer = { add: vi.fn(), draw: vi.fn() };

    controller.mount(layer as any);

    const view = mockViewInstances[0];
    expect(layer.add).toHaveBeenCalledWith(view.getGroup());
    expect(layer.draw).toHaveBeenCalledTimes(1);
  });

  it("removes its view from the layer on dispose", () => {
    const screenSwitcher = { switchToScreen: vi.fn<(screen: Screen) => void>() };
    const controller = new IntroScreenController(screenSwitcher);

    const layer = { add: vi.fn(), draw: vi.fn() };
    controller.mount(layer as any);

    const view = mockViewInstances[0];
    controller.dispose();

    expect(view.group.remove).toHaveBeenCalledTimes(1);
    expect(layer.draw).toHaveBeenCalledTimes(2);
  });

  it("navigates to the game screen when continue is triggered", () => {
    const screenSwitcher = { switchToScreen: vi.fn<(screen: Screen) => void>() };
    const controller = new IntroScreenController(screenSwitcher);

    const view = mockViewInstances[0];
    view.triggerContinue();

    expect(screenSwitcher.switchToScreen).toHaveBeenCalledWith({ type: "game" });
  });
});
