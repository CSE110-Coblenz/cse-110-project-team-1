import { Position, Direction, DEFAULT_ATTRIBUTES } from './types';
import { Species } from '../common/types/Species';
import { IDGenerator } from './IDGenerator';

export class EntityModel {
	protected static DEFAULT_ADVANCE = 24;
	protected direction: Direction;
	protected pos: Position;
	protected view_radius: number;
	protected speed: number;
	protected health: number;
	public predator: EntityModel | null;
	public prey: EntityModel | null;
	protected damage: number;
	protected species: Species;
	protected id: string;
	public dirX: number;
	public dirY: number;

	public attackRange = 5;
	private attackCooldown = 0;
	private attackCooldownMax = 1; // seconds between attacks

	constructor(
		x = 0,
		y = 0,
		view_radius = DEFAULT_ATTRIBUTES.radius,
		speed = DEFAULT_ATTRIBUTES.speed,
		health = DEFAULT_ATTRIBUTES.health,
		damage = DEFAULT_ATTRIBUTES.damage,
		species = DEFAULT_ATTRIBUTES.species,
	) {
		this.pos = { x, y };
		this.speed = speed;
		this.health = health;
		this.damage = damage;
		this.species = species;
		this.view_radius = view_radius;
		this.direction = Direction.Up;
		this.id = IDGenerator.createUniqueHash();
		this.dirX = 0;
		this.dirY = 0;
		this.predator = null;
		this.prey = null;
	}

	public getID(): string {
		return this.id;
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

	public getDirection(): number {
		return this.direction;
	}

	public setDirection(direction: Direction) {
		this.direction = direction;
	}

	public getViewRadius(): number {
		return this.view_radius;
	}

	public tryAttack(prey_model: EntityModel, deltaSec: number): void {
		if (this.attackCooldown <= 0) {
			console.log('We are attackking a prey');
			prey_model.takeDamage(this.damage);
			this.attackCooldown = this.attackCooldownMax;
		}
		if (this.attackCooldown > 0) this.attackCooldown -= deltaSec;
	}

	public isPrey(other_entity_model: EntityModel): boolean {
		return true;
	}

	public isPredator(other_entity_model: EntityModel): boolean {
		return true;
	}

	public takeDamage(damage: number): void {
		this.health -= damage;
		if (this.health < 0) this.die();
	}

	public die(): void {
		return;
	}
}
