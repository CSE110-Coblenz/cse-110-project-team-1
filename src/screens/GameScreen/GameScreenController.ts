import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { Layer } from "konva/lib/Layer";
import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { GameScene } from "../../main-game/GameScene";
/**
 * GameScreenController - Minimal structure for new game logic
 */
export class GameScreenController extends ScreenController {
	private layer?: Layer;
	private model: GameScreenModel;
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private scene?: GameScene;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new GameScreenModel();
		this.view = new GameScreenView();
	}

	mount(layer?: Layer): void {
		this.layer = layer;
		if (this.layer) {
			this.layer.add(this.view.getGroup());
			// start the main-game scene on the provided layer
			this.scene = new GameScene(this.layer);
			this.scene.start();
			this.layer.draw();
		}
	}

	dispose(): void {
		if (this.layer) {
			try {
				// stop scene if running and remove view group
				if (this.scene) {
					this.scene.stop();
					this.scene = undefined;
				}
				this.view.getGroup().remove();
				this.layer.draw();
			} catch (e) {
				// ignore removal errors
			}
		}
	}

	getView(): GameScreenView {
		return this.view;
	}
}
