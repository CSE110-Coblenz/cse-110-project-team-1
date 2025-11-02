import { MapConfig, Wall, Point, Position, Cell, Viewport } from './types';

/**
 * MapModel for a continuous open world where walls are polygonal shapes.
 * It generates non-overlapping-ish polygons and exposes queries for walls in a viewport.
 */
export class MapModel {
    private width: number;
    private height: number;
    private walls: Wall[] = [];
    private viewport: Viewport = { x: 0, y: 0, width: 0, height: 0 };

    // static defaults
    public static DEFAULT_WALL_COUNT = 40;
    public static DEFAULT_WALL_MIN_RADIUS = 20;
    public static DEFAULT_WALL_MAX_RADIUS = 120;

    constructor(config: MapConfig) {
        this.width = config.width;
        this.height = config.height;

        const spacing = config.spacing ?? 80;
        const count = config.wallCount ?? MapModel.DEFAULT_WALL_COUNT;
        const minR = config.wallMinRadius ?? MapModel.DEFAULT_WALL_MIN_RADIUS;
        const maxR = config.wallMaxRadius ?? MapModel.DEFAULT_WALL_MAX_RADIUS;
        this.generateWalls(this.width, this.height, count, spacing);
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

    private getUnvisitedNeighbors(
        cell: Cell,
        grid: Cell[][],
        cols: number,
        rows: number
        ): Cell[] {
        const neighbors: Cell[] = [];
        const { x, y } = cell;

        if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]);
        if (x < cols - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]);
        if (y < rows - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]);
        if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]);

        return neighbors;
    }

    private removeWall(a: Cell, b: Cell) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;

        if (dx === 1) {
            a.walls.right = false;
            b.walls.left = false;
        } else if (dx === -1) {
            a.walls.left = false;
            b.walls.right = false;
        } else if (dy === 1) {
            a.walls.bottom = false;
            b.walls.top = false;
        } else if (dy === -1) {
            a.walls.top = false;
            b.walls.bottom = false;
        }
    }

    private makeRectWall(p1: Point, p2: Point, thickness = 20): Wall {
        // Create a thin rectangle between p1 and p2
        if (p1.y === p2.y) {
            // Horizontal wall
            return {
                id: "hi",
                points: [
                    { x: p1.x, y: p1.y - thickness / 2 },
                    { x: p2.x, y: p2.y - thickness / 2 },
                    { x: p2.x, y: p2.y + thickness / 2 },
                    { x: p1.x, y: p1.y + thickness / 2 }
                ]
            };
        } else {
            // Vertical wall
            return {
                id: "hi",
                points: [
                    { x: p1.x - thickness / 2, y: p1.y },
                    { x: p1.x + thickness / 2, y: p1.y },
                    { x: p2.x + thickness / 2, y: p2.y },
                    { x: p2.x - thickness / 2, y: p2.y }
                ]
            };
        }
    }


    private generateWalls(width: number, height: number, minWalls: number, minSpacing: number): void {
        const cellSize = Math.max(minSpacing, 120);
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);

        // Step 1: Initialize grid
        const grid: Cell[][] = [];
        for (let y = 0; y < rows; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < cols; x++) {
            row.push({
                x,
                y,
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true }
            });
            }
            grid.push(row);
        }

        // Step 2: Recursive DFS for connectivity
        const stack: Cell[] = [];
        const start = grid[0][0];
        start.visited = true;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack.pop()!;
            const neighbors = this.getUnvisitedNeighbors(current, grid, cols, rows);

            if (neighbors.length > 0) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.removeWall(current, next);
            next.visited = true;
            stack.push(next);
            }
        }

        // Step 3: Generate wall rectangles from cell walls
        const walls: Wall[] = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
            const cell = grid[y][x];
            const x0 = x * cellSize;
            const y0 = y * cellSize;
            const x1 = x0 + cellSize;
            const y1 = y0 + cellSize;
            const openBias = Math.random() < 0.2;

            if (cell.walls.top && !openBias)
                walls.push(this.makeRectWall({ x: x0, y: y0 }, { x: x1, y: y0 }));
            if (cell.walls.right && !openBias)
                walls.push(this.makeRectWall({ x: x1, y: y0 }, { x: x1, y: y1 }));
            if (cell.walls.bottom && !openBias)
                walls.push(this.makeRectWall({ x: x0, y: y1 }, { x: x1, y: y1 }));
            if (cell.walls.left && !openBias)
                walls.push(this.makeRectWall({ x: x0, y: y0 }, { x: x0, y: y1 }));
            }
        }

        this.walls = walls.slice(0, Math.max(walls.length, minWalls));;
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
