import { NPC } from './NPC';
import { Position } from '../types';
import { MapModel } from '../MapModel';

/**
 * NPCModel for storing the locations of each NPC
 * NPC is encapsulated into its own classes, with member functions for movement
 */
export class NPCModel {
    private npcs: NPC[];

    constructor() {
        this.npcs = Array.from({ length: 30 }, () => new NPC());
    }

    public getNPCs() : NPC[] {
        return this.npcs;
    }

    // public generateNPCLocations(map_model: MapModel, height: number, width: number): void {
    //     const padding = 5;
    //     const maxAttempts = 1000;
    //     this.npcs.forEach((npc: NPC) => {
    //         let attempts = 0;
    //         let x: number, y: number;
    //         x = 0;
    //         y = 0;

    //         do {
    //             console.log("The point x: " + x + ", y: " + y + " is inside a wall")
    //             x = Math.floor(Math.random() * (width - 2 * padding)) + padding;
    //             y = Math.floor(Math.random() * (height - 2 * padding)) + padding;
    //             attempts++;
    //         } while (map_model.isPointInsideWall(x, y) && attempts < maxAttempts);

    //         if (attempts < maxAttempts) {
    //             npc.position = {x, y};
    //         }
    //     });
    // }

    public generateNPCLocations(map_model: MapModel, height: number, width: number, npcRadius: number = 5): void {
        const maxAttempts = 1000;

        this.npcs.forEach((npc: NPC) => {
            let attempts = 0;
            let placed = false;

            while (!placed && attempts < maxAttempts) {
                attempts++;

                // pick a candidate point inside the world bounds
                const x = npcRadius + Math.random() * (width - 2 * npcRadius);
                const y = npcRadius + Math.random() * (height - 2 * npcRadius);

                // get only nearby walls using the spatial grid
                const nearbyWalls = map_model.getNearbyWalls(x, y);

                // check for overlap with nearby walls (expanded by NPC radius)
                const collides = nearbyWalls.some(wall => {
                    const bbox = map_model.bboxOfPoints(wall.points);
                    return !(
                        bbox.maxX + npcRadius < x || 
                        bbox.minX - npcRadius > x || 
                        bbox.maxY + npcRadius < y || 
                        bbox.minY - npcRadius > y
                    );
                });

                if (!collides) {
                    npc.position = { x, y };
                    placed = true;
                }
            }

            if (!placed) {
                console.warn(`Failed to place NPC after ${maxAttempts} attempts`);
            }
        });
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