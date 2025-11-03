import { NPCModel } from './NPCModel';
import { NPCView } from './NPCView';
import { MapModel } from '../MapModel';

import { Point, Position, Viewport } from '../types'

/**
 * NPCController manages the locations, animations, and interactions between NPCs
 * It controls the NPCModel which stores the data of each NPC, and the NPCView which displays
 * the NPCs onto the screen
 */
export class NPCController {
    private static SPAWN_RADIUS: number = 50;
    private model: NPCModel;
    private view: NPCView;

    constructor(model: NPCModel, view: NPCView) {
        this.model = model;
        this.view = view;
    }

    public spawn(map_model: MapModel, placedNPCs: Position[]): Position | void {
        const radius = NPCController.SPAWN_RADIUS
        const maxAttempts = 2000;
        const WALL_PADDING = 50;

        const pointInPolygon = (px: number, py: number, poly: Point[]) => {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const xi = poly[i].x, yi = poly[i].y;
                const xj = poly[j].x, yj = poly[j].y;
                const intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi + 0.0) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        };

        const distPointSegmentSq = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
            const vx = bx - ax, vy = by - ay;
            const wx = px - ax, wy = py - ay;
            const c1 = vx * wx + vy * wy;
            if (c1 <= 0) return wx * wx + wy * wy;
            const c2 = vx * vx + vy * vy;
            if (c2 <= c1) {
                const dx = px - bx, dy = py - by;
                return dx * dx + dy * dy;
            }
            const t = c1 / c2;
            const projx = ax + t * vx, projy = ay + t * vy;
            const dx = px - projx, dy = py - projy;
            return dx * dx + dy * dy;
        };

        let attempts = 0;
        let placed = false;

        while (!placed && attempts < maxAttempts) {
            attempts++;
            const x = radius + Math.random() * (map_model.getWidth() - 2 * radius);
            const y = radius + Math.random() * (map_model.getHeight() - 2 * radius);
            let collides = false;

            // --- Check against walls ---
            for (const wall of map_model.getWalls()) {
                const poly: Point[] = (wall as any).points;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (const p of poly) {
                    if (p.x < minX) minX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y > maxY) maxY = p.y;
                }

                if (x < minX - radius || x > maxX + radius ||
                    y < minY - radius || y > maxY + radius ) {
                    continue;
                }

                // inside polygon
                if (pointInPolygon(x, y, poly)) {
                    collides = true;
                    break;
                }

                // near edge
                const rSq = (radius + WALL_PADDING) * (radius + WALL_PADDING);
                for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                    const ax = poly[j].x, ay = poly[j].y;
                    const bx = poly[i].x, by = poly[i].y;
                    const dSq = distPointSegmentSq(x, y, ax, ay, bx, by);
                    if (dSq <= rSq) {
                        collides = true;
                        break;
                    }
                }
                if (collides) break;
            }

            if (!collides) {
                for (const other of placedNPCs) {
                    const dx = other.x - x;
                    const dy = other.y - y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = (2 * radius + WALL_PADDING) * (2 * radius + WALL_PADDING);
                    if (distSq < minDist) {
                        collides = true;
                        break;
                    }
                }
            }

            if (!collides) {
                this.model.setPosition(x, y);
                placedNPCs.push({ x, y });
                placed = true;
            }
            return {x, y};
        }
    }


    public animate(): void {
        this.model.animate();
    }

    public draw(target: CanvasRenderingContext2D | any, viewport: Viewport) {
        this.view.draw(target, viewport, this.model.getPosition(), this.model.getDirection(), this.model.radius);
    }
    
}
