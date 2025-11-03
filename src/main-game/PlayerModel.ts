import { Position, Species, Direction, DEFAULT_ATTRIBUTES } from './types';

export class PlayerModel {

    protected static DEFAULT_ADVANCE = 24;
    protected direction: Direction;
    protected pos: Position;
    public radius: number;
    protected speed: number;
    protected health: number;
    protected species: Species;

    constructor(x = 0, y = 0, radius = DEFAULT_ATTRIBUTES.radius, 
                                speed = DEFAULT_ATTRIBUTES.speed, 
                                health = DEFAULT_ATTRIBUTES.health, 
                                species = DEFAULT_ATTRIBUTES.species) {
        this.pos = { x, y };
        this.radius = radius;
        this.speed = speed;
        this.health = health;
        this.species = species;
        this.direction = Direction.Up;
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

    public getSpecies(): Species {
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

    public getDirection(){
        return this.direction;
    }

    public setDirection(direction: Direction){
        this.direction = direction;
    }
}
