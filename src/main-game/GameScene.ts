import Konva from 'konva';
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

		const worldWidth = options.width ?? Math.max(800, window.innerWidth * 5);
		const worldHeight = options.height ?? Math.max(600, window.innerHeight * 5);

		const config = {
			width: worldWidth,
			height: worldHeight,
			spacing: options.spacing ?? 120,
			wallCount: options.wallCount ?? 2500,
			wallMinWidth: options.wallMinWidth ?? 80,
			wallMaxWidth: options.wallMaxWidth ?? 160,
		};

		this.mapModel = new MapModel(config);

		// determine viewport size from layer's stage if available
		const stage = this.layer.getStage();
		const vpW =
			window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		const vpH =
			window.innerHeight ||
			document.documentElement.clientHeight ||
			document.body.clientHeight;

		this.mapController = new MapController(this.mapModel, vpW, vpH);
		this.mapView = new MapView();

		// create player with requested species
		const startX = Math.floor(this.mapModel.getWidth() / 2);
		const startY = Math.floor(this.mapModel.getHeight() / 2);
		this.playerModel = new PlayerModel(options.species ?? Species.MOUSE, startX, startY);
		this.playerView = new PlayerView();
		this.playerController = new PlayerController(
			this.playerModel,
			this.playerView,
			this.mapModel,
			this.mapController,
		);

		this.mapModel.setMainPlayer(this.playerModel);

		// place NPCs
		const npcCount = options.npcCount ?? 150;
		const npcs = NPCFactory.createNRandomNPCs(npcCount);
		this.mapController.placeNPCs(npcs);
	}

	public getPlayerModel(): PlayerModel {
		return this.playerModel;
	}

	private renderOnce() {
		const vp = this.mapController.getViewport();
		const walls = this.mapController.getVisibleWalls();
		this.mapView.draw(this.layer, vp, walls);
		this.playerController.draw(this.layer, vp);
		this.mapController.drawNPCs(this.layer, vp);
	}

	public start() {
		if (this.started) return;
		this.started = true;

		// attach input handling
		this.playerController.attachKeyboardListeners(() => this.renderOnce());

		// initial render
		this.renderOnce();

		const loop = (timestamp: number) => {
			if (this.lastTimestamp == null) this.lastTimestamp = timestamp;
			const deltaSec = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
			this.lastTimestamp = timestamp;
			this.mapController.animateNPCs(deltaSec);
			this.playerController.updateFromInput(deltaSec);

			// check player death
			if (this.playerModel.getHealth() <= 0) {
				if (this.options.onPlayerDeath) this.options.onPlayerDeath();
				this.stop();
				return;
			}

			// check player level up
			if (this.playerModel.getExperience() >= 100) {
				if (this.options.onLevelComplete) this.options.onLevelComplete();
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
		// clear children we added to the layer
		try {
			this.layer.destroyChildren();
			this.layer.draw();
		} catch (e) {
			// ignore
		}
	}
}

export default GameScene;
