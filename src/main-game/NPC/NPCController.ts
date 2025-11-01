import { NPCModel } from './NPCModel';
import { NPCView } from './NPCView';
import { MapModel } from '../MapModel';
import { Position, Wall } from '../types';
import { NPC } from './NPC';

/**
 * NPCController manages the locations, animations, and interactions between NPCs
 * It controls the NPCModel which stores the data of each NPC, and the NPCView which displays
 * the NPCs onto the screen
 */
export class NPCController {
    private model: NPCModel;
    private view: NPCView;

    constructor(model: NPCModel, view: NPCView) {
        this.model = model;
        this.view = view;

    }

    public populateNPCS(map_model: MapModel, height: number, width: number): void {
        this.model.generateNPCLocations(map_model, height, width);
        this.view.updateNPCShapes(this.model.getNPCs());
    }

    private animateNPCs(): void {
        this.model.getNPCs().forEach((npc) => {
            npc.animate();
        },);
    }

    public moveNPCsDown(): void {
        this.model.getNPCs().forEach((npc) => {
            npc.moveDown();
        },);
    }

    public moveNPCsUp(): void {
        this.model.getNPCs().forEach((npc) => {
            npc.moveUp();
        },);
    }

    public moveNPCsLeft(): void {
        this.model.getNPCs().forEach((npc) => {
            npc.moveLeft();
        },);
    }

    public moveNPCsRight(): void {
        this.model.getNPCs().forEach((npc) => {
            npc.moveRight();
        },);
    }
}
