import { ScreenController } from "src/types";
import type { ScreenSwitcher, View } from "src/types";
import type { Layer } from "konva/lib/Layer";
import { TutorialScreenView } from "src/screens/TutorialScreen/TutorialScreenView"; // need to make still


/**
 * TutorialScreenController - controls the tutorial screen view and logic
 * nicely matches other screen controllers so no need for additional wiring. 
 */

export class TutorialScreenController extends ScreenController {
  private view: TutorialScreenView;
  private layer?: Layer;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.view = new TutorialScreenView({
      onContinue: () => this.screenSwitcher.switchToScreen({ type: "intro" }), // will need to add this in screen switcher
    });
  }

  getView(): View {
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
                // ignore removal errors; layer may already be cleared
            }
        }
    }
}

export default TutorialScreenController;
