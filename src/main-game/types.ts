// Continuous-world types: walls are polygons in pixel coordinates.
export interface Point {
    x: number;
    y: number;
}

export interface Wall {
    id: string;
    points: Point[]; // polygon points in world coordinates
}

export interface Cell {
    x: number;
    y: number;
    visited: boolean;
    walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
}

export interface MapConfig {
    width: number; // world width in pixels
    height: number; // world height in pixels
    wallCount?: number; // number of random polygonal walls
    wallMinRadius?: number; // min size of wall polys
    wallMaxRadius?: number; // max size of wall polys
    backgroundImageKey?: string;
    wallImageKey?: string;
    spacing: number; // min spacing between walls
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
