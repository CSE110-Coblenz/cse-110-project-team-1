import { NPCModel } from './NPCModel';
import { NPCView } from './NPCView';
import { MapModel } from '../MapModel';

import { Viewport } from '../types'

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

    // public populateNPCS(map_model: MapModel, height: number, width: number): void {
    //     this.model.generateNPCLocations(map_model, height, width);

    //     this.view.updateNPCShapes(this.model.getNPCs());
    // }


    public animate(): void {
        this.model.circle();
    }

    public draw(target: CanvasRenderingContext2D | any, viewport: Viewport) {
        this.view.draw(target, viewport, this.model.getPosition(), this.model.getDirection(), this.model.radius);
    }
    
}
