import { Direction, Position } from '../types';
import { MapModel } from '../MapModel';
import { EntityModel } from '../EntityModel';

import { Species } from '../../common/types/Species';

export class NPCModel extends EntityModel {
	private pov_radius: number = 100;

	private timeInSegment = 0;
	private readonly segmentDuration = 2;
	private readonly targetDistance = 40 + Math.random() * 40;
	private distanceTraveled = 0;

	constructor(species: Species) {
		super(species);
	}

	private static NextDirection = new Map<Direction, Direction>([
		[Direction.Up, Direction.Left],
		[Direction.Left, Direction.Down],
		[Direction.Down, Direction.Right],
		[Direction.Right, Direction.Up],
	]);

	private static DirectionToDelta = new Map<Direction, [number, number]>([
		[Direction.Up, [0, 1]], // move up (y decreases)
		[Direction.Down, [0, -1]], // move down (y increases)
		[Direction.Left, [-1, 0]], // move left (x decreases)
		[Direction.Right, [1, 0]], // move right (x increases)
	]);

	private static ReverseNextDirection = new Map<Direction, Direction>([
		[Direction.Up, Direction.Right],
		[Direction.Right, Direction.Down],
		[Direction.Down, Direction.Left],
		[Direction.Left, Direction.Up],
	]);

	private animation_map =
		Math.random() < 0.5 ? NPCModel.NextDirection : NPCModel.ReverseNextDirection;

	public getPOVRadius(): number {
		return this.pov_radius;
	}

	private getDirVector(pos1: Position, pos2: Position): [number, number, number] {
		let dx = pos1.x - pos2.x;
		let dy = pos1.y - pos2.y;
		const dist = Math.hypot(dx, dy);
		if (dist < 1e-3) return [dist, 0, 0]; // already at the target
		return [dist, dx / dist, dy / dist];
	}

	public handleSurroundings(surrounding_npcs: any[]): void {
		if (this.isFree()) {
			for (const npc of surrounding_npcs) {
				if (npc.isPreyOf(this)) {
					if (Math.random() < 0.5 && npc.isFree()) {
						this.prey = npc;
						npc.predator = this;
						return;
					}
				} else if (npc.isPredatorOf(this)) {
					if (Math.random() < 0.5 && npc.isFree()) {
						this.predator = npc;
						npc.prey = this;
						return;
					}
				}
			}
		}
	}

	private clearRelations() {
		if (this.prey) this.prey.predator = null;
		this.prey = null;
		if (this.predator) this.predator.prey = null;
		this.predator = null;
	}

	public update(map_model: MapModel, deltaSec: number): void {
		const surrounding = map_model.getEntitiesInArea(this);
		// 1. Determine behavior
		if (surrounding.length > 0) this.handleSurroundings(surrounding);
		else {
			this.clearRelations();
		}
		const step = this.speed * deltaSec;
		let dirX = 0,
			dirY = 0,
			dist = 0;
		if (this.prey) {
			[dist, dirX, dirY] = this.getDirVector(this.prey.getPosition(), this.pos);
			if (dist < this.attackRange) return this.tryAttack(this.prey, deltaSec);
		} else if (this.predator) {
			[dist, dirX, dirY] = this.getDirVector(this.pos, this.predator.getPosition());
		} else {
			this.timeInSegment += deltaSec;
			if (this.timeInSegment >= this.segmentDuration) {
				this.direction = this.animation_map.get(this.direction)!;
				this.timeInSegment = 0;
				this.distanceTraveled = 0;
			}
			if (this.distanceTraveled < this.targetDistance) {
				[dirX, dirY] = NPCModel.DirectionToDelta.get(this.direction)!;
			} else return;
		}
		const success = this.tryMove(map_model, dirX * step, dirY * step);

		this.setColorAndRadius(deltaSec);

		if (!success && this.predator) {
			const angle = (Math.random() - 0.5) * Math.PI;
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			dirX = dirX * cos - dirY * sin;
			dirX = dirX * sin + dirY * cos;

			if (this.tryMove(map_model, dirX * step, dirX * step)) return;
		}

		if (success && this.isFree()) {
			this.distanceTraveled += step;
		}
	}
}
