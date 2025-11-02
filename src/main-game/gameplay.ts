import Konva from 'konva';
import { MapModel } from './MapModel';
import { MapController } from './MapController';
import { MapView } from './MapView';
import { PlayerModel } from './PlayerModel';
import { PlayerView } from './PlayerView';
import { PlayerController } from './PlayerController';

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
        wallCount: 1500,
        wallMinRadius: 30,
        wallMaxRadius: 160,
    };

    const model = new MapModel(config);

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

    const controller = new MapController(model, stage.width(), stage.height());
    const view = new MapView('#8fb3d9');

    const playerModel = new PlayerModel(Math.floor(model.getWidth() / 2), Math.floor(model.getHeight() / 2), 12, 800, 100, 'anteater');
    const playerView = new PlayerView('#ffcc00');
    const playerController = new PlayerController(playerModel, playerView, model, controller);

    function render() {
        const vp = controller.getViewport();
        const walls = controller.getVisibleWalls();
        view.draw(layer, vp, walls);
        playerController.draw(layer, vp);
        layer.batchDraw();
    }

    // attach input handling for player
    playerController.attachKeyboardListeners(render);

    render();

    function stop() {
        playerController.detachKeyboardListeners();
        try { stage.destroy(); } catch (e) { /* ignore */ }
        if (div.parentElement) div.parentElement.removeChild(div);
    }

    return { stop };
}

export function stopGame(handle: GameHandle) {
    handle.stop();
}
