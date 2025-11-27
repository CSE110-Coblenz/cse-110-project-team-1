import { describe, it, expect } from 'vitest';
import { Species } from 'src/common/types/Species';
import { PlayerModel } from 'src/main-game/PlayerModel';
import { NPCModel } from 'src/main-game/NPC/NPCModel';

describe('PlayerModel', () => {
	it('initializes with defaults and returns position/copy', () => {
		const p = new PlayerModel(Species.MOUSE, 10, 15);
		expect(p.getPosition()).toEqual({ x: 10, y: 15 });
		// modifying returned object should not change internal state
		const pos = p.getPosition();
		(pos as any).x = 999;
		expect(p.getPosition()).toEqual({ x: 10, y: 15 });
	});

	it('moves and sets position correctly', () => {
		const p = new PlayerModel(Species.MOUSE, 0, 0);
		p.moveBy(5, -3);
		expect(p.getPosition()).toEqual({ x: 5, y: -3 });
		p.setPosition(100, 200);
		expect(p.getPosition()).toEqual({ x: 100, y: 200 });
	});

	it('gets and sets speed and health', () => {
		const p = new PlayerModel(Species.MOUSE, 0, 0);
		p.setSpeed(250);
		expect(p.getSpeed()).toBe(250);
		p.setHealth(80);
		expect(p.getHealth()).toBe(80);
		p.setHealth(50);
		p.setSpeed(300);
		expect(p.getSpeed()).toBe(300);
		expect(p.getHealth()).toBe(50);
	});

	it('gets and sets experience correctly', () => {
		const p = new PlayerModel(Species.MOUSE, 0, 0);
		expect(p.getExperience()).toBe(0);
		p.setExperience(42);
		expect(p.getExperience()).toBe(42);
		p.setExperience(100);
		expect(p.getExperience()).toBe(100);
	});
	it('adds experience correctly with addExperience', () => {
		const p = new PlayerModel(Species.MOUSE, 0, 0);
		expect(p.getExperience()).toBe(0);
		p.addExperience(25);
		expect(p.getExperience()).toBe(25);
		p.addExperience(10);
		expect(p.getExperience()).toBe(35);
	});
	it('attacks correctly, such that it invokes addExperience', () => {
		const npc = new NPCModel(Species.BERRY_BUSH); // A prey of Mouse
		const p = new PlayerModel(Species.MOUSE); // A predator of Berry Bush
		p.setDamage(50);
		npc.setHealth(100);
		expect(p.getExperience()).toBe(0);
		// Should take 2 player hits to eat the Berry Bush
		p.tryAttack(npc);
		p.resetAttackCooldown();
		p.tryAttack(npc);
		p.resetAttackCooldown();
		expect(p.getExperience()).toBe(40);

		// These attacks shouldn't do anything because the npc is already dead
		p.tryAttack(npc);
		p.tryAttack(npc);
		expect(p.getExperience()).toBe(40);
	});
});
