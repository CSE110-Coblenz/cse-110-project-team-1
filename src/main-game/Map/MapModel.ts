import { MapConfig, Wall, Point, Position } from '../types';

/**
 * MapModel for a continuous open world where walls are polygonal shapes.
 * It generates non-overlapping-ish polygons and exposes queries for walls in a viewport.
 */
export class MapModel {
    private width: number;
    private height: number;
    private walls: Wall[] = [];

    constructor(config: MapConfig) {
        this.width = config.width;
        this.height = config.height;

        const count = config.wallCount ?? 40;
        const minR = config.wallMinRadius ?? 20;
        const maxR = config.wallMaxRadius ?? 120;
        this.generateWalls(count, minR, maxR);
    }

    private rand() {
        return Math.random();
    }

    private bboxOfPoints(points: Point[]) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
        }
        return { minX, minY, maxX, maxY };
    }

    private overlaps(a: { minX: number; minY: number; maxX: number; maxY: number },
        b: { minX: number; minY: number; maxX: number; maxY: number }) {
        return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
    }

    // generate an axis-aligned rectangle centered at cx,cy with half-width hw and half-height hh
    private generateRectPoints(cx: number, cy: number, hw: number, hh: number): Point[] {
        return [
            { x: cx - hw, y: cy - hh },
            { x: cx + hw, y: cy - hh },
            { x: cx + hw, y: cy + hh },
            { x: cx - hw, y: cy + hh },
        ];
    }

    private generateWalls(count: number, minR: number, maxR: number) {
        const walls: Wall[] = [];
        const maxAttempts = count * 8 + 200;
        let attempts = 0;
        while (walls.length < count && attempts < maxAttempts) {
            attempts++;
            // pick center within world but leave room for size
            const rectW = minR + Math.floor(this.rand() * (maxR - minR));
            const rectH = minR + Math.floor(this.rand() * (maxR - minR));
            const hw = Math.floor(rectW / 2);
            const hh = Math.floor(rectH / 2);
            const cx = Math.floor(this.rand() * (this.width - rectW)) + hw;
            const cy = Math.floor(this.rand() * (this.height - rectH)) + hh;

            const pts = this.generateRectPoints(cx, cy, hw, hh);

            // bbox
            const bbox = this.bboxOfPoints(pts);

            // ensure inside world bounds
            if (bbox.minX < 0 || bbox.minY < 0 || bbox.maxX > this.width || bbox.maxY > this.height) continue;

            // avoid player's spawn area roughly at center
            const spawnX = Math.floor(this.width / 2);
            const spawnY = Math.floor(this.height / 2);
            const dist = Math.hypot(spawnX - cx, spawnY - cy);
            if (dist < Math.max(80, minR * 2)) continue;

            walls.push({ id: `w-${walls.length}-${Date.now()}`, points: pts });
        }

        this.walls = walls;
    }

    public getWallsInRegion(x: number, y: number, w: number, h: number): Wall[] {
        const region = { minX: x, minY: y, maxX: x + w, maxY: y + h };
        return this.walls.filter(wall => {
            const b = this.bboxOfPoints(wall.points);
            return this.overlaps(b, region);
        });
    }

    public getWidth() { return this.width; }
    public getHeight() { return this.height; }

    public isPointInsideWall(px: number, py: number) {
        // since walls are axis-aligned rectangles, test against bbox of each wall
        for (const wall of this.walls) {
            const b = this.bboxOfPoints(wall.points);
            if (px >= b.minX && px <= b.maxX && py >= b.minY && py <= b.maxY) return true;
        }
        return false;
    }

}
