
import { NPCView } from './NPCView';
import { NPCModel } from './NPCModel';
import { NPCController } from './NPCController';
import { Species } from '../types';


export class NPC {
    private readonly model: NPCModel;
    private readonly view: NPCView;
    private readonly controller: NPCController;

    private constructor(species: Species) {
        this.model = new NPCModel();
        this.view = new NPCView();
        this.controller = new NPCController(this.model, this.view);
    }

    static create(species: Species): NPC {
        return new NPC(species);
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
