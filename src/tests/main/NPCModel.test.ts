import { describe, it, expect } from 'vitest';
import { Species } from 'src/common/types/Species';
import { NPCModel } from 'src/main-game/NPC/NPCModel';

describe('NPCModel', () => {
	it('initializes with defaults and returns position/copy', () => {
		const p = new NPCModel(Species.MOUSE);
		expect(p.getPosition()).toEqual({ x: 0, y: 0 });
		// modifying returned object should not change internal state
		const pos = p.getPosition();
		(pos as any).x = 999;
		expect(p.getPosition()).toEqual({ x: 0, y: 0 });
	});

	it('moves and sets position correctly', () => {
		const p = new NPCModel(Species.MOUSE);
		p.moveBy(5, -3);
		expect(p.getPosition()).toEqual({ x: 5, y: -3 });
		p.setPosition(100, 200);
		expect(p.getPosition()).toEqual({ x: 100, y: 200 });
	});

	it('gets and sets health', () => {
		const p = new NPCModel(Species.MOUSE);
		expect(p.getHealth()).toBe(50);
		p.setHealth(30);
		expect(p.getHealth()).toBe(30);
	});
});
