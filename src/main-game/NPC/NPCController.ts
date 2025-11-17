import { NPCModel } from 'src/main-game/NPC/NPCModel';
import { NPCView } from 'src/main-game/NPC/NPCView';

import { MapModel } from 'src/main-game/MapModel';

import { Position, Viewport, distance } from '../types';

/**
 * NPCController manages the locations, animations, and interactions between NPCs
 * It controls the NPCModel which stores the data of each NPC, and the NPCView which displays
 * the NPCs onto the screen
 */
export class NPCController {
	public static SPAWN_RADIUS: number = 50;
	private model: NPCModel;
	private view: NPCView;

	constructor(model: NPCModel, view: NPCView) {
		this.model = model;
		this.view = view;
	}

	public spawn(map_model: MapModel, existingNPCPositions: Position[]): Position | void {
		const NPC_RADIUS = NPCController.SPAWN_RADIUS;
		const MAX_SPAWN_ATTEMPTS = 2000;

		const isPositionInvalid = (position: Position) => {
			if (map_model.isPointInsideWall(position.x, position.y)) return true;
			for (const npcPosition of existingNPCPositions) {
				if (distance(npcPosition, position) < 2 * NPC_RADIUS) return true;
			}
			return false;
		};

		for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
			const x = NPC_RADIUS + Math.random() * (map_model.getWidth() - 2 * NPC_RADIUS);
			const y = NPC_RADIUS + Math.random() * (map_model.getHeight() - 2 * NPC_RADIUS);
			if (!isPositionInvalid({ x, y })) {
				this.model.setPosition(x, y);
				existingNPCPositions.push({ x, y });
				return { x, y };
			}
		}
	}

	public update(map_model: MapModel, deltaSec: number): void {
		this.model.update(map_model, deltaSec);
	}

	public draw(target: CanvasRenderingContext2D | any, viewport: Viewport) {
		this.view.draw(
			target,
			viewport,
			this.model.getColor(),
			this.model.getPosition(),
			this.model.getViewRadius(),
		);
	}
}
