
import { NPCView } from './NPCView';
import { NPCModel } from './NPCModel';
import { NPCController } from './NPCController';
import { ALL_SPECIES, Species } from '../../../src/common/types/Species';



export class NPC {
    private readonly model: NPCModel;
    private readonly view: NPCView;
    private readonly controller: NPCController;

    public constructor(species: Species) {
        this.model = new NPCModel();
        this.view = new NPCView();
        this.controller = new NPCController(this.model, this.view);
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


export class NPCFactory{

    static createNRandomNPCs(num_npcs: number): NPC[] {
        const species_list: Species[] = Array.from({ length: num_npcs }, () => 
            ALL_SPECIES[Math.floor(Math.random() * ALL_SPECIES.length)]
        );
        let npcs: NPC[] = [];
        for (const species of species_list) {
            npcs.push(new NPC(species));
        }
        return npcs;
    }
}
