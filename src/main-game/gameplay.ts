import Konva from 'konva';
import { Position } from './types';
import { MapModel } from './Map/MapModel';
import { MapController } from './Map/MapController';
import { MapView } from './Map/MapView';
import { NPCView } from './NPC/NPCView';
import { NPCModel } from './NPC/NPCModel';
import { NPC } from './NPC/NPC';
import { NPCController } from './NPC/NPCController';

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

    const npc_view = new NPCView(layer);
    const map_view = new MapView(layer, '#8fb3d9');

    const npc_controller = new NPCController(npc_model, npc_view);
    const map_controller = new MapController(map_model, stage.width(), stage.height(), npc_controller);


    function render() {
        const vp = map_controller.getViewport();
        const walls = map_controller.getVisibleWalls();
        map_view.draw(vp, walls);
        npc_model.generateNPCLocations(map_model, worldHeight / 5, worldWidth / 5);
        npc_view.updateNPCShapes(npc_model.getNPCs());
        npc_view.draw();
    }

    render();

    function stop() {
        try { stage.destroy(); } catch (e) { /* ignore */ }
        if (div.parentElement) div.parentElement.removeChild(div);
    }

    return { stop };
}

export function stopGame(handle: GameHandle) {
    handle.stop();
}
