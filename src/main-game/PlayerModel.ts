import { Position } from './types';

const DEFAULT_ATTRIBUTES = {
    radius: 12,
    speed: 500,
    health: 100,
    species: 'none',
};

export class PlayerModel {
    private pos: Position;
    public radius: number;
    private speed: number;
    private health: number;
    private species: string;

    constructor(x = 0, y = 0, radius = DEFAULT_ATTRIBUTES.radius, speed = DEFAULT_ATTRIBUTES.speed, health = DEFAULT_ATTRIBUTES.health, species = DEFAULT_ATTRIBUTES.species) {
        this.pos = { x, y };
        this.radius = radius;
        this.speed = speed;
        this.health = health;
        this.species = species;
    }

    public getPosition(): Position {
        return { ...this.pos };
    }

    public getSpeed(): number {
        return this.speed;
    }

    public getHealth(): number {
        return this.health;
    }

    public getSpecies(): string {
        return this.species;
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }

    public setHealth(health: number) {
        this.health = health;
    }

    public setPosition(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
    }

    public moveBy(dx: number, dy: number) {
        this.pos.x += dx;
        this.pos.y += dy;
    }
}
