import Konva from 'konva';
import { GameScene } from 'src/main-game/GameScene';
import { Species, pickSpeciesForLevel } from 'src/common/types/Species';

// expose a simple start/stop API so an external UI can mount/unmount the game
export interface GameHandle {
	stop: () => void;
}

export async function startGame(container: HTMLElement | null): Promise<GameHandle> {
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

	// implement a 4-level progression
	let scene: GameScene | undefined;
	let currentLevel = 1;
	const maxLevels = 4;

	function startLevel(level: number) {
		if (scene) {
			scene.stop();
			scene = undefined;
		}
		const species = pickSpeciesForLevel(level);
		scene = new GameScene(layer, {
			levelNumber: level,
			species,
			onLevelComplete: () => {
				if (level < maxLevels) startLevel(level + 1);
				else {
					scene?.stop();
				}
			},
			onPlayerDeath: () => {
				scene?.stop();
			},
		});
		scene.start();
	}

	// start first level
	startLevel(currentLevel);

	function stop() {
		scene?.stop();
		stage?.destroy();
		div.parentElement?.removeChild(div);
	}

	return { stop };
}

export function stopGame(handle: GameHandle) {
	handle.stop();
}
