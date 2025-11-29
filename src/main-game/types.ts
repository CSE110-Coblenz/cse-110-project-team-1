import Konva from 'konva';

export interface Position {
	x: number;
	y: number;
}

export interface Wall {
	id: string;
	points: Position[]; // polygon points in world coordinates
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	image: Konva.Image;
}

type Listener = (...args: any[]) => void;

export class EventEmitter {
	private listeners: Record<string, Listener[]> = {};

	on(event: string, fn: Listener) {
		this.listeners[event] ||= [];
		this.listeners[event].push(fn);
	}

	emit(event: string, ...args: any[]) {
		(this.listeners[event] || []).forEach((fn) => fn(...args));
	}
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
