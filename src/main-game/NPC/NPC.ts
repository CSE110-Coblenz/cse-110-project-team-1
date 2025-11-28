import { NPCView } from 'src/main-game/NPC/NPCView';
import { NPCModel } from 'src/main-game/NPC/NPCModel';
import { NPCController } from 'src/main-game/NPC/NPCController';
import {
	ALL_SPECIES,
	Species,
	PRODUCERS,
	PRIMARY_CONSUMERS,
	SECONDARY_CONSUMERS,
	TERTIARY_CONSUMERS,
	APEX_PREDATORS,
} from 'src/common/types/Species';

export class NPC {
	private readonly model: NPCModel;
	private readonly view: NPCView;
	private readonly controller: NPCController;

	public constructor(species: Species) {
		this.model = new NPCModel(species);
		this.view = new NPCView(species);
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

export class NPCFactory {
	static createNRandomNPCs(num_npcs: number): NPC[] {
		const species_list: Species[] = Array.from(
			{ length: num_npcs },
			() => ALL_SPECIES[Math.floor(Math.random() * ALL_SPECIES.length)],
		);
		const npcs: NPC[] = [];
		for (const species of species_list) {
			npcs.push(new NPC(species));
		}
		return npcs;
	}

	/**
	 * Create a fair, realistic ecosystem of NPCs.
	 * ok now hopefully will have enough prey per level for player
	 */
	static createFairSpreadNPCs(
		num_npcs: number,
		options?: {
			minPreyPerGroup?: number;
			playerSpecies?: Species;  
			preyDepth?: 1 | 2;    // how much down i should go    
		}
	): NPC[] {
		if (num_npcs % 5 !== 0) {
			throw new Error('Number of NPCs must be divisible by 5');
		}

		const groups: Species[][] = [
			PRODUCERS,
			PRIMARY_CONSUMERS,
			SECONDARY_CONSUMERS,
			TERTIARY_CONSUMERS,
			APEX_PREDATORS,
		];

		const distribution = [10, 6, 4, 3, 2];
		const scale = num_npcs / 25;

		// help find which prey to make more of
		const findGroupIndex = (s: Species): number => {
			if (PRODUCERS.includes(s)) return 0;
			if (PRIMARY_CONSUMERS.includes(s)) return 1;
			if (SECONDARY_CONSUMERS.includes(s)) return 2;
			if (TERTIARY_CONSUMERS.includes(s)) return 3;
			if (APEX_PREDATORS.includes(s)) return 4;
			return -1; // hoping to not get here lol
		};

		const counts = distribution.map((v) => Math.round(v * scale));

		// Normalize rounding drift
		let total = counts.reduce((a, b) => a + b, 0);
		if (total !== num_npcs) {
			let diff = num_npcs - total;
			if (diff > 0) {
				for (let i = 0; i < counts.length && diff > 0; i++) { counts[i]++; diff--; }
			} else {
				for (let i = counts.length - 1; i >= 0 && diff < 0; i--) {
					if (counts[i] > 1) { counts[i]--; diff++; }
				}
			}
		}

		// finding prey for player
		let preyIndexes: number[] = [1, 2]; // default
		if (options?.playerSpecies) {
			const playerIdx = findGroupIndex(options.playerSpecies);
			if (playerIdx >= 0) {
				const depth = options.preyDepth ?? 1; 
				preyIndexes = [];
				for (let d = 1; d <= depth; d++) {
					const idx = playerIdx - d;
					if (idx >= 0) preyIndexes.push(idx);
				}
				// Edge case: herbivores (playerIdx===1) => producers
				// If player is a producer (playerIdx===0) => no prey floors applied.
			}
		}

		// making sure i have a min num of eatable prey for player
		const minPreyPerGroup = Math.max(
			1,
			options?.minPreyPerGroup ?? Math.floor(num_npcs * 0.08)
		);

		for (const idx of preyIndexes) {
			if (idx < 0 || idx >= counts.length) continue;
			if (counts[idx] < minPreyPerGroup) {
				let deficit = minPreyPerGroup - counts[idx];

				// Prefer pulling from higher trophic levels first (keeps bottom heavy)
				for (let donor = counts.length - 1; donor >= 0 && deficit > 0; donor--) {
					if (donor === idx) continue;
					if (counts[donor] > 1 && donor !== 0) { // keep producers and each group >=1
						const take = Math.min(deficit, counts[donor] - 1);
						counts[donor] -= take;
						counts[idx] += take;
						deficit -= take;
					}
				}
				// Last resort: borrow from producers (keep >=1)
				if (deficit > 0 && counts[0] > 1) {
					const take = Math.min(deficit, counts[0] - 1);
					counts[0] -= take;
					counts[idx] += take;
				}
			}
		}

		// Build NPCs
		const npcs: NPC[] = [];
		for (let i = 0; i < groups.length; i++) {
			for (let j = 0; j < counts[i]; j++) {
				const group = groups[i];
				const species = group[Math.floor(Math.random() * group.length)];
				npcs.push(new NPC(species));
			}
		}
		return npcs;
	}
}
