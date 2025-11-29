import { MapConfig, Wall, Position, Viewport, distance } from 'src/main-game/types';
import { NPC } from 'src/main-game/NPC/NPC';
import { PlayerModel } from 'src/main-game/PlayerModel';
import { EntityModel } from 'src/main-game/EntityModel';
import Konva from 'konva';

export class MapModel {
	private width: number;
	private height: number;
	private walls: Wall[] = [];
	private viewport: Viewport = { x: 0, y: 0, width: 0, height: 0 };
	private npcs: NPC[] = [];
	private npc_models: EntityModel[] = [];
	public main_player: EntityModel | null = null;

	// static defaults
	public static DEFAULT_SPACING = 80;
	public static DEFAULT_WALL_COUNT = 40;
	public static DEFAULT_WALL_MIN_WIDTH = 110;
	public static DEFAULT_WALL_MAX_WIDTH = 120;
	public static ENTITY_PAD = 15;

	constructor(config: MapConfig) {
		this.width = config.width;
		this.height = config.height;

		const spacing = config.spacing ?? MapModel.DEFAULT_SPACING;
		const count = config.wallCount ?? MapModel.DEFAULT_WALL_COUNT;
		const minWidth = config.wallMinWidth ?? MapModel.DEFAULT_WALL_MIN_WIDTH;
		const maxWidth = config.wallMaxWidth ?? MapModel.DEFAULT_WALL_MAX_WIDTH;
		this.generateWalls(this.width, this.height, minWidth, maxWidth, count, spacing);
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
		const spawnX = Math.floor(this.getWidth() / 2);
		const spawnY = Math.floor(this.getHeight() / 2);

		while (walls.length < count && attempts < maxAttempts) {
			attempts++;
			// const r = Math.random();
			// const aspect = r < 1 / 3 ? 2 : r < 2 / 3 ? 3 : 4;

			const r = Math.random() < 0.5;
			const aspect = r ? 2 : 3;

			const longSide = randInRange(minWidth, maxWidth);
			const shortSide = longSide / aspect;

			const horizontal = Math.random() < 0.5;
			const rock_or_wood = Math.random() < 0.5;

			const file = rock_or_wood ? `obstacles/wall.png` : `obstacles/rock.png`;

			const w = horizontal ? longSide : shortSide;
			const h = horizontal ? shortSide : longSide;

			const x = randInRange(spacing, width - w - spacing);
			const y = randInRange(spacing, height - h - spacing);

			// check if wall is in player spawn area
			if (
				x < spawnX + maxWidth + 50 &&
				x + w > spawnX - maxWidth - 50 &&
				y < spawnY + maxWidth + 50 &&
				y + h > spawnY - maxWidth - 50
			) {
				continue; //go to next attempt
			}

			const img = new Image();
			img.src = file;

			const konvaImage = new Konva.Image({
				image: img,
				x: x,
				y: y,
				width: w,
				height: h,
				listening: false,
			});

			const newWall: Wall = {
				id: `wall_${walls.length}`,
				points: [
					{ x, y },
					{ x: x + w, y },
					{ x: x + w, y: y + h },
					{ x, y: y + h },
				],
				minX: x,
				minY: y,
				maxX: x + w,
				maxY: y + h,
				image: konvaImage,
			};

			const overlap = walls.some((wall) => {
				return this.overlaps(
					{
						minX: newWall.minX - spacing,
						minY: newWall.minY - spacing,
						maxX: newWall.maxX + spacing,
						maxY: newWall.maxY + spacing,
					},
					{ minX: wall.minX, minY: wall.minY, maxX: wall.maxX, maxY: wall.maxY },
				);
			});

			if (!overlap) walls.push(newWall);
		}

		this.walls = walls;
	}

	public setMainPlayer(player_model: PlayerModel) {
		this.main_player = player_model;
	}

	public setNPCs(npcs: NPC[]) {
		this.npcs = npcs;
		const newModels: EntityModel[] = [];
		for (const npc of npcs) {
			const model = npc.getModel();
			newModels.push(model);

			model.onDead(() => {
				this.removeNPC(npc);
			});
		}
		this.npc_models = this.npc_models.concat(newModels);
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
			return this.overlaps(
				{ minX: wall.minX, minY: wall.minY, maxX: wall.maxX, maxY: wall.maxY },
				region,
			);
		});
	}

	public getWidth() {
		return this.width;
	}

	public getHeight() {
		return this.height;
	}

	public isPointInsideWall(px: number, py: number) {
		for (const wall of this.walls) {
			const minX = wall.minX - MapModel.ENTITY_PAD;
			const maxX = wall.maxX + MapModel.ENTITY_PAD;
			const minY = wall.minY - MapModel.ENTITY_PAD;
			const maxY = wall.maxY + MapModel.ENTITY_PAD;

			if (px >= minX && px <= maxX && py >= minY && py <= maxY) {
				return true;
			}
		}
		return false;
	}

	public getEntitiesInArea(id: string, position: Position, radius: number) {
		const entitiesInArea: EntityModel[] = [];
		for (const entity_model of [...this.npc_models, this.main_player!]) {
			if (entity_model.getID() == id) {
				continue;
			}
			if (distance(entity_model.getPosition(), position) <= radius) {
				entitiesInArea.push(entity_model);
			}
		}
		return entitiesInArea;
	}

	public removeNPC(npc: NPC) {
		const model = npc.getModel();
		this.npcs = this.npcs.filter((n) => n !== npc);
		this.npc_models = this.npc_models.filter((m) => m !== model);
		npc.getView()?.undraw?.();
		(npc.getController() as any)?.dispose?.();
	}
}
