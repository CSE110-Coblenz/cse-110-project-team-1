import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { Layer } from "konva/lib/Layer";
import { VictoryScreenView } from "./VictoryScreenView";

export class VictoryScreenController extends ScreenController {
    private view: VictoryScreenView;
    private layer?: Layer;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher, score?: number) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.view = new VictoryScreenView(score, {
            onPlayAgain: () => this.screenSwitcher.switchToScreen({ type: "menu" }),
        });
    }

    getView(): VictoryScreenView {
        return this.view;
    }

    mount(layer?: Layer): void {
        this.layer = layer;
        if (this.layer) {
            this.layer.add(this.view.getGroup());
            // View handles rendering/positioning of the Play Again button; the
            // controller provided the onPlayAgain callback at construction time.
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

export default VictoryScreenController;
