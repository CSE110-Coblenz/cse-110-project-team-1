import { MapConfig, Wall, Point, Position, Viewport } from 'src/main-game/types';
import { NPC } from 'src/main-game/NPC/NPC';

/**
 * MapModel for a continuous open world where walls are polygonal shapes.
 * It generates non-overlapping-ish polygons and exposes queries for walls in a viewport.
 */
export class MapModel {
	private width: number;
	private height: number;
	private walls: Wall[] = [];
	private viewport: Viewport = { x: 0, y: 0, width: 0, height: 0 };
	private npcs: NPC[] = [];

	// static defaults
	public static DEFAULT_SPACING = 80;
	public static DEFAULT_WALL_COUNT = 40;
	public static DEFAULT_WALL_MIN_WIDTH = 110;
	public static DEFAULT_WALL_MAX_WIDTH = 120;

	constructor(config: MapConfig) {
		this.width = config.width;
		this.height = config.height;

		const spacing = config.spacing ?? MapModel.DEFAULT_SPACING;
		const count = config.wallCount ?? MapModel.DEFAULT_WALL_COUNT;
		const minWidth = config.wallMinWidth ?? MapModel.DEFAULT_WALL_MIN_WIDTH;
		const maxWidth = config.wallMaxWidth ?? MapModel.DEFAULT_WALL_MAX_WIDTH;
		this.generateWalls(this.width, this.height, minWidth, maxWidth, count, spacing);
	}

	public bboxOfPoints(points: Point[]) {
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		for (const p of points) {
			if (p.x < minX) minX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.x > maxX) maxX = p.x;
			if (p.y > maxY) maxY = p.y;
		}
		return { minX, minY, maxX, maxY };
	}

	private generateWalls(
		width: number,
		height: number,
		minWidth: number,
		maxWidth: number,
		count: number,
		spacing: number,
	): void {
		const walls: Wall[] = [];
		let attempts = 0;
		const maxAttempts = count * 20;

		const randInRange = (min: number, max: number) => min + Math.random() * (max - min);

		while (walls.length < count && attempts < maxAttempts) {
			attempts++;
			const r = Math.random();
			const aspect = r < 1 / 3 ? 2 : r < 2 / 3 ? 3 : 4;
			const longSide = randInRange(minWidth, maxWidth);
			const shortSide = longSide / aspect;

			const horizontal = Math.random() < 0.5;

			const w = horizontal ? longSide : shortSide;
			const h = horizontal ? shortSide : longSide;

			const x = randInRange(spacing, width - w - spacing);
			const y = randInRange(spacing, height - h - spacing);

			const newWall: Wall = {
				id: `wall_${walls.length}`,
				points: [
					{ x, y },
					{ x: x + w, y },
					{ x: x + w, y: y + h },
					{ x, y: y + h },
				],
			};

			const bbox = {
				minX: x - spacing,
				minY: y - spacing,
				maxX: x + w + spacing,
				maxY: y + h + spacing,
			};
			const overlap = walls.some((wall) => {
				const b = this.bboxOfPoints(wall.points);
				return !(
					bbox.maxX < b.minX ||
					bbox.minX > b.maxX ||
					bbox.maxY < b.minY ||
					bbox.minY > b.maxY
				);
			});

			if (!overlap) walls.push(newWall);
		}

		this.walls = walls;
	}

	public setNCPs(npcs: NPC[]) {
		this.npcs = npcs;
	}

	public getNPCs(): NPC[] {
		return this.npcs;
	}

	public getWalls(): Wall[] {
		return this.walls;
	}

	public getViewport(): Viewport {
		return { ...this.viewport };
	}

	public setViewportSize(width: number, height: number) {
		this.viewport.width = width;
		this.viewport.height = height;
		this.clampViewport();
	}

	public setViewportPosition(x: number, y: number) {
		this.viewport.x = x;
		this.viewport.y = y;
		this.clampViewport();
	}

	public moveViewportBy(dx: number, dy: number) {
		this.viewport.x += dx;
		this.viewport.y += dy;
		this.clampViewport();
	}

	public centerViewportOn(position: Position) {
		this.viewport.x = Math.floor(position.x - this.viewport.width / 2);
		this.viewport.y = Math.floor(position.y - this.viewport.height / 2);
		this.clampViewport();
	}

	private clampViewport() {
		const maxX = Math.max(0, this.width - this.viewport.width);
		const maxY = Math.max(0, this.height - this.viewport.height);
		if (this.viewport.x < 0) this.viewport.x = 0;
		if (this.viewport.y < 0) this.viewport.y = 0;
		if (this.viewport.x > maxX) this.viewport.x = maxX;
		if (this.viewport.y > maxY) this.viewport.y = maxY;
	}

	private overlaps(
		a: { minX: number; minY: number; maxX: number; maxY: number },
		b: { minX: number; minY: number; maxX: number; maxY: number },
	) {
		return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
	}

	public getWallsInRegion(x: number, y: number, w: number, h: number): Wall[] {
		const region = { minX: x, minY: y, maxX: x + w, maxY: y + h };
		return this.walls.filter((wall) => {
			const b = this.bboxOfPoints(wall.points);
			return this.overlaps(b, region);
		});
	}

	public getWidth() {
		return this.width;
	}
	public getHeight() {
		return this.height;
	}

	public isPointInsideWall(px: number, py: number) {
		// since walls are axis-aligned rectangles, test against bbox of each wall
		for (const wall of this.walls) {
			const b = this.bboxOfPoints(wall.points);
			if (px >= b.minX && px <= b.maxX && py >= b.minY && py <= b.maxY) return true;
		}
		return false;
	}
}
