import { ScreenController } from "../../types";
import type { ScreenSwitcher } from "../../types";
import type { Layer } from "konva/lib/Layer";
import { GameScreenModel } from "./GameScreenModel";
import { GameScreenView } from "./GameScreenView";
import { GAME_DURATION } from "../../constants";

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private layer?: Layer;
	private model: GameScreenModel;
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private gameTimer: number | null = null;

	private squeezeSound: HTMLAudioElement;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.model = new GameScreenModel();
		this.view = new GameScreenView(() => this.handleLemonClick());

		// TODO: Task 4 - Initialize squeeze sound audio
		this.squeezeSound = new Audio(); // Placeholder
	}

	/**
	 * Mount the screen into a Konva layer. We add the view's group to the
	 * layer so it becomes visible on the stage.
	 */
	mount(layer?: Layer): void {
		this.layer = layer;
		if (this.layer) {
			this.layer.add(this.view.getGroup());
			// request a redraw so the newly added group appears
			this.layer.draw();
		}
	}

	/**
	 * Dispose the screen: stop timers, remove view from layer, cleanup resources.
	 */
	dispose(): void {
		this.stopTimer();
		if (this.layer) {
			try {
				this.view.getGroup().remove();
				this.layer.draw();
			} catch (e) {
				// ignore removal errors
			}
		}
	}

	/**
	 * Start the game
	 */
	startGame(): void {
		// Reset model state
		this.model.reset();

		// Update view
		this.view.updateScore(this.model.getScore());
		this.view.updateTimer(GAME_DURATION);
		this.view.show();

		this.startTimer();
	}

	/**
	 * Start the countdown timer
	 */
	private startTimer(): void {
		// TODO: Task 3 - Implement countdown timer using setInterval
	}

	/**
	 * Stop the timer
	 */
	private stopTimer(): void {
		// TODO: Task 3 - Stop the timer using clearInterval
	}

	/**
	 * Handle lemon click event
	 */
	private handleLemonClick(): void {
		// Update model
		this.model.incrementScore();

		// Update view
		this.view.updateScore(this.model.getScore());
		this.view.randomizeLemonPosition();

		// TODO: Task 4 - Play the squeeze sound
	}

	/**
	 * End the game
	 */
	private endGame(): void {
		this.stopTimer();

		// Switch to results screen with final score
		this.screenSwitcher.switchToScreen({
			type: "result",
			score: this.model.getScore(),
		});
	}

	/**
	 * Get final score
	 */
	getFinalScore(): number {
		return this.model.getScore();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}
}
