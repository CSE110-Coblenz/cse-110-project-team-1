import { describe, it, expect, vi } from 'vitest';
import { Species } from '../../main-game/types';
import { NPCModel } from '../../main-game/NPC/NPCModel';
import { populateNPCs } from '../../main-game/gameplay';
import { NPCView } from '../../main-game/NPC/NPCView';
import { NPCController } from '../../main-game/NPC/NPCController';
import { MapModel } from '../../main-game/MapModel';
import { MapController } from '../../main-game/MapController';

describe('NPCController (movement & collision)', () => {
    it('correctly spawns NPCs with a minimum distance between them', () => {
        const npc_model = new NPCModel(50, 50, 10, 100, 100, Species.TEST);
        const npc_view = new NPCView();
        const config = {
            width: 600,
            height: 600,
            spacing: 120,
            wallCount: 2500,
            wallMinWidth: 80,
            wallMaxWidth: 160,
        };
        const map_model = new MapModel(config); // adjust constructor as needed
        const map_controller = new MapController(map_model, 200, 150);

        const npc_controller = new NPCController(npc_model, npc_view);

        // Spawn a single NPC
        const pos = npc_controller.spawn(map_model, []);
        expect(pos).toBeDefined();
        expect(pos!.x).toBeGreaterThanOrEqual(NPCController.SPAWN_RADIUS);
        expect(pos!.x).toBeLessThanOrEqual(map_model.getWidth() - NPCController.SPAWN_RADIUS);
        expect(pos!.y).toBeGreaterThanOrEqual(NPCController.SPAWN_RADIUS);
        expect(pos!.y).toBeLessThanOrEqual(map_model.getHeight() - NPCController.SPAWN_RADIUS);


        // Spawn a set of NPCs through the Map Controller, calls NPCController.spawn() per NPC
        map_controller.placeNPCs(populateNPCs(20));
        const minDistanceSquared = (2 * NPCController.SPAWN_RADIUS + NPCController.WALL_CLEARANCE)**2;
        // check all pairs
        const npcs = map_controller.getNPCs();
        for (let i = 0; i < npcs.length; i++) {
            for (let j = i + 1; j < npcs.length; j++) {
                const dx = npcs[i].getModel().getPosition().x - npcs[j].getModel().getPosition().x;
                const dy = npcs[i].getModel().getPosition().y - npcs[j].getModel().getPosition().y;
                expect(dx**2 + dy**2).toBeGreaterThanOrEqual(minDistanceSquared);
            }
        }

    });

});
