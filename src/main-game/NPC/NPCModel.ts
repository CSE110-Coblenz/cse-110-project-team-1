import { NPC } from './types';
import { Position } from '../types';

/**
 * NPCModel for storing the locations of each NPC
 * NPC is encapsulated into its own classes, with member functions for movement
 */
export class NPCModel {
    private npcs: NPC[];

    constructor() {
        this.npcs = [];
    }


    public getNPCLocations(): Position[]{
        let positions: Position[] = [];
        this.npcs.forEach((npc) => {
            positions.push(npc.getPosition());
        },);
        return positions;
    }

    public isNPCthere(): boolean {
        return true;
    }
}
