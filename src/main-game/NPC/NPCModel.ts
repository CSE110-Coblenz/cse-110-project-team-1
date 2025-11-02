import { NPC } from './NPC';
import { Position, Point } from '../types';
import { MapModel } from '../MapModel';

/**
 * NPCModel for storing the locations of each NPC
 * NPC is encapsulated into its own classes, with member functions for movement
 */
export class NPCModel {
    private npcs: NPC[];

    private static PADDING = 50;

    constructor() {
        this.npcs = Array.from({ length: 30 }, () => new NPC());
    }

    public getNPCs() : NPC[] {
        return this.npcs;
    }

    public generateNPCLocations(map_model: MapModel, height: number, width: number, npcRadius: number = NPCModel.PADDING): void {
        const maxAttempts = 2000;
        const WALL_PADDING = 50;
        const placedNPCs: { x: number; y: number }[] = [];

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

        this.npcs.forEach((npc: NPC, index: number) => {
            let attempts = 0;
            let placed = false;

            while (!placed && attempts < maxAttempts) {
                attempts++;
                const x = npcRadius + Math.random() * (width - 2 * npcRadius);
                const y = npcRadius + Math.random() * (height - 2 * npcRadius);
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

                    if (x < minX - npcRadius || x > maxX + npcRadius ||
                        y < minY - npcRadius || y > maxY + npcRadius ) {
                        continue;
                    }

                    // inside polygon
                    if (pointInPolygon(x, y, poly)) {
                        collides = true;
                        break;
                    }

                    // near edge
                    const rSq = (npcRadius + WALL_PADDING) * (npcRadius + WALL_PADDING);
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
                        const minDist = (2 * npcRadius + WALL_PADDING) * (2 * npcRadius + WALL_PADDING);
                        if (distSq < minDist) {
                            collides = true;
                            break;
                        }
                    }
                }

                if (!collides) {
                    npc.position = { x, y };
                    placedNPCs.push({ x, y });
                    placed = true;
                }
            }

            if (!placed) {
                console.warn(`⚠️ Could not place NPC #${index} after ${maxAttempts} attempts.`);
            }
        });
    }



    public getNPCLocations(): Position[]{
        let positions: Position[] = [];
        this.npcs.forEach((npc) => {
            positions.push(npc.getPosition());
        },);
        return positions;
    }

    public isNPCthere(): boolean {
        return true;
    }
}