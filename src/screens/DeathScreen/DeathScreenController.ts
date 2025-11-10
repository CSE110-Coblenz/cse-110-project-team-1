import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { Layer } from "konva/lib/Layer";
import { DeathScreenView } from "./DeathScreenView";

export class DeathScreenController extends ScreenController {
    private view: DeathScreenView;
    private layer?: Layer;
    private screenSwitcher: ScreenSwitcher;

    constructor(screenSwitcher: ScreenSwitcher, score?: number) {
        super();
        this.screenSwitcher = screenSwitcher;
        this.view = new DeathScreenView(score, {
            onPlayAgain: () => this.screenSwitcher.switchToScreen({ type: "menu" }),
        });
    }

    getView(): DeathScreenView {
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

export default DeathScreenController;
