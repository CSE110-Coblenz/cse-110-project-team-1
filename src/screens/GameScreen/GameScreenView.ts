import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { View } from "../../types";
/**
 * Minimal GameScreenView implementing the project's `View` interface.
 * This is intentionally lightweight: it exposes a Konva.Group and a few
 * methods to show/hide the view.
 */
export class GameScreenView implements View {
	private group: Group;
	

	constructor() {
		this.group = new Konva.Group();

		const background = new Konva.Rect({
			x: 0,
			y: 0,
			width: 800,
			height: 600,
			fill: "#002b36",
			opacity: 0.9,
		});

		const label = new Konva.Text({
			x: 120,
			y: 120,
			text: "Game Screen Placeholder",
			fontSize: 36,
			fill: "#ffffff",
		});

		this.group.add(background);
		this.group.add(label);
	}

	getGroup(): Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
	}

	hide(): void {
		this.group.visible(false);
	}

}

export default GameScreenView;
