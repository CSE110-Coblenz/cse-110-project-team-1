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

export enum Direction {
	Up = 0,
	Down = 1,
	Left = 2,
	Right = 3,
}

export function distance(a: Position, b: Position): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.hypot(dx, dy);
}

// export colorUtils = {
//     hexToRgb: (hex: string): [number, number, number] =>
//         [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)],
//     rgbToHex: (r:number,g:number,b:number) =>
//         `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`
// };
