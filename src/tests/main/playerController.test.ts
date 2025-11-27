import { describe, it, expect, vi } from 'vitest';
import { PlayerModel } from 'src/main-game/PlayerModel';
import { PlayerView } from 'src/main-game/PlayerView';
import { Species } from 'src/common/types/Species';
import { PlayerController } from 'src/main-game/PlayerController';
import { MapModel } from 'src/main-game/MapModel';
import { MapController } from 'src/main-game/MapController';

describe('PlayerController (movement & collision)', () => {
	it('moves when destination is clear and within bounds', () => {
		const player = new PlayerModel(Species.MOUSE, 50, 50);
		const view = new PlayerView(Species.MOUSE);
		const mapMock = {
			getWidth: () => 200,
			getHeight: () => 200,
			isPointInsideWall: (_x: number, _y: number) => false,
		} as unknown as MapModel;
		const controllerMock = { centerOn: vi.fn() } as unknown as MapController;

		const pc = new PlayerController(player, view, mapMock, controllerMock);
		const moved = pc.tryMove(10, 0);
		expect(moved).toBe(true);
		expect(player.getPosition()).toEqual({ x: 60, y: 50 });
	});

	it('prevents movement that would go out of world bounds', () => {
		const player = new PlayerModel(Species.MOUSE, 190, 100);
		const view = new PlayerView(Species.MOUSE);
		const mapMock = {
			getWidth: () => 200,
			getHeight: () => 200,
			isPointInsideWall: (_x: number, _y: number) => false,
		} as unknown as MapModel;
		const controllerMock = { centerOn: vi.fn() } as unknown as MapController;

		const pc = new PlayerController(player, view, mapMock, controllerMock);
		const moved = pc.tryMove(20, 0); // would push x to 210, beyond width
		expect(moved).toBe(false);
		expect(player.getPosition()).toEqual({ x: 190, y: 100 });
	});

	it('prevents movement that would intersect a wall', () => {
		const player = new PlayerModel(Species.MOUSE, 50, 50);
		const view = new PlayerView(Species.MOUSE);
		const mapMock = {
			getWidth: () => 200,
			getHeight: () => 200,
			isPointInsideWall: (px: number, py: number) => {
				// pretend there is a vertical wall at x >= 65 and y around 50
				return px >= 65 && Math.abs(py - 50) <= 5;
			},
		} as unknown as MapModel;
		const controllerMock = { centerOn: vi.fn() } as unknown as MapController;

		const pc = new PlayerController(player, view, mapMock, controllerMock);
		const moved = pc.tryMove(20, 0); // target x = 70
		expect(moved).toBe(false);
		expect(player.getPosition()).toEqual({ x: 50, y: 50 });
	});
});
