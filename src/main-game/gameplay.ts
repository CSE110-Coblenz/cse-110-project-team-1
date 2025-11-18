import Konva from 'konva';
import { GameScreenView } from 'src/screens/GameScreen/GameScreenView';
import GameScene, { GameSceneOptions } from 'src/main-game/GameScene';

export interface GameHandle {
  stop: () => void;
}

export async function startGame(
  container: HTMLElement | null,
  sceneOptions: GameSceneOptions = {}
): Promise<GameHandle> {
  // Mount container
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

  // Layers: world under HUD
  const gameLayer = new Konva.Layer();
  const uiLayer = new Konva.Layer();
  stage.add(gameLayer);
  stage.add(uiLayer);

  // HUD
  const hud = new GameScreenView(stage.width(), stage.height());
  uiLayer.add(hud.getGroup());
  hud.show();
  uiLayer.draw();


  const scene = new GameScene(gameLayer, {
    ...sceneOptions,
    onHudUpdate: ({ health }) => {
      hud.setHealth(health);
      uiLayer.batchDraw();
    },
  });
  scene.start();

  // Resize stage + HUD + scene viewport
  const resizeHandler = () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    hud.resize(stage.width(), stage.height());
  };
  window.addEventListener('resize', resizeHandler);

  function stop() {
    try {
      window.removeEventListener('resize', resizeHandler);
    } catch {}
    try {
      scene.stop();
    } catch {}
    try {
      stage.destroy();
    } catch {}
    if (div.parentElement) div.parentElement.removeChild(div);
  }

  return { stop };
}

export function stopGame(handle: GameHandle) {
  handle.stop();
}
