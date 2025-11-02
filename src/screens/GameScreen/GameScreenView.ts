import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { View } from "../../types";
/**
 * Minimal GameScreenView implementing the project's `View` interface.
 * This is intentionally lightweight: it exposes a Konva.Group and a few
 * helper methods the controller expects (updateScore, updateTimer, randomizeLemonPosition).
 */
export class GameScreenView implements View {
	private group: Group;
	private score: number = 0;
	private timer: number = 0;

	private lemonCircle: Konva.Circle;

	constructor(onLemonClick?: () => void) {
		this.group = new Konva.Group();

		// Create a simple circle to represent the lemon / clickable target
		this.lemonCircle = new Konva.Circle({
			x: 100,
			y: 100,
			radius: 30,
			fill: "#ffea00",
			stroke: "#f0c300",
			strokeWidth: 2,
		});

		if (onLemonClick) {
			this.lemonCircle.on("click", onLemonClick);
		}

		this.group.add(this.lemonCircle);
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

	updateScore(score: number): void {
		this.score = score;
		// In a real view we would update text nodes; keep lightweight here.
	}

	updateTimer(ms: number): void {
		this.timer = ms;
	}

	randomizeLemonPosition(): void {
		// Move the lemon to a random place in a 800x600 area (example)
		const x = Math.floor(Math.random() * 700) + 50;
		const y = Math.floor(Math.random() * 500) + 50;
		this.lemonCircle.x(x);
		this.lemonCircle.y(y);
	}
}

export default GameScreenView;
