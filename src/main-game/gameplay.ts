import Konva from 'konva';
import { GameScene } from './GameScene';

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

    const scene = new GameScene(layer);
    scene.start();

    function stop() {
        scene.stop();
        try { stage.destroy(); } catch (e) { /* ignore */ }
        if (div.parentElement) div.parentElement.removeChild(div);
    }

    return { stop };
}

export function stopGame(handle: GameHandle) {
    handle.stop();
}
