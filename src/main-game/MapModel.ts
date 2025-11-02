import { MapConfig, Wall, Point, Position, Viewport, WallTemplate } from './types';

/**
 * MapModel for a continuous open world where walls are polygonal shapes.
 * It generates non-overlapping-ish polygons and exposes queries for walls in a viewport.
 */
export class MapModel {
    private width: number;
    private height: number;
    private walls: Wall[] = [];
    private viewport: Viewport = { x: 0, y: 0, width: 0, height: 0 };
    private grid: Map<string, Wall[]> = new Map(); // spatial hash grid for local overlap checks
    private cellSize = 200; // adjust based on wall size + spacing

    // static defaults
    public static DEFAULT_WALL_COUNT = 40;
    public static DEFAULT_WALL_MIN_RADIUS = 20;
    public static DEFAULT_WALL_MAX_RADIUS = 120;

    // constructor(config: MapConfig) {
    //     this.width = config.width;
    //     this.height = config.height;

    //     const count = config.wallCount ?? MapModel.DEFAULT_WALL_COUNT;
    //     const minR = config.wallMinRadius ?? MapModel.DEFAULT_WALL_MIN_RADIUS;
    //     const maxR = config.wallMaxRadius ?? MapModel.DEFAULT_WALL_MAX_RADIUS;
    //     this.generateWalls(count, minR, maxR);
    // }

    constructor(config: MapConfig) {
        this.width = config.width;
        this.height = config.height;

        const wallTemplates = this.createWallTemplates();
        //const spacing = config.minSpacing ?? 80;
        const spacing = 20;
        const count = config.wallCount ?? 20;

        this.generateWalls(count, spacing, wallTemplates);
    }

    private rand() {
        return Math.random();
    }

    private createWallTemplates(): WallTemplate[] {
    return [
        { name: "rect", points: [{x:0,y:0},{x:60,y:0},{x:60,y:40},{x:0,y:40}], width: 60, height: 40 },
        { name: "L", points: [
            {x:0,y:0},{x:40,y:0},{x:40,y:20},{x:20,y:20},{x:20,y:60},{x:0,y:60}
        ], width: 40, height: 60 },
        { name: "T", points: [{x:0,y:0},{x:80,y:0},{x:80,y:20},{x:50,y:20},{x:50,y:60},{x:30,y:60},{x:30,y:20},{x:0,y:20}], width: 80, height: 60 },
        { name: "upsideT", points: [{x:0,y:0},{x:80,y:0},{x:80,y:20},{x:50,y:20},{x:50,y:60},{x:30,y:60},{x:30,y:20},{x:0,y:20}], width: 80, height: 60 }
    ];
}


    private hashCell(x: number, y: number) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    private addToGrid(wall: Wall) {
        const bbox = this.bboxOfPoints(wall.points);
        const minCellX = Math.floor(bbox.minX / this.cellSize);
        const minCellY = Math.floor(bbox.minY / this.cellSize);
        const maxCellX = Math.floor(bbox.maxX / this.cellSize);
        const maxCellY = Math.floor(bbox.maxY / this.cellSize);

        for (let cx = minCellX; cx <= maxCellX; cx++) {
            for (let cy = minCellY; cy <= maxCellY; cy++) {
                const key = `${cx},${cy}`;
                if (!this.grid.has(key)) this.grid.set(key, []);
                this.grid.get(key)!.push(wall);
            }
        }
    }

    private getNearbyWalls(x: number, y: number): Wall[] {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        const nearby: Wall[] = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cx+dx},${cy+dy}`;
                const walls = this.grid.get(key);
                if (walls) nearby.push(...walls);
            }
        }
        return nearby;
    }

    private generateWalls(count: number, spacing: number, templates: WallTemplate[]) {
        const maxAttempts = count * 10;
        let attempts = 0;

        while (this.walls.length < count && attempts < maxAttempts) {
            attempts++;

            // Random candidate point
            const x = spacing + Math.random() * (this.width - spacing*2);
            const y = spacing + Math.random() * (this.height - spacing*2);

            // Pick a random wall template
            const template = templates[Math.floor(Math.random() * templates.length)];

            // Shift template to candidate position
            const wallPoints = template.points.map(p => ({x: p.x + x, y: p.y + y}));
            const bbox = this.bboxOfPoints(wallPoints);

            // Check bounds
            if (bbox.minX < 0 || bbox.minY < 0 || bbox.maxX > this.width || bbox.maxY > this.height) continue;

            // Check spacing against nearby walls
            const nearby = this.getNearbyWalls(x, y);
            let overlaps = false;
            for (const w of nearby) {
                if (this.bboxOverlap(this.bboxOfPoints(w.points), bbox, spacing)) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) continue;

            // Add wall
            const wall: Wall = { id: `w-${this.walls.length}-${Date.now()}`, points: wallPoints };
            this.walls.push(wall);
            this.addToGrid(wall);
        }
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

    private bboxOverlap(a: {minX:number,minY:number,maxX:number,maxY:number}, 
                        b: {minX:number,minY:number,maxX:number,maxY:number}, spacing: number) {
        return !(a.maxX + spacing < b.minX || a.minX - spacing > b.maxX || a.maxY + spacing < b.minY || a.minY - spacing > b.maxY);
    }

    public getWalls() { return this.walls; }

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

    private overlaps(a: { minX: number; minY: number; maxX: number; maxY: number },
        b: { minX: number; minY: number; maxX: number; maxY: number }) {
        return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
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
