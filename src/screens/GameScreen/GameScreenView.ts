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


	constructor() {
		this.group = new Konva.Group();

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

}

export default GameScreenView;
