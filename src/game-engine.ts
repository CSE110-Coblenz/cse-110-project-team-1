import Konva from "konva";
import ScreenManager from "./screens/ScreenManager";

type difficulty = "easy" | "medium" | "hard";
type ecosystem = "forest" | "desert" | "ocean";
function loadAnimalsForEcosystem(ecosystem: ecosystem): string[] {
    const animalDatabase: { [key in ecosystem]: string[] } = {
        forest: ["deer", "fox", "bear"],
        desert: ["camel", "scorpion", "lizard"],
        ocean: ["fish", "shark", "dolphin"],
    };
    return animalDatabase[ecosystem];
}

export class Game {
    screenManager: ScreenManager;

    constructor(num_organisms: number, difficulty_level: difficulty, ecosystem: ecosystem) {
        console.log("Game initialized");
        const width = window.innerWidth * 0.95
        const height = window.innerHeight * 0.95
        const stage = new Konva.Stage({
            container: "container",
            width: width,
            height: height,
        });
        const layer = new Konva.Layer();
        stage.add(layer);

        this.screenManager = new ScreenManager(layer);
        // start after screenManager is ready
        this.start(num_organisms, difficulty_level, ecosystem);
    }

    start(num_organisms: number, difficulty_level: difficulty, ecosystem: ecosystem) {
        console.log("Game started");
        const levels = num_organisms;
        const animals = loadAnimalsForEcosystem(ecosystem);

        this.runGameLoop(this.screenManager);

    }
    /* 
    ===Standard Game Loop Definition===
        - Tutorial Screen 1
        - Tutorial Screen 2
        - Tutorial Screen 3
        - Story Screen 1
        - Main Gameplay (animal 1)
        - Cooking (animal 1)
        - Story Screen 2
        - Main Gameplay (animal 2)
        - Cooking (animal 2)
        - Story Screen 3
        - Main Gameplay (animal 3)
        - Cooking (animal 3)
        - Main Gameplay (animal n)
        - Cooking (animal n)
        - Ending Screen
        - Return to Main Menu
       =====If Player Dies=====
        - Death Screen
        - Return to Main Menu
    */
    runGameLoop(screenManager: ScreenManager) {
        console.log("Game loop running");
        screenManager.switchToScreen({ type: "menu" });
    }

    victory() {
        console.log("Player has won the game!");
        this.screenManager.switchToScreen({ type: "victory" });
    }

    gameOver() {
        console.log("Game Over!");
        this.screenManager.switchToScreen({ type: "death" });
    }

    end() {
        console.log("Game ended");
    }
}