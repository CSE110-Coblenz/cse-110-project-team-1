import Konva from 'konva';
import { GameScreenView  } from 'src/screens/GameScreen/GameScreenView';
import { GameScene, GameSceneOptions } from 'src/main-game/GameScene';
import { pickSpeciesForLevel } from 'src/common/types/Species';

export interface GameHandle { stop: () => void; }

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

  // Two layers: world (bottom), UI (top)
  const worldLayer = new Konva.Layer();
  const uiLayer = new Konva.Layer();
  stage.add(worldLayer);
  stage.add(uiLayer);

  // HUD on its own layer
  const hud = new GameScreenView(stage.width(), stage.height());
  uiLayer.add(hud.getGroup());
  hud.show();
  uiLayer.draw();

  let scene: GameScene | undefined;
  const maxLevels = 4;

  function startLevel(level: number) {
    scene?.stop(); scene = undefined;

    scene = new GameScene(worldLayer, {
      levelNumber: level,
      species: pickSpeciesForLevel(level),
      onHudUpdate: ({ health }) => {          // 👈 drives HUD every frame
        hud.setHealth(health);
        uiLayer.batchDraw();
      },
      onLevelComplete: () => {
        if (level < maxLevels) startLevel(level + 1);
        else scene?.stop();
      },
      onPlayerDeath: () => scene?.stop(),
    } satisfies GameSceneOptions);

    scene.start();
  }

  startLevel(1);

  const onResize = () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    hud.resize(stage.width(), stage.height());
    uiLayer.batchDraw();
  };
  window.addEventListener('resize', onResize, { passive: true });

  function stop() {
    try { window.removeEventListener('resize', onResize); } catch {}
    try { scene?.stop(); } catch {}
    try { stage.destroy(); } catch {}
    div.parentElement?.removeChild(div);
  }

  return { stop };
}

export function stopGame(handle: GameHandle) { handle.stop(); }
