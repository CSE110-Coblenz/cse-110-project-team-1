import { ScreenController } from "../../types";
import { EndingScreenView } from "./EndingScreenView";
import type { Layer } from "konva/lib/Layer";

export class EndingScreenController extends ScreenController {
  private view: EndingScreenView;
  private layer?: Layer;

  constructor() {
    super();
    this.view = new EndingScreenView();
  
  }

  getView(): EndingScreenView {
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
      } catch (e) {}
    }
  }
}

export default EndingScreenController;
