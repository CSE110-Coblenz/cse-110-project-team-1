import { Viewport } from 'src/main-game/types';
import { EntityModel } from 'src/main-game/EntityModel';
import { EntityView } from 'src/main-game/EntityView';

export class EntityController {
	protected model: EntityModel;
	protected view: EntityView;

	constructor(model: EntityModel, view: EntityView) {
		this.model = model;
		this.view = view;
		this.model.onDead(() => this.view.undraw());
	}

	public getModel(): EntityModel {
		return this.model;
	}

	public getView(): EntityView {
		return this.view;
	}

	public draw(target: CanvasRenderingContext2D | any, viewport: Viewport) {
		this.view.draw(
			target,
			viewport,
			this.model.redTint,
			this.model.getPosition(),
			this.model.view_radius,
		);
	}
}
