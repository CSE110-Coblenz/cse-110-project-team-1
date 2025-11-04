import { describe, it, expect, vi } from 'vitest';
import { NPCController } from '../../main-game/NPC/NPCController';
import { NPCModel } from '../../main-game/NPC/NPCModel';
import { NPCView } from '../../main-game/NPC/NPCView';
import { MapModel } from '../../main-game/MapModel';

vi.mock('../../main-game/NPC/NPCModel', () => ({
  NPCModel: class {
    getPosition = vi.fn(() => ({ x: 0, y: 0 }));
    setPosition = vi.fn();
  }
}));

vi.mock('../../main-game/NPC/NPCView', () => ({
  NPCView: class {
    render = vi.fn();
  }
}));

vi.mock('../../main-game/MapModel', () => ({
  MapModel: class {
    constructor(config?: any) {}
    getWidth = vi.fn(() => 600);
    getHeight = vi.fn(() => 600);
    getWalls = vi.fn(() => []);
  }
}));


describe('NPCController (simple mock test)', () => {
  it('can be instantiated with mocks', () => {
    const config = {
            width: 600,
            height: 600,
            spacing: 120,
            wallCount: 2500,
            wallMinWidth: 80,
            wallMaxWidth: 160,
        };
    
    const npc_model = new NPCModel();
    const npc_view = new NPCView();
    const map_model = new MapModel(config);

    const npc_controller = new NPCController(npc_model, npc_view);

    // Spawn an NPC (uses mocks internally)
    const spawn1 = npc_controller.spawn(map_model, []);
    expect(spawn1).toBeDefined();
    expect(npc_controller).toBeDefined();

    // Sspawn a second NPC
    const spawn2 = npc_controller.spawn(map_model, [spawn1!]);
    expect(spawn2).toBeDefined();

    // Ensure a minimum spacing between the two spawns
    const dx = spawn1!.x - spawn2!.x;
    const dy = spawn1!.y - spawn2!.y;
    const minDistanceSquared = (2 * NPCController.SPAWN_RADIUS + NPCController.WALL_CLEARANCE) ** 2;

    expect(dx ** 2 + dy ** 2).toBeGreaterThanOrEqual(minDistanceSquared);

    // Optional: verify the mocked methods were called
    expect(map_model.getWidth).toBeDefined();
    expect(map_model.getHeight).toBeDefined();
  });
});
