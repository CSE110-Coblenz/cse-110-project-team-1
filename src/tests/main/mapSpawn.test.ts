import { describe, it, expect } from 'vitest';
import { MapModel } from 'src/main-game/MapModel';

describe('MapModel spawn safety', () => {
	it('does not place walls in player spawn area across many random maps', () => {
		const width = 800;
		const height = 600;
		const minW = 20;
		const maxW = 40;
		const runs = 50;

		for (let i = 0; i < runs; i++) {
			const model = new MapModel({
				width,
				height,
				wallCount: 50,
				wallMinWidth: minW,
				wallMaxWidth: maxW,
			});
			const spawnX = Math.floor(width / 2);
			const spawnY = Math.floor(height / 2);
			const margin = maxW + 50;
			const spawnRect = {
				minX: spawnX - margin,
				minY: spawnY - margin,
				maxX: spawnX + margin,
				maxY: spawnY + margin,
			};

			const walls = model.getWalls();
			for (const wall of walls) {
				const bminX = Math.min(...wall.points.map((p) => p.x));
				const bmaxX = Math.max(...wall.points.map((p) => p.x));
				const bminY = Math.min(...wall.points.map((p) => p.y));
				const bmaxY = Math.max(...wall.points.map((p) => p.y));

				const overlaps = !(
					bmaxX < spawnRect.minX ||
					bminX > spawnRect.maxX ||
					bmaxY < spawnRect.minY ||
					bminY > spawnRect.maxY
				);
				expect(overlaps).toBe(false);
			}
		}
	});
});
