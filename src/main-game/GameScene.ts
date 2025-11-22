import { MapModel } from 'src/main-game/MapModel';
import { MapController } from 'src/main-game/MapController';
import { MapView } from 'src/main-game/MapView';
import { PlayerModel } from 'src/main-game/PlayerModel';
import { PlayerView } from 'src/main-game/PlayerView';
import { PlayerController } from 'src/main-game/PlayerController';
import { NPCFactory } from 'src/main-game/NPC/NPC';
import { Species } from 'src/common/types/Species';
import type { Layer } from 'konva/lib/Layer';

export type GameSceneOptions = {
	width?: number;
	height?: number;
	spacing?: number;
	wallCount?: number;
	wallMinWidth?: number;
	wallMaxWidth?: number;
	npcCount?: number;
	species?: Species;
	levelNumber?: number;
	onLevelComplete?: () => void;
	onPlayerDeath?: () => void;
	onHudUpdate?: (hud: {
		health: number;
		progress: number;
		level: number;
		species: Species;
	}) => void;
};

export class GameScene {
	private layer: Layer;
	private mapModel: MapModel;
	private mapController: MapController;
	private mapView: MapView;
	private playerModel: PlayerModel;
	private playerView: PlayerView;
	private playerController: PlayerController;
	private animationFrameId: number | null = null;
	private lastTimestamp: number | null = null;
	private started = false;
	private options: GameSceneOptions;

	constructor(layer: Layer, options: GameSceneOptions = {}) {
		this.layer = layer;
		this.options = options;

		// World config
		const worldWidth = options.width ?? Math.max(800, window.innerWidth * 5);
		const worldHeight = options.height ?? Math.max(600, window.innerHeight * 5);

		this.mapModel = new MapModel({
			width: worldWidth,
			height: worldHeight,
			spacing: options.spacing ?? 120,
			wallCount: options.wallCount ?? 2500,
			wallMinWidth: options.wallMinWidth ?? 80,
			wallMaxWidth: options.wallMaxWidth ?? 160,
		});

		// Viewport size
		const vpW =
			window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		const vpH =
			window.innerHeight ||
			document.documentElement.clientHeight ||
			document.body.clientHeight;

		this.mapController = new MapController(this.mapModel, vpW, vpH);
		this.mapView = new MapView(); // keep default; provide color if required by your MapView ctor

		// Player (new API: species, x, y)
		const startX = Math.floor(this.mapModel.getWidth() / 2);
		const startY = Math.floor(this.mapModel.getHeight() / 2);
		this.playerModel = new PlayerModel(this.options.species ?? Species.MOUSE, startX, startY);
		this.playerView = new PlayerView();
		this.playerController = new PlayerController(
			this.playerModel,
			this.playerView,
			this.mapModel,
			this.mapController,
		);

		this.mapModel.setMainPlayer(this.playerModel);

		// NPCs
		const npcs = NPCFactory.createNRandomNPCs(options.npcCount ?? 150);
		this.mapController.placeNPCs(npcs);
	}

	public getPlayerModel(): PlayerModel {
		return this.playerModel;
	}

	private pushHud() {
		const progress = this.playerModel.getExperience?.() ?? 0; // expect 0..100
		const level = this.options.levelNumber ?? 1;
		const health = this.playerModel.getHealth?.() ?? 0;
		const species = this.playerModel.getSpecies?.() ?? Species.MOUSE;
		this.options.onHudUpdate?.({ health, progress, level, species });
	}

	private renderOnce() {
		const vp = this.mapController.getViewport();
		const walls = this.mapController.getVisibleWalls();

		this.mapView.draw(this.layer, vp, walls);
		this.playerController.draw(this.layer, vp);
		this.mapController.drawNPCs(this.layer, vp);

		this.pushHud();
	}

	public start() {
		if (this.started) return;
		this.started = true;

		this.playerController.attachKeyboardListeners(() => this.renderOnce());
		this.renderOnce();

		const loop = (timestamp: number) => {
			if (this.lastTimestamp == null) this.lastTimestamp = timestamp;
			const deltaSec = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
			this.lastTimestamp = timestamp;

			this.mapController.animateNPCs(deltaSec);
			this.playerController.updateFromInput(deltaSec);

			// Death
			if (this.playerModel.getHealth() <= 0) {
				this.options.onPlayerDeath?.();
				this.stop();
				return;
			}

			// Level complete
			if (this.playerModel.getExperience() >= 100) {
				this.options.onLevelComplete?.();
				this.playerModel.setExperience(0);
				this.playerModel.setHealth(100);
				this.stop();
				return;
			}

			this.renderOnce();
			this.animationFrameId = requestAnimationFrame(loop);
		};

		this.animationFrameId = requestAnimationFrame(loop);
	}

	public stop() {
		if (!this.started) return;
		this.started = false;

		this.playerController.detachKeyboardListeners();

		if (this.animationFrameId != null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
			this.lastTimestamp = null;
		}

		try {
			this.layer.destroyChildren(); // clears world drawings on this layer
			this.layer.draw();
		} catch {
			// ignore
		}
	}
}

export default GameScene;
