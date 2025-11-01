import { ScreenController } from "../../types";
import { ResultScreenView } from "./ResultScreenView";
import type { Layer } from "konva/lib/Layer";

export class ResultScreenController extends ScreenController {
  private view: ResultScreenView;
  private layer?: Layer;

  constructor(score: number) {
    super();
    this.view = new ResultScreenView(score);
  }

  getView(): ResultScreenView {
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

export default ResultScreenController;
