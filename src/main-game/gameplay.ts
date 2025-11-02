import Konva from 'konva';
import { MapModel } from './MapModel';
import { MapController } from './MapController';
import { MapView } from './MapView';
import { PlayerModel } from './PlayerModel';
import { PlayerView } from './PlayerView';
import { PlayerController } from './PlayerController';
import { NPCView } from './NPC/NPCView';
import { NPCModel } from './NPC/NPCModel';
import { NPCController } from './NPC/NPCController';

// expose a simple start/stop API so an external UI can mount/unmount the game
export interface GameHandle {
    stop: () => void;
}

export async function startGame(container: HTMLElement | null): Promise<GameHandle> {
    // const worldWidth = Math.max(800, window.innerWidth * 5);
    // const worldHeight = Math.max(600, window.innerHeight * 5);
    // For testing purposes, test the spawning within the current window
    const worldWidth = Math.max(800, window.innerWidth);
    const worldHeight = Math.max(600, window.innerHeight);
    const config = {
        width: worldWidth,
        height: worldHeight,
        spacing: 120,
        wallCount: 2500,
        wallMinWidth: 80,
        wallMaxWidth: 160,
    };

    const npc_model = new NPCModel();
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

    const controller = new MapController(map_model, stage.width(), stage.height());
    const npc_view = new NPCView(layer);
    const map_view = new MapView('#8fb3d9');

    const npc_controller = new NPCController(npc_model, npc_view);
    const map_controller = new MapController(map_model, stage.width(), stage.height());


    const playerModel = new PlayerModel(Math.floor(map_model.getWidth() / 2), Math.floor(map_model.getHeight() / 2), 12, 800, 100, 'anteater');
    const playerView = new PlayerView();
    const playerController = new PlayerController(playerModel, playerView, map_model, controller);

    function render() {
        const vp = controller.getViewport();
        const walls = controller.getVisibleWalls();
        playerController.draw(layer, vp);
        layer.batchDraw();

        map_view.draw(layer, vp, walls);
        npc_controller.populateNPCS(map_model, worldHeight, worldWidth);
        npc_view.draw();
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
