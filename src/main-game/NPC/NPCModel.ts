import { Direction, Position } from 'src/main-game/types';
import { MapModel } from 'src/main-game/MapModel';
import { EntityModel } from 'src/main-game/EntityModel';

import { Species } from 'src/common/types/Species';

export class NPCModel extends EntityModel {
	private pov_radius: number = 100;

	private timeInSegment = 0;
	private readonly segmentDuration = 2;
	private readonly targetDistance = 40 + Math.random() * 40;
	private distanceTraveled = 0;
	private started_chase: boolean = false;
	protected chase_view_radius: number;

	constructor(species: Species) {
		super(species);
		this.chase_view_radius = this.base_view_radius * 1.5;
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

	private getDirVector(prey_pos: Position, predator_pos: Position): [number, number, number] {
		let dx = prey_pos.x - predator_pos.x;
		let dy = prey_pos.y - predator_pos.y;
		const dist = Math.hypot(dx, dy);
		return [dist, dx / dist, dy / dist];
	}

	public handleSurroundings(surrounding_npcs: any[]): void {
		if (this.isFree()) {
			for (const npc of surrounding_npcs) {
				if (npc.isPreyOf(this)) {
					if (npc.isFree()) {
						this.prey = npc;
						npc.predator = this;
						return;
					}
				} else if (npc.isPredatorOf(this)) {
					if (npc.isFree()) {
						this.predator = npc;
						npc.prey = this;
						return;
					}
				}
			}
		}
	}

	private setColorRadiusNPC(deltaSec: number): void {
		this.setColorAndRadius(deltaSec, this.started_chase);
		if (this.prey && !this.started_chase) {
			this.started_chase = true;
		} else if (!this.prey && !this.got_attacked) {
			this.started_chase = false;
		}
	}

	public update(map_model: MapModel, deltaSec: number): void {
		this.updateAttackCooldown(deltaSec);
		const surrounding = map_model.getEntitiesInArea(
			this.getID(),
			this.getPosition(),
			this.getPOVRadius(),
		);
		// 1. Determine behavior
		if (surrounding.length > 0) {
			if (this.prey && !surrounding.includes(this.prey)) {
				this.clearRelations();
			}
			this.handleSurroundings(surrounding);
		} else {
			this.clearRelations();
		}
		const step = this.speed * deltaSec;
		let dirX = 0,
			dirY = 0,
			dist = 0;
		if (this.prey) {
			[dist, dirX, dirY] = this.getDirVector(this.prey.getPosition(), this.pos);
			if (dist < this.getAttackRange()) {
				this.tryAttack(this.prey);
				return;
			}
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

		this.setColorRadiusNPC(deltaSec);

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
