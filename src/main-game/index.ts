import Konva from 'konva';
import { MapModel } from './MapModel';
import { MapController } from './MapController';
import { loadImages } from './ImageLoader';
import { MapView } from './MapView';

// expose a simple start/stop API so an external UI can mount/unmount the game
export interface GameHandle {
    stop: () => void;
}

export async function startGame(container: HTMLElement | null): Promise<GameHandle> {
    // world size: make it larger than the screen so it's an open world
    const worldWidth = Math.max(800, window.innerWidth * 3);
    const worldHeight = Math.max(600, window.innerHeight * 3);
    const config = {
        width: worldWidth,
        height: worldHeight,
        wallCount: 400,
        wallMinRadius: 30,
        wallMaxRadius: 160,
        seed: 12345
    };

    const model = new MapModel(config);

    // create Konva container div and stage
    const div = document.createElement('div');
    div.id = 'game-konva-container';
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

    const images = await loadImages({
        floor: 'assets/floor.png',
        wall: 'assets/wall.png'
    }).catch(() => new Map());


    // use the MapView (now Konva-capable) and draw into the Konva layer
    const view = new MapView('#8fb3d9', images);

    function render() {
        const vp = controller.getViewport();
        const walls = controller.getVisibleWalls();
        // keep original API: draw(ctxOrLayer, viewport, walls)
        view.draw(layer, vp, walls);
    }

    render();

    const keyHandler = (e: KeyboardEvent) => {
        const step = e.shiftKey ? 200 : 64;
        switch (e.key) {
            case 'ArrowUp':
                controller.moveUp(step);
                render();
                break;
            case 'ArrowDown':
                controller.moveDown(step);
                render();
                break;
            case 'ArrowLeft':
                controller.moveLeft(step);
                render();
                break;
            case 'ArrowRight':
                controller.moveRight(step);
                render();
                break;
        }
    };

    window.addEventListener('keydown', keyHandler);

    // handle resize: make canvas fullscreen and update controller viewport
    const resizeHandler = () => {
        stage.width(window.innerWidth);
        stage.height(window.innerHeight);
        // update viewport size
        controller.setViewportSize(stage.width(), stage.height());
        render();
    };
    window.addEventListener('resize', resizeHandler);


    function stop() {
        window.removeEventListener('keydown', keyHandler);
        window.removeEventListener('resize', resizeHandler);
        // destroy the Konva stage and remove its container
        try { stage.destroy(); } catch (e) { /* ignore */ }
        if (div.parentElement) div.parentElement.removeChild(div);
    }

    return { stop };
}

export function stopGame(handle: GameHandle) {
    handle.stop();
}
