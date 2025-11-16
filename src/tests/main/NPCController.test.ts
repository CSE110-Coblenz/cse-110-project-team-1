import { describe, it, expect, vi } from 'vitest';
import { NPCController } from 'src/main-game/NPC/NPCController';
import { NPCModel } from 'src/main-game/NPC/NPCModel';
import { NPCView } from 'src/main-game/NPC/NPCView';
import { MapModel } from 'src/main-game/MapModel';
import { Species } from 'src/common/types/Species';

vi.mock('../../main-game/NPC/NPCModel', () => ({
	NPCModel: class {
		getPosition = vi.fn(() => ({ x: 0, y: 0 }));
		setPosition = vi.fn();
	},
}));

vi.mock('../../main-game/NPC/NPCView', () => ({
	NPCView: class {
		render = vi.fn();
	},
}));

vi.mock('../../main-game/MapModel', () => ({
	MapModel: class {
		public walls: { points: { x: number; y: number }[] }[] = [
			{
				points: [
					{ x: 100, y: 100 },
					{ x: 150, y: 100 },
					{ x: 150, y: 150 },
					{ x: 100, y: 150 },
				],
			},
			{
				points: [
					{ x: 300, y: 300 },
					{ x: 400, y: 300 },
					{ x: 400, y: 400 },
					{ x: 300, y: 400 },
				],
			},
		];

		constructor(config?: any) {
			this.walls = [
				{
					points: [
						{ x: 100, y: 100 },
						{ x: 150, y: 100 },
						{ x: 150, y: 150 },
						{ x: 100, y: 150 },
					],
				},
				{
					points: [
						{ x: 300, y: 300 },
						{ x: 400, y: 300 },
						{ x: 400, y: 400 },
						{ x: 300, y: 400 },
					],
				},
			];
		}

		getWidth = vi.fn(() => 600);
		getHeight = vi.fn(() => 600);
		getWalls = vi.fn(() => this.walls);

		isPointInsideWall = vi.fn((px: number, py: number) => {
			for (const wall of this.walls) {
				const xs = wall.points.map((p) => p.x);
				const ys = wall.points.map((p) => p.y);
				const minX = Math.min(...xs);
				const maxX = Math.max(...xs);
				const minY = Math.min(...ys);
				const maxY = Math.max(...ys);
				if (px >= minX && px <= maxX && py >= minY && py <= maxY) return true;
			}
			return false;
		});
	},
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

		const npc_model = new NPCModel(Species.MOUSE);
		const npc_view = new NPCView();
		const map_model = new MapModel(config);

		const npc_controller = new NPCController(npc_model, npc_view);
		expect(npc_controller).toBeDefined();

		// Spawn an NPC (uses mocks internally)
		const spawn1 = npc_controller.spawn(map_model, []);
		expect(spawn1).toBeDefined();
		// Make sure its in bound with the map
		expect(spawn1!.x).toBeGreaterThanOrEqual(0);
		expect(spawn1!.x).toBeLessThanOrEqual(config.width);
		expect(spawn1!.y).toBeGreaterThanOrEqual(0);
		expect(spawn1!.y).toBeLessThanOrEqual(config.height);

		// --- Ensure not inside a wall ---
		const insideWall = map_model.isPointInsideWall(spawn1!.x, spawn1!.y);
		expect(insideWall).toBe(false);

		// Sspawn a second NPC
		const spawn2 = npc_controller.spawn(map_model, [spawn1!]);
		expect(spawn2).toBeDefined();
		// Make sure its in bound with the map
		expect(spawn2!.x).toBeGreaterThanOrEqual(0);
		expect(spawn2!.x).toBeLessThanOrEqual(config.width);
		expect(spawn2!.y).toBeGreaterThanOrEqual(0);
		expect(spawn2!.y).toBeLessThanOrEqual(config.height);

		// --- Ensure not inside a wall ---
		const insideWall2 = map_model.isPointInsideWall(spawn2!.x, spawn2!.y);
		expect(insideWall2).toBe(false);

		// Ensure a minimum spacing between the two spawns
		const dx = spawn1!.x - spawn2!.x;
		const dy = spawn1!.y - spawn2!.y;
		const minDistanceSquared = (2 * NPCController.SPAWN_RADIUS) ** 2;

		expect(dx ** 2 + dy ** 2).toBeGreaterThanOrEqual(minDistanceSquared);

		// Optional: verify the mocked methods were called
		expect(map_model.getWidth).toBeDefined();
		expect(map_model.getHeight).toBeDefined();
	});
});
