import Konva from 'konva';
import { MapModel } from 'src/main-game/MapModel';
import { MapController } from 'src/main-game/MapController';
import { MapView } from 'src/main-game/MapView';
import { PlayerModel } from 'src/main-game/PlayerModel';
import { PlayerView } from 'src/main-game/PlayerView';
import { PlayerController } from 'src/main-game/PlayerController';
import { NPC, NPCFactory } from 'src/main-game/NPC/NPC';
import { Species } from 'src/common/types/Species';

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
	const layer = new Konva.Layer();
	stage.add(layer);

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

	function render() {
		const vp = map_controller.getViewport();
		const walls = map_controller.getVisibleWalls();
		map_view.draw(layer, vp, walls);
		playerController.draw(layer, vp);
		map_controller.drawNPCs(layer, vp);
		layer.batchDraw();
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
