import { MapConfig, Wall, Point, Position } from './types';

/**
 * MapModel for a continuous open world where walls are polygonal shapes.
 * It generates non-overlapping-ish polygons and exposes queries for walls in a viewport.
 */
export class MapModel {
    private width: number;
    private height: number;
    private walls: Wall[] = [];

    private seededRandom: (() => number) | null = null;

    constructor(config: MapConfig) {
        this.width = config.width;
        this.height = config.height;

        if (config.seed !== undefined) {
            this.seededRandom = this.xorshiftSeed(config.seed);
        }

        const count = config.wallCount ?? 40;
        const minR = config.wallMinRadius ?? 20;
        const maxR = config.wallMaxRadius ?? 120;
        this.generateWalls(count, minR, maxR);
    }

    private rand() {
        if (this.seededRandom) return this.seededRandom();
        return Math.random();
    }

    private xorshiftSeed(seed: number) {
        let x = seed || 123456789;
        return function () {
            x ^= x << 13;
            x ^= x >> 17;
            x ^= x << 5;
            return (x < 0 ? ~x + 1 : x) % 1000000 / 1000000;
        };
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

    private overlapsBBox(a: { minX: number; minY: number; maxX: number; maxY: number },
        b: { minX: number; minY: number; maxX: number; maxY: number }) {
        return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
    }

    private generatePolygon(cx: number, cy: number, radius: number, verts: number): Point[] {
        const pts: Point[] = [];
        const jitter = 0.4; // irregularity
        for (let i = 0; i < verts; i++) {
            const angle = (i / verts) * Math.PI * 2 + (this.rand() - 0.5) * 0.3;
            const r = radius * (1 - jitter * this.rand());
            pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        return pts;
    }

    private generateWalls(count: number, minR: number, maxR: number) {
        const walls: Wall[] = [];
        const maxAttempts = count * 8 + 200;
        let attempts = 0;
        while (walls.length < count && attempts < maxAttempts) {
            attempts++;
            const cx = Math.floor(this.rand() * this.width);
            const cy = Math.floor(this.rand() * this.height);
            const radius = minR + Math.floor(this.rand() * (maxR - minR));
            const verts = 3 + Math.floor(this.rand() * 5);
            const pts = this.generatePolygon(cx, cy, radius, verts);

            // bbox
            const bbox = this.bboxOfPoints(pts);

            // ensure inside world bounds with a margin
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
            return this.overlapsBBox(b, region);
        });
    }

    public getWidth() { return this.width; }
    public getHeight() { return this.height; }

    // simple point-in-polygon test for walkability/collision
    public isPointInsideWall(px: number, py: number) {
        for (const wall of this.walls) {
            if (this.pointInPolygon({ x: px, y: py }, wall.points)) return true;
        }
        return false;
    }

    private pointInPolygon(point: Point, vs: Point[]) {
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i].x, yi = vs[i].y;
            const xj = vs[j].x, yj = vs[j].y;
            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 0.0000001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
}
