import type { Screen, ScreenSwitcher, ScreenController } from "../types";
import type { Layer } from "konva/lib/Layer";
import { GameScreenController } from "./GameScreen/GameScreenController";
import { MenuScreenController } from "./MenuScreen/MenuScreenController";
import { ResultScreenController } from "./ResultScreen/ResultScreenController";
import { IntroScreenController } from "./IntroScreen/IntroScreenController";
import { CookingScreenController } from "./CookingScreen/CookingScreenController";

/**
 * ScreenManager: simple manager that switches between screens.
 * Implementation notes:
 * - Keeps a reference to the current ScreenController
 * - Calls hide() on the outgoing screen and show() on the incoming
 * - For now supports "game" screen; other screen types are stubs
 */
export class ScreenManager implements ScreenSwitcher {
  private current: ScreenController | null = null;
  private layer?: Layer;

  /**
   * Create a ScreenManager. Optionally pass a Konva Layer that screens
   * will be mounted into when created.
   */
  constructor(layer?: Layer) {
    this.layer = layer;
  }

  switchToScreen(screen: Screen): void {
    // Hide and dispose the current screen (if any), then drop it
    if (this.current) {
      this.current.hide();
      this.current.dispose();
      this.current = null;
    }

    // Decide which screen to create based on the screen type
    switch (screen.type) {
      case "game": {
        // create the game screen and start it
        const controller = new GameScreenController(this);
        this.current = controller as unknown as ScreenController;
        // Mount the controller to the layer (if provided)
        this.current.mount(this.layer);
        // If the controller exposes a start method, call it 
        if (typeof (controller as any).startGame === "function") {
          (controller as any).startGame();
        } else {
          controller.show();
        }
        break;
      }
      case "menu": {
        // create and show menu
        const menuController = new MenuScreenController();
        this.current = menuController as unknown as ScreenController;
        this.current.mount(this.layer);
        menuController.show();
        break;
      }
      case "result": {
        // create and show result screen (passes score)
        const score = (screen as any).score ?? 0;
        const resultController = new ResultScreenController(score);
        this.current = resultController as unknown as ScreenController;
        this.current.mount(this.layer);
        resultController.show();
        break;
      }
      case "intro": {
        const introController = new IntroScreenController(this);
        this.current = introController as unknown as ScreenController;
        this.current.mount(this.layer);
        introController.show();
        break;
      }
      case "cooking": {
        const cookingController = new CookingScreenController(this);
        this.current = cookingController as unknown as ScreenController;
        this.current.mount(this.layer);
        cookingController.show();
        break;
      }
      default:
        console.warn("Unknown screen type", screen);
    }
  }
}

export default ScreenManager;
