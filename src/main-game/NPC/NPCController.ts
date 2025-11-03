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

    public spawn(map: MapModel, existingNPCPositions: Position[]): Position | void {
        const NPC_RADIUS = NPCController.SPAWN_RADIUS;
        const MAX_SPAWN_ATTEMPTS = 2000;
        const WALL_CLEARANCE = 50; // distance from walls

        // Check if a point is inside a polygon
        const isPointInsidePolygon = (pointX: number, pointY: number, polygon: Point[]) => {
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const { x: currentX, y: currentY } = polygon[i];
                const { x: prevX, y: prevY } = polygon[j];
                const intersect = ((currentY > pointY) !== (prevY > pointY)) &&
                                (pointX < (prevX - currentX) * (pointY - currentY) / (prevY - currentY) + currentX);
                if (intersect) inside = !inside;
            }
            return inside;
        };

        // Squared distance from a point to a line segment
        const squaredDistancePointToSegment = (pointX: number, pointY: number, segStartX: number, segStartY: number, segEndX: number, segEndY: number) => {
            const segmentVecX = segEndX - segStartX;
            const segmentVecY = segEndY - segStartY;
            const pointVecX = pointX - segStartX;
            const pointVecY = pointY - segStartY;
            const projection = segmentVecX * pointVecX + segmentVecY * pointVecY;
            if (projection <= 0) return pointVecX**2 + pointVecY**2;
            const segmentLengthSquared = segmentVecX**2 + segmentVecY**2;
            if (projection >= segmentLengthSquared) return (pointX - segEndX)**2 + (pointY - segEndY)**2;
            const t = projection / segmentLengthSquared;
            const closestX = segStartX + t * segmentVecX;
            const closestY = segStartY + t * segmentVecY;
            return (pointX - closestX)**2 + (pointY - closestY)**2;
        };

        // Check if candidate position collides with walls or other NPCs
        const isPositionInvalid = (candidateX: number, candidateY: number) => {
            // --- Check walls ---
            for (const wall of map.getWalls()) {
                const wallPolygon: Point[] = (wall as any).points;
                const xValues = wallPolygon.map(p => p.x);
                const yValues = wallPolygon.map(p => p.y);
                const minX = Math.min(...xValues), maxX = Math.max(...xValues);
                const minY = Math.min(...yValues), maxY = Math.max(...yValues);

                // Quick bounding-box check
                if (candidateX < minX - NPC_RADIUS || candidateX > maxX + NPC_RADIUS ||
                    candidateY < minY - NPC_RADIUS || candidateY > maxY + NPC_RADIUS) continue;

                // Inside polygon?
                if (isPointInsidePolygon(candidateX, candidateY, wallPolygon)) return true;

                // Too close to wall edges?
                const minDistanceToEdgeSquared = (NPC_RADIUS + WALL_CLEARANCE)**2;
                for (let i = 0, j = wallPolygon.length - 1; i < wallPolygon.length; j = i++) {
                    if (squaredDistancePointToSegment(
                        candidateX, candidateY,
                        wallPolygon[j].x, wallPolygon[j].y,
                        wallPolygon[i].x, wallPolygon[i].y
                    ) <= minDistanceToEdgeSquared) return true;
                }
            }

            // --- Check other NPCs ---
            const minDistanceToOtherNPCsSquared = (2 * NPC_RADIUS + WALL_CLEARANCE)**2;
            for (const otherNPC of existingNPCPositions) {
                const deltaX = otherNPC.x - candidateX;
                const deltaY = otherNPC.y - candidateY;
                if ((deltaX**2 + deltaY**2) < minDistanceToOtherNPCsSquared) return true;
            }

            return false;
        };

        // --- Main spawn loop ---
        for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
            const candidateX = NPC_RADIUS + Math.random() * (map.getWidth() - 2 * NPC_RADIUS);
            const candidateY = NPC_RADIUS + Math.random() * (map.getHeight() - 2 * NPC_RADIUS);

            if (!isPositionInvalid(candidateX, candidateY)) {
                this.model.setPosition(candidateX, candidateY);
                existingNPCPositions.push({ x: candidateX, y: candidateY });
                return { x: candidateX, y: candidateY };
            }
        }
    }


    public animate(): void {
        this.model.animate();
    }

    public draw(target: CanvasRenderingContext2D | any, viewport: Viewport) {
        this.view.draw(target, viewport, this.model.getPosition(), this.model.getDirection(), this.model.radius);
    }
    
}
