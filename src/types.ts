import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "game": Gameplay screen
 * - "result": Results screen with final score
 *   - score: Final score to display on results screen
 */
export type Screen =
	| { type: "menu" }
	| { type: "game" }
	| { type: "intro"}
	| { type: "result"; score: number };

export abstract class ScreenController {
	abstract getView(): View;
    
	/** Optional lifecycle hook called when the screen is mounted.
	 * Receives a Konva Layer that the screen can attach its view Group to.
	 * Default implementation is a no-op; subclasses can override. */
	mount(layer?: Layer): void {
		// no-op by default
	}

	/** Optional lifecycle hook called when the screen is being disposed.
	 * Subclasses should clean up timers/listeners/resources here. */
	dispose(): void {
		// no-op by default
	}

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
}
