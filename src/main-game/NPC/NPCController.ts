import { NPCModel } from './NPCModel';
import { NPCView } from './NPCView';
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
