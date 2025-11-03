// Continuous-world types: walls are polygons in pixel coordinates.
export interface Point {
    x: number;
    y: number;
}

export interface Wall {
    id: string;
    points: Point[]; // polygon points in world coordinates
}

export interface MapConfig {
    width: number; // world width in pixels
    height: number; // world height in pixels
    wallCount?: number; // number of random polygonal walls
    wallMinWidth?: number; // min size of wall polys
    wallMaxWidth?: number; // max size of wall polys
    backgroundImageKey?: string;
    wallImageKey?: string;
    spacing?: number; // min spacing between walls
    seed?: number; // optional seed for deterministic generation
}

export interface Viewport {
    x: number; // top-left x in world pixels
    y: number; // top-left y in world pixels
    width: number; // viewport width in pixels
    height: number; // viewport height in pixels
}

export interface Position {
    x: number;
    y: number;
}


import Konva from 'konva';

export abstract class Controller {

}

export const NPC_WIDTH: number = 32;
export const NPC_HEIGHT: number = 32;

export const NPC_RED = '#FF0000'; // red box
export const MAIN_PLAYER_BLUE = '#0000FF'; // red box

export abstract class View {
    protected layer: Konva.Layer;
    protected shapes: Konva.Shape[];

    constructor(layer: Konva.Layer) {
        this.layer = layer;
        this.shapes = [];
    }

    protected destroyShapes(): void {
        for (const shape of this.shapes) {
            shape.remove();
            shape.destroy();
        }
        this.shapes = [];
    }

    protected AddShapes(): void {
        for (const shape of this.shapes) {
            this.layer.add(shape);
        }
    }

    draw(): void{
        this.layer.batchDraw();
    }
}

export enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

export enum Species {
    SPEC1 = "Species 1",
    SPEC2 = "Species 2",
    ANTEATER = "Anteater",
}

export const MaptoNextSpecies = new Map<Species, Species>([
  [Species.SPEC1, Species.SPEC2],
  [Species.SPEC2, Species.ANTEATER],
  [Species.ANTEATER, Species.SPEC1],
]);

export const DEFAULT_ATTRIBUTES = {
    radius: 12,
    speed: 500,
    health: 100,
    species: Species.SPEC1,
};
