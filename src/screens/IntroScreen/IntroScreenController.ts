import { ScreenController } from 'src/types';
import type { ScreenSwitcher } from 'src/types';
import type { Layer } from 'konva/lib/Layer';
import { IntroScreenView } from 'src/screens/IntroScreen/IntroScreenView';

/**
 * IntroScreenController - handles tutorial/intro flow before gameplay.
 * The controller mirrors the structure of the other screen controllers so it
 * can plug into ScreenManager without additional wiring.
 */
export class IntroScreenController extends ScreenController {
	private view: IntroScreenView;
	private layer?: Layer;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new IntroScreenView({
			onContinue: () => this.screenSwitcher.switchToScreen({ type: 'game' }),
		});
	}

	getView(): IntroScreenView {
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

export default IntroScreenController;
