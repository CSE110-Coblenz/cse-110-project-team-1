
import { NPCView } from './NPCView';
import { NPCModel } from './NPCModel';
import { NPCController } from './NPCController';
import { Species } from '../../../src/common/types/Species';



export class NPC {
    private readonly model: NPCModel;
    private readonly view: NPCView;
    private readonly controller: NPCController;

    private constructor(species: Species) {
        this.model = new NPCModel();
        this.view = new NPCView();
        this.controller = new NPCController(this.model, this.view);
    }

    static createNPCs(list_species: Species[]): NPC[] {
        let npcs: NPC[] = [];
        for (const species of list_species) {
            npcs.push(new NPC(species));
        }
        return npcs;
    }

    public getController(): NPCController {
        return this.controller;
    }

    public getModel(): NPCModel {
        return this.model;
    }

    public getView(): NPCView {
        return this.view;
    }
}
