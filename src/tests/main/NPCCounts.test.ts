/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

import { NPCFactory } from 'src/main-game/NPC/NPC';
import {
	Species,
	PRODUCERS,
	PRIMARY_CONSUMERS,
	SECONDARY_CONSUMERS,
	TERTIARY_CONSUMERS,
	APEX_PREDATORS,
} from 'src/common/types/Species';

const indexFor = (species: Species) => {
	if (PRODUCERS.includes(species)) return 0;
	if (PRIMARY_CONSUMERS.includes(species)) return 1;
	if (SECONDARY_CONSUMERS.includes(species)) return 2;
	if (TERTIARY_CONSUMERS.includes(species)) return 3;
	if (APEX_PREDATORS.includes(species)) return 4;
	return -1;
};

const countByGroup = (npcs: ReturnType<typeof NPCFactory.createFairSpreadNPCs>) => {
	const counts = [0, 0, 0, 0, 0];
	for (const npc of npcs) {
		const idx = indexFor(npc.getModel().getSpecies());
		if (idx >= 0) counts[idx]++;
	}
	return counts;
};

const minQuota = (n: number) => Math.max(1, Math.floor(n * 0.08));
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

describe('NPCFactory.createFairSpreadNPCs totals & validation', () => {
	it.each([25, 50, 75, 100])('produces %i NPCs', (n) => {
		const npcs = NPCFactory.createFairSpreadNPCs(n);
		expect(npcs).toHaveLength(n);
		expect(sum(countByGroup(npcs))).toBe(n);
	});

	it('throws if n is not divisible by 5', () => {
		expect(() => NPCFactory.createFairSpreadNPCs(26)).toThrow(/divisible by 5/i);
	});
});

describe('NPCFactory.createFairSpreadNPCs prey floors', () => {
	it('default distribution keeps primary/secondary quota', () => {
		const n = 50;
		const quota = minQuota(n);
		const counts = countByGroup(NPCFactory.createFairSpreadNPCs(n));
		expect(counts[1]).toBeGreaterThanOrEqual(quota);
		expect(counts[2]).toBeGreaterThanOrEqual(quota);
	});

	it('secondary player enforces primary quota', () => {
		const n = 50;
		const quota = minQuota(n);
		const counts = countByGroup(
			NPCFactory.createFairSpreadNPCs(n, {
				playerSpecies: SECONDARY_CONSUMERS[0],
				preyDepth: 1,
			}),
		);
		expect(counts[1]).toBeGreaterThanOrEqual(quota);
	});

	it('apex player enforces tertiary quota', () => {
		const n = 50;
		const quota = minQuota(n);
		const counts = countByGroup(
			NPCFactory.createFairSpreadNPCs(n, {
				playerSpecies: APEX_PREDATORS[0],
				preyDepth: 1,
			}),
		);
		expect(counts[3]).toBeGreaterThanOrEqual(quota);
	});

	it('apex player with depth=2 covers tertiary and secondary', () => {
		const n = 50;
		const quota = minQuota(n);
		const counts = countByGroup(
			NPCFactory.createFairSpreadNPCs(n, {
				playerSpecies: APEX_PREDATORS[0],
				preyDepth: 2,
			}),
		);
		expect(counts[3]).toBeGreaterThanOrEqual(quota);
		expect(counts[2]).toBeGreaterThanOrEqual(quota);
	});

	it('primary player enforces producer quota', () => {
		const n = 50;
		const quota = minQuota(n);
		const counts = countByGroup(
			NPCFactory.createFairSpreadNPCs(n, {
				playerSpecies: PRIMARY_CONSUMERS[0],
			}),
		);
		expect(counts[0]).toBeGreaterThanOrEqual(quota);
	});

	it('producer player just preserves totals', () => {
		const n = 50;
		const counts = countByGroup(
			NPCFactory.createFairSpreadNPCs(n, {
				playerSpecies: PRODUCERS[0],
			}),
		);
		expect(sum(counts)).toBe(n);
	});

	it('never zeroes any group while enforcing floors', () => {
		const counts = countByGroup(
			NPCFactory.createFairSpreadNPCs(50, {
				playerSpecies: APEX_PREDATORS[0],
				preyDepth: 2,
			}),
		);
		for (const c of counts) expect(c).toBeGreaterThanOrEqual(1);
	});
});
