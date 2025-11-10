import { Direction } from '../types';
import { MapModel } from '../MapModel';
import { EntityModel } from '../EntityModel';

import { Species } from '../../common/types/Species';

export class NPCModel extends EntityModel {
	private is_alone = true;
	private pov_radius: number = 0;
	private hunger: number = 0;
	//public predator: EntityModel | null;
	private isEscaping: boolean;
	//public prey: EntityModel | null;
	private isChasing: boolean;
	// private attackRange = 5;
	// private attackCooldown = 0;
	// private attackCooldownMax = 1; // seconds between attacks
	//private damage = 10;

	private timeInSegment = 0;
	private readonly segmentDuration = 2;
	private readonly targetDistance = 40 + Math.random() * 40;
	private distanceTraveled = 0;

	constructor(species: Species) {
		super();
		this.pov_radius = 300;
		this.predator = null;
		this.prey = null;
		this.isEscaping = false;
		this.isChasing = false;
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

	private dirToward(target: EntityModel): [number, number] {
		const pos = this.getPosition();
		const tpos = target.getPosition();
		let dx = tpos.x - pos.x;
		let dy = tpos.y - pos.y;
		const dist = Math.hypot(dx, dy);
		if (dist < 1e-3) return [0, 0]; // already at the target
		return [dx / dist, dy / dist];
	}

	private pushInward(map: MapModel): [number, number] {
		const r = this.view_radius;
		const x = this.pos.x;
		const y = this.pos.y;
		const w = map.getWidth();
		const h = map.getHeight();

		let ix = 0;
		let iy = 0;

		if (x - r < 0)
			ix = 1; // too far left → push right
		else if (x + r > w) ix = -1; // too far right → push left

		if (y - r < 0)
			iy = 1; // too high → push down
		else if (y + r > h) iy = -1; // too low → push up

		return [ix, iy];
	}

	private fleeFrom(predator: EntityModel, map: MapModel, deltaSec: number): void {
		const move = this.speed * deltaSec;

		// Step 1: main escape vector
		const dx = this.pos.x - predator.getPosition().x;
		const dy = this.pos.y - predator.getPosition().y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < 0.0001) return;

		let ux = dx / dist;
		let uy = dy / dist;

		// Step 2: try moving directly away
		if (this.tryMove(map, ux * move, uy * move)) return;

		// Step 3: blocked → try steep rotated vectors (±60°)
		const angles = [Math.PI / 3, -Math.PI / 3]; // 60 degrees
		for (const angle of angles) {
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);
			const rx = ux * cos - uy * sin;
			const ry = ux * sin + uy * cos;
			if (this.tryMove(map, rx * move, ry * move)) return;
		}

		const [ix, iy] = this.pushInward(map);
		if (ix !== 0 || iy !== 0) {
			this.tryMove(map, ix * move, iy * move);
		}
	}

	public handleSurroundings(surrounding_npcs: any[]): void {
		if (!this.isChasing && !this.isEscaping) {
			for (const npc of surrounding_npcs) {
				if (npc.isPrey(this)) {
					if (Math.random() < 0.5 && !npc.predator) {
						this.isChasing = true;
						this.prey = npc;
						npc.predator = this;
						return;
					}
				} else if (npc.isPredator(this)) {
					if (Math.random() < 0.5 && !npc.prey) {
						this.isEscaping = true;
						this.predator = npc;
						npc.prey = this;
						return;
					}
				}
			}
		}
	}

	public update(map_model: MapModel, deltaSec: number): void {
		const surrounding = map_model.getEntitiesInArea(this);

		// 1. Determine behavior
		if (surrounding.length > 0) this.handleSurroundings(surrounding);
		else {
			this.isChasing = false;
			if (this.prey) this.prey.predator = null;
			this.prey = null;
			this.isEscaping = false;
			if (this.predator) this.predator.prey = null;
			this.predator = null;
		}

		if (this.isChasing && this.prey) {
			const dist = Math.hypot(
				this.prey.getPosition().x - this.pos.x,
				this.prey.getPosition().y - this.pos.y,
			);

			if (dist < this.attackRange) return this.tryAttack(this.prey, deltaSec);
			[this.dirX, this.dirY] = this.dirToward(this.prey);
		} else if (this.isEscaping && this.predator) {
			this.fleeFrom(this.predator, map_model, deltaSec);
			return;
		} else {
			this.timeInSegment += deltaSec;
			if (this.timeInSegment >= this.segmentDuration) {
				this.direction = this.animation_map.get(this.direction)!;
				this.timeInSegment = 0;
				this.distanceTraveled = 0;
			}
			if (this.distanceTraveled < this.targetDistance) {
				[this.dirX, this.dirY] = NPCModel.DirectionToDelta.get(this.direction)!;
			} else return;
		}

		const step = this.speed * deltaSec;
		const success = this.tryMove(map_model, this.dirX * step, this.dirY * step);

		if (success && !this.isChasing && !this.isEscaping) {
			this.distanceTraveled += step;
		}
	}

	private tryMove(map_model: MapModel, dx: number, dy: number): boolean {
		const pos = this.getPosition();
		const nx = pos.x + dx;
		const ny = pos.y + dy;
		const mapW = map_model.getWidth();
		const mapH = map_model.getHeight();
		const r = this.view_radius;

		if (nx - r < 0 || ny - r < 0 || nx + r > mapW || ny + r > mapH) return false;

		const offsets = [
			[0, 0],
			[r * 0.7, 0],
			[-r * 0.7, 0],
			[0, r * 0.7],
			[0, -r * 0.7],
		];
		for (const [ox, oy] of offsets) {
			if (map_model.isPointInsideWall(Math.floor(nx + ox), Math.floor(ny + oy))) return false;
		}

		this.setPosition(nx, ny);
		return true;
	}
}
