import Konva from 'konva';
import { ScreenController, ScreenSwitcher } from 'src/types';
import { GameScreenView } from 'src/screens/GameScreen/GameScreenView';
import { GameScene } from 'src/main-game/GameScene';
import { pickSpeciesForLevel } from 'src/common/types/Species';
import type { Layer } from 'konva/lib/Layer';

export class GameScreenController extends ScreenController {
	private static tutorialSeen = false;
	private static cumulativeSpeedBoost = 0;
	private worldLayer?: Layer;
	private uiLayer?: Layer;
	private view: GameScreenView;
	private scene?: GameScene;
	private screenSwitcher: ScreenSwitcher;
	private currentLevel = 0;
	private maxLevels = 4;
	private onResize?: () => void;
	private speedBoost = 0;

	constructor(screenSwitcher: ScreenSwitcher, startLevel?: number, speedBoost?: number) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new GameScreenView();
		this.currentLevel = startLevel ?? 1;
		this.speedBoost = speedBoost ?? 0;
		// Add new boost to cumulative total
		if (this.speedBoost > 0) {
			GameScreenController.cumulativeSpeedBoost += this.speedBoost;
		}
	}

	mount(layer?: Layer): void {
		this.worldLayer = layer;
		const stage = this.worldLayer?.getStage();
		if (!stage || !this.worldLayer) return;

		// Create UI layer above world
		this.uiLayer = new Konva.Layer();
		stage.add(this.uiLayer);

		// Add HUD to UI layer
		this.uiLayer.add(this.view.getGroup());
		this.view.resize(stage.width(), stage.height());
		this.uiLayer.draw();

		// Start level loop
		this.startLevel(this.currentLevel);

		// Keep HUD responsive
		this.onResize = () => {
			this.view.resize(stage.width(), stage.height());
			this.uiLayer?.batchDraw();
		};
		window.addEventListener('resize', this.onResize, { passive: true });
	}

	private startLevel(level: number) {
		if (!this.worldLayer) return;

		this.scene?.stop();
		this.scene = new GameScene(this.worldLayer, {
			levelNumber: level,
			species: pickSpeciesForLevel(level),
			onHudUpdate: ({ health, progress, level, species, speed, damage }) => {
				this.view.setHealth(health);
				this.view.setProgress(progress);
				this.view.setLevel(level);
				this.view.setSpecies(species);
				this.view.setSpeed(speed);
				this.view.setDamage(damage);
				this.uiLayer?.batchDraw();
			},
			onLevelComplete: () => {
				if (level < this.maxLevels) {
					// Collect all species from the completed level
					const allSpecies = this.scene?.getAllLevelSpecies() ?? [];

					// Go to cooking tutorial on first visit, or directly to cooking
					this.screenSwitcher.switchToScreen({
						type: GameScreenController.tutorialSeen ? 'cooking' : 'cooking-tutorial',
						species: allSpecies,
						nextLevel: level + 1,
					});
				} else {
					this.screenSwitcher.switchToScreen({ type: 'victory' });
				}
			},
			onPlayerDeath: () => {
				this.screenSwitcher.switchToScreen({ type: 'death' });
			},
		});

		// Apply cumulative speed boost from cooking game
		if (GameScreenController.cumulativeSpeedBoost > 0) {
			const player = this.scene.getPlayerModel();
			const baseSpeed = player.getSpeed();
			const newSpeed = baseSpeed + GameScreenController.cumulativeSpeedBoost;
			console.log(
				`Applying cumulative speed boost: ${baseSpeed} + ${GameScreenController.cumulativeSpeedBoost} = ${newSpeed}`,
			);
			player.setSpeed(newSpeed);
		}
		// Always reset current level's boost after applying so it doesn't get added twice
		this.speedBoost = 0;

		this.scene.start();
		this.worldLayer.draw();
	}

	dispose(): void {
		try {
			this.scene?.stop();
		} catch {}
		if (this.onResize) {
			try {
				window.removeEventListener('resize', this.onResize);
			} catch {}
			this.onResize = undefined;
		}
		try {
			this.view.getGroup().remove();
		} catch {}
		try {
			this.uiLayer?.destroyChildren();
			this.uiLayer?.draw();
		} catch {}
		try {
			this.worldLayer?.draw();
		} catch {}
	}

	getView(): GameScreenView {
		return this.view;
	}

	setHealth(pct: number): void {
		this.view.setHealth(pct);
		this.uiLayer?.batchDraw();
	}
	setProgress(pct: number): void {
		this.view.setProgress(pct);
		this.uiLayer?.batchDraw();
	}
	setLevel(lvl: number): void {
		this.view.setLevel(lvl);
		this.uiLayer?.batchDraw();
	}
	setSpecies(name: string): void {
		this.view.setSpecies(name);
		this.uiLayer?.batchDraw();
	}
}
