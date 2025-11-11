import { Direction } from 'src/main-game/types';
import { MapModel } from 'src/main-game/MapModel';
import { PlayerModel } from 'src/main-game/PlayerModel';

export class NPCModel extends PlayerModel {
	private is_alone = true;
	private timeInSegment = 0;
	private readonly segmentDuration = 2;
	private readonly targetDistance = 40 + Math.random() * 40;
	private distanceTraveled = 0;

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

	public circle() {
		this.direction = this.animation_map.get(this.direction)!;
		const [dx, dy] = NPCModel.DirectionToDelta.get(this.direction)!;
		this.moveBy(dx * this.speed, dy * this.speed);
	}

	public update(map_model: MapModel, deltaSec: number) {
		if (!this.is_alone) return;

		this.timeInSegment += deltaSec;

		if (this.timeInSegment >= this.segmentDuration) {
			this.direction = this.animation_map.get(this.direction)!;
			this.timeInSegment = 0;
			this.distanceTraveled = 0;
			return;
		}

		const [dx, dy] = NPCModel.DirectionToDelta.get(this.direction)!;
		const moveDist = this.speed * deltaSec;

		// stop early if target reached
		if (this.distanceTraveled >= this.targetDistance) return;

		const step = Math.min(moveDist, this.targetDistance - this.distanceTraveled);
		const success = this.tryMove(map_model, dx * step, dy * step);

		if (success) {
			this.distanceTraveled += step;
		} else {
			// collision → change direction immediately
			this.direction = this.animation_map.get(this.direction)!;
			this.timeInSegment = 0;
			this.distanceTraveled = 0;
		}
	}

	private tryMove(map_model: MapModel, dx: number, dy: number): boolean {
		const pos = this.getPosition();
		const nx = pos.x + dx;
		const ny = pos.y + dy;
		const mapW = map_model.getWidth();
		const mapH = map_model.getHeight();
		const r = this.radius;

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
