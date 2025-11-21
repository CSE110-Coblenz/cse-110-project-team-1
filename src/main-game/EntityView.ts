import Konva from 'konva';
import { Position, Viewport } from 'src/main-game/types';
import { Species } from 'src/common/types/Species';

// Later we can accept an image and draw that instead.
export class EntityView {
	//protected color = '#ffcc00';

	public draw(
		target: CanvasRenderingContext2D | Konva.Layer,
		viewport: Viewport,
		color: string,
		position: Position,
		species: Species,
		radius: number,
	) {
		// If target looks like a Konva layer, add a simple circle node
		if (
			(target as Konva.Layer).getClassName &&
			(target as Konva.Layer).getClassName() === 'Layer'
		) {
			const layer = target as Konva.Layer;
			const circle = new Konva.Circle({
				x: position.x - viewport.x,
				y: position.y - viewport.y,
				radius,
				fill: color,
			});
			layer.add(circle);

			const textNode = new Konva.Text({
				x: position.x - viewport.x,
				y: position.y - viewport.y,
				text: species,
				fontSize: radius,
				fontFamily: 'Arial',
				fill: 'black',
				align: 'center',
			});

			// center text on the circle
			textNode.offsetX(textNode.width() / 2);
			textNode.offsetY(textNode.height() / 2);

			layer.add(textNode);
			return;
		}
	}
}
