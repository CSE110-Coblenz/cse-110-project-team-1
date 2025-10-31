import { NPCModel } from './NPCModel';
import { NPCView } from './NPCView';

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

    }
}
