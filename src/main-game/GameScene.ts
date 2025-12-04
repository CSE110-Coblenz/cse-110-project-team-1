import { MapModel } from 'src/main-game/MapModel';
import { MapController } from 'src/main-game/MapController';
import { MapView } from 'src/main-game/MapView';
import { PlayerModel } from 'src/main-game/PlayerModel';
import { PlayerView } from 'src/main-game/PlayerView';
import { PlayerController } from 'src/main-game/PlayerController';
import { NPCFactory } from 'src/main-game/NPC/NPC';
import { Species, SpeciesAttributesMap } from 'src/common/types/Species';
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
		speed: number;
		damage: number;
	}) => void;
};

export class GameScene {
	private layer: Layer;
	private mapModel: MapModel;
	private mapController: MapController;
	private mapView!: MapView;
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

		const bgImg = new Image();
		bgImg.src = 'main-game-background.png';
		this.mapController = new MapController(this.mapModel, vpW, vpH);

		this.mapView = new MapView(bgImg);
		bgImg.onload = () => {
			this.mapView = new MapView(bgImg);
		};

		// Player (new API: species, x, y)
		const startX = Math.floor(this.mapModel.getWidth() / 2);
		const startY = Math.floor(this.mapModel.getHeight() / 2);
		this.playerModel = new PlayerModel(this.options.species ?? Species.MOUSE, startX, startY);
		this.playerView = new PlayerView(this.options.species ?? Species.MOUSE);
		this.playerController = new PlayerController(
			this.playerModel,
			this.playerView,
			this.mapModel,
			this.mapController,
		);

		this.mapModel.setMainPlayer(this.playerModel);

		// NPCs
		const npcs = NPCFactory.createNRandomNPCs(options.npcCount ?? 100);
		this.mapController.placeNPCs(npcs);
	}

	public getPlayerModel(): PlayerModel {
		return this.playerModel;
	}

	public getUniqueNPCSpecies(): Species[] {
		const npcs = this.mapModel.getNPCs();
		const allSpecies = npcs.map((npc) => npc.getModel().getSpecies());
		return [...new Set(allSpecies)];
	}

	public getAllLevelSpecies(): Species[] {
		const playerSpecies = this.playerModel.getSpecies();
		const npcSpecies = this.getUniqueNPCSpecies();
		return [...new Set([playerSpecies, ...npcSpecies])];
	}

	private pushHud() {
		const progress = this.playerModel.getExperience?.() ?? 0; // expect 0..100
		const level = this.options.levelNumber ?? 1;
		const rawHealth = this.playerModel.getHealth?.() ?? 0;
		const species = this.playerModel.getSpecies?.() ?? Species.MOUSE;
		const maxHealth = SpeciesAttributesMap.get(species)?.health ?? 100;
		const health = Math.floor((100 * rawHealth) / maxHealth);
		const speed = this.playerModel.getSpeed();
		const damage = this.playerModel.getDamage();
		this.options.onHudUpdate?.({ health, progress, level, species, speed, damage });
	}

	private renderOnce() {
		const vp = this.mapController.getViewport();
		const walls = this.mapController.getVisibleWalls();

		this.mapView!.draw(this.layer, vp, walls);
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
