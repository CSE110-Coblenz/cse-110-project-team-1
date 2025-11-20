// src/screens/GameScreen/GameScreenController.ts
import Konva from 'konva';
import { ScreenController, ScreenSwitcher } from 'src/types';
import { GameScreenView } from 'src/screens/GameScreen/GameScreenView';
import { GameScene } from 'src/main-game/GameScene';
import { pickSpeciesForLevel } from 'src/common/types/Species';
import type { Layer } from 'konva/lib/Layer';

export class GameScreenController extends ScreenController {
	private worldLayer?: Layer;
	private uiLayer?: Layer;
	private view: GameScreenView;
	private scene?: GameScene;
	private screenSwitcher: ScreenSwitcher;
	private currentLevel = 0;
	private maxLevels = 4;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new GameScreenView();
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
		this.currentLevel = 1;
		this.startLevel(this.currentLevel);

		// Keep HUD responsive
		const onResize = () => {
			this.view.resize(stage.width(), stage.height());
			this.uiLayer?.batchDraw();
		};
		window.addEventListener('resize', onResize, { passive: true });
	}

	private startLevel(level: number) {
		if (!this.worldLayer) return;

		this.scene?.stop();
		this.scene = new GameScene(this.worldLayer, {
			levelNumber: level,
			species: pickSpeciesForLevel(level),
			onHudUpdate: ({ health, progress, level, species }) => {
				this.view.setHealth(health);
				this.view.setProgress(progress);
				this.view.setLevel(level);
				this.view.setSpecies(species);
				this.uiLayer?.batchDraw();
			},
			onLevelComplete: () => {
				if (level < this.maxLevels) {
					this.currentLevel = level + 1;
					this.startLevel(this.currentLevel);
				} else {
					this.screenSwitcher.switchToScreen({ type: 'victory' });
				}
			},
			onPlayerDeath: () => {
				this.screenSwitcher.switchToScreen({ type: 'death' });
			},
		});

		this.scene.start();
		this.worldLayer.draw();
	}

	dispose(): void {
		try {
			this.scene?.stop();
		} catch {}
		try {
			this.view.getGroup().remove();
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
}
