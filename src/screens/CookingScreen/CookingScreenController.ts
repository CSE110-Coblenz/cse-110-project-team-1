import { ScreenController, type ScreenSwitcher } from "../../types";
import type { Layer } from "konva/lib/Layer";
import { CookingScreenView } from "./CookingScreenView";

/**
 * Basic Cooking screen controller that plugs into ScreenManager.
 * Handles layer mounting, cleanup, and transitions using the provided ScreenSwitcher.
 */
export class CookingScreenController extends ScreenController {
  private layer?: Layer;
  private view: CookingScreenView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.view = new CookingScreenView({
      onFinish: () => this.screenSwitcher.switchToScreen({ type: "ending" }),
    });
  }

  getView(): CookingScreenView {
    return this.view;
  }

  mount(layer?: Layer): void {
    this.layer = layer;
    if (this.layer) {
      this.layer.add(this.view.getGroup());
      this.layer.draw();
    }
  }

  dispose(): void {
    if (this.layer) {
      try {
        this.view.getGroup().remove();
        this.layer.draw();
      } catch (e) {
        // ignore removal errors if the layer was already cleared
      }
    }
  }
}

export default CookingScreenController;
