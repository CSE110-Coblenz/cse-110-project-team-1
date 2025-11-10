import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import { MenuScreenView } from "./MenuScreenView";
import type { Layer } from "konva/lib/Layer";

export class MenuScreenController extends ScreenController {
  private view: MenuScreenView;
  private layer?: Layer;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.view = new MenuScreenView({
      onStart: () => this.screenSwitcher.switchToScreen({ type: "intro" }),
    });
  }

  getView(): MenuScreenView {
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
      } catch (e) { }
    }
  }
}

export default MenuScreenController;
