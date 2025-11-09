import { ScreenController } from 'src/types';
import { MenuScreenView } from 'src/screens/MenuScreen/MenuScreenView';
import type { Layer } from 'konva/lib/Layer';

export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private layer?: Layer;

	constructor() {
		super();
		this.view = new MenuScreenView();
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
			} catch (e) {}
		}
	}
}

export default MenuScreenController;
