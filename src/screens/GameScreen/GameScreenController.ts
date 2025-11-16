import { ScreenController } from 'src/types';
import type { ScreenSwitcher } from 'src/types';
import type { Layer } from 'konva/lib/Layer';
import { GameScreenModel } from 'src/screens/GameScreen/GameScreenModel';
import { GameScreenView } from 'src/screens/GameScreen/GameScreenView';
import { GameScene } from 'src/main-game/GameScene';
import { Species, pickSpeciesForLevel } from 'src/common/types/Species';
/**
 * GameScreenController - Minimal structure for new game logic
 */
export class GameScreenController extends ScreenController {
	private layer?: Layer;
	private model: GameScreenModel;
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private scene?: GameScene;
	private currentLevel = 0;
	private maxLevels = 4;

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
			// start the level loop
			this.currentLevel = 1;
			this.startLevel(this.currentLevel);
		}
	}

	// delegate species/duration selection to shared LevelOrchestrator

	private startLevel(level: number) {
		if (!this.layer) return;
		// stop previous scene if any
		if (this.scene) {
			try {
				this.scene.stop();
			} catch (e) {
				/* ignore */
			}
			this.scene = undefined;
		}

		// pick a species for the player
		const species = pickSpeciesForLevel(level);
		console.log('level begun as a: ' + species);

		// create new scene with callbacks
		this.scene = new GameScene(this.layer, {
			levelNumber: level,
			species,
			onLevelComplete: () => {
				if (level < this.maxLevels) {
					this.currentLevel = level + 1;
					this.startLevel(this.currentLevel);
				} else {
					// finished all levels -> victory
					this.screenSwitcher.switchToScreen({ type: 'victory' });
				}
			},
			onPlayerDeath: () => {
				try {
					this.screenSwitcher.switchToScreen({ type: 'death' });
				} catch (e) {
					/* ignore */
				}
			},
		});

		this.scene.start();
		this.layer.draw();
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
