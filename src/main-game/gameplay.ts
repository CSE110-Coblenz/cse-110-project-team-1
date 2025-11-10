import Konva from 'konva';
import { MapModel } from './MapModel';
import { MapController } from './MapController';
import { MapView } from './MapView';
import { PlayerModel } from './PlayerModel';
import { PlayerView } from './PlayerView';
import { PlayerController } from './PlayerController';
import { NPC, NPCFactory } from './NPC/NPC';
import { Species } from '../common/types/Species';
import { GameScreenView } from '../screens/GameScreen/GameScreenView';

// expose a simple start/stop API so an external UI can mount/unmount the game
export interface GameHandle {
	stop: () => void;
}

export async function startGame(container: HTMLElement | null): Promise<GameHandle> {
	const worldWidth = Math.max(800, window.innerWidth * 5);
	const worldHeight = Math.max(600, window.innerHeight * 5);
	const config = {
		width: worldWidth,
		height: worldHeight,
		spacing: 120,
		wallCount: 2500,
		wallMinWidth: 80,
		wallMaxWidth: 160,
	};

	const map_model = new MapModel(config);

	const div = document.createElement('div');
	div.id = 'main-game-konva-container';
	div.style.width = '100%';
	div.style.height = '100%';
	(container || document.body).appendChild(div);

	const stage = new Konva.Stage({
		container: div,
		width: window.innerWidth,
		height: window.innerHeight,
	});
	// Create two layers: one for game world, one for UI
	const gameLayer = new Konva.Layer();  // for map, player, NPCs
	const uiLayer = new Konva.Layer();    // for HUD and other UI elements
	// Add layers in order (game first, UI on top)
	stage.add(gameLayer);
	stage.add(uiLayer);

	const map_controller = new MapController(map_model, stage.width(), stage.height());
	const map_view = new MapView('#8fb3d9');

	let animationInterval: number | undefined;

	const playerModel = new PlayerModel(
		Math.floor(map_model.getWidth() / 2),
		Math.floor(map_model.getHeight() / 2),
		12,
		800,
		100,
		Species.ANTEATER,
	);
	const playerView = new PlayerView();
	const playerController = new PlayerController(
		playerModel,
		playerView,
		map_model,
		map_controller,
	);

	// create HUD and add it to the UI layer
	const gameHud = new GameScreenView(stage.width(), stage.height());
	uiLayer.add(gameHud.getGroup());
	gameHud.show(); // Explicitly make sure HUD is visible
	console.log('HUD Debug - Initial state:', {
		visible: gameHud.getGroup().visible(),
		zIndex: gameHud.getGroup().zIndex(),
		position: {
			x: gameHud.getGroup().x(),
			y: gameHud.getGroup().y()
		}
	});
	uiLayer.draw(); // Force immediate draw

	// respond to window resize: update stage and recompute HUD layout
	const resizeHandler = () => {
		try {
			stage.width(window.innerWidth);
			stage.height(window.innerHeight);
			gameHud.resize(stage.width(), stage.height());
			render();
		} catch (e) {
			// swallow
		}
	};
	window.addEventListener('resize', resizeHandler);

	function render() {
		const vp = map_controller.getViewport();
		console.log('Viewport state:', {
			viewport: vp,
			layerOffset: {
				x: gameLayer.x(),
				y: gameLayer.y()
			}
		});

		const walls = map_controller.getVisibleWalls();
		map_view.draw(gameLayer, vp, walls);
		playerController.draw(gameLayer, vp);
		map_controller.drawNPCs(gameLayer, vp);

		console.log('MapView transforms:', {
			x: gameLayer.x(),
			y: gameLayer.y(),
			scale: gameLayer.scale(),
			offset: gameLayer.offset()
		});

		// Update HUD on UI layer (no viewport offset needed)
		try {
			const health = playerModel.getHealth();
			console.log('Setting HUD health:', health);
			gameHud.setHealth(health);
			uiLayer.batchDraw();
		} catch (e) {
			console.error('HUD error:', e);
		}
		gameLayer.batchDraw();
	}

	// attach input handling for player
	playerController.attachKeyboardListeners(render);

	let npcs: NPC[] = NPCFactory.createNRandomNPCs(150);
	map_controller.placeNPCs(npcs);
	render();

	let lastTimestamp: number | null = null;

	function gameLoop(timestamp: number) {
		if (lastTimestamp == null) lastTimestamp = timestamp;
		const deltaSec = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
		lastTimestamp = timestamp;
		map_controller.animateNPCs(deltaSec);
		playerController.updateFromInput(deltaSec);
		render();
		animationInterval = requestAnimationFrame(gameLoop);
	}
	animationInterval = requestAnimationFrame(gameLoop);

	function stop() {
		playerController.detachKeyboardListeners();
		if (animationInterval !== undefined) {
			clearInterval(animationInterval);
			animationInterval = undefined;
		}
		// remove resize listener
		try {
			window.removeEventListener('resize', resizeHandler);
		} catch (e) {
			/* ignore */
		}
		try {
			stage.destroy();
		} catch (e) {
			/* ignore */
		}
		if (div.parentElement) div.parentElement.removeChild(div);
	}

	return { stop };
}

export function stopGame(handle: GameHandle) {
	handle.stop();
}
