<<<<<<< HEAD
import { NPCView } from './NPCView';
import { NPCModel } from './NPCModel';
import { NPCController } from './NPCController';
import {
	ALL_SPECIES,
	Species,
	PRODUCERS,
	PRIMARY_CONSUMERS,
	SECONDARY_CONSUMERS,
	TERTIARY_CONSUMERS,
	APEX_PREDATORS,
} from '../../../src/common/types/Species';
=======
import { NPCView } from 'src/main-game/NPC/NPCView';
import { NPCModel } from 'src/main-game/NPC/NPCModel';
import { NPCController } from 'src/main-game/NPC/NPCController';
import { ALL_SPECIES, Species } from 'src/common/types/Species';
>>>>>>> main

export class NPC {
	private readonly model: NPCModel;
	private readonly view: NPCView;
	private readonly controller: NPCController;

	public constructor(species: Species) {
		this.model = new NPCModel(species);
		this.view = new NPCView();
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
			() => PRODUCERS[Math.floor(Math.random() * PRODUCERS.length)],
		);
		let npcs: NPC[] = [];
		for (const species of species_list) {
			npcs.push(new NPC(species));
		}
		return npcs;
	}

	// Create a fair, realistic ecosystem of NCPs
	// Fewer NPCs of each group as we go up trophic chain
	static createFairSpreadNPCs(num_npcs: number): NPC[] {
		if (num_npcs % 5 !== 0) {
			throw new Error('Number of NPCs must be divisible by 5');
		}

		// Define all groups in ascending order of the food chain
		const groups = [
			PRODUCERS,
			PRIMARY_CONSUMERS,
			SECONDARY_CONSUMERS,
			TERTIARY_CONSUMERS,
			APEX_PREDATORS,
		];
		const distribution = [10, 6, 4, 3, 2];
		const scale = num_npcs / 25;

		let npcs: NPC[] = [];

		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			const count = Math.round(distribution[i] * scale); // scaled count per group

			for (let j = 0; j < count; j++) {
				// Pick a random species within the group
				const species = group[Math.floor(Math.random() * group.length)];
				npcs.push(new NPC(species));
			}
		}

		return npcs;
	}
}
